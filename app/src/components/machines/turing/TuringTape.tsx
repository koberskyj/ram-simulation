import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Symbol, Tape } from "@/lib/TuringMachine";

type TuringTapeProps = {
  tape: Tape;
  tapePointer: number;
  onTapePointerChange?: (newPointer: number) => void;
} & React.ComponentProps<"div">;

export default function TuringTape({ tape, tapePointer, onTapePointerChange, ...props }: TuringTapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const [lastChangedPos, setLastChangedPos] = useState<number | null>(null);
  const prevPointerRef = useRef<number>(tapePointer);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    if (prevPointerRef.current !== tapePointer) {
      setLastChangedPos(null);
    }
    prevPointerRef.current = tapePointer;
  }, [tapePointer]);

  useLayoutEffect(() => {
    if(!containerRef.current) {
      return;
    }
    const observer = new ResizeObserver(entries => {
      for(const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const cellSizePx = 32; // w-8
  const fitCount = containerSize.width ? Math.floor(containerSize.width / cellSizePx) : 1;
  const visibleCount = fitCount % 2 === 0 ? Math.max(fitCount - 1, 1) : fitCount;
  const half = Math.floor(visibleCount / 2);
  const margin = 2;

  const desiredLeft = tapePointer - half - margin;
  const desiredRight = tapePointer + half + margin;

  const [startIndex, setStartIndex] = useState(desiredLeft);
  const [windowTape, setWindowTape] = useState<Symbol[]>(() => {
    const length = desiredRight - desiredLeft + 1;
    return Array.from({ length }, (_, i) => tape.get(desiredLeft + i) ?? '□');
  });

  useEffect(() => {
    let newStart = startIndex;
    let newWindow = [...windowTape];

    if(newStart > desiredLeft) {
      const leftCells: Symbol[] = [];
      for(let i = desiredLeft; i < newStart; i++) {
        leftCells.push(tape.get(i) ?? '□');
      }
      newWindow = [...leftCells, ...newWindow];
      newStart = desiredLeft;
    }

    const currentEnd = newStart + newWindow.length - 1;
    if(currentEnd < desiredRight) {
      const rightCells: Symbol[] = [];
      for(let i = currentEnd + 1; i <= desiredRight; i++) {
        rightCells.push(tape.get(i) ?? '□');
      }
      newWindow = [...newWindow, ...rightCells];
    }

    newWindow = newWindow.map((_, idx) =>
      tape.get(newStart + idx) ?? '□'
    );

    const lengthChanged = newWindow.length !== windowTape.length;
    let contentChanged = false;
    let changedIdx = -1;
    if(!lengthChanged) {
      for(let i = 0; i < newWindow.length; i++) {
        if(newWindow[i] !== windowTape[i]) {
          contentChanged = true;
          changedIdx = i;
        }
      }
    }

    if (newStart !== startIndex || lengthChanged || contentChanged) {
      setStartIndex(newStart);
      setWindowTape(newWindow);
      if (contentChanged && changedIdx >= 0) {
        setLastChangedPos(newStart + changedIdx);
      }
    }
  }, [ tapePointer, tape, desiredLeft, desiredRight, startIndex, windowTape ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if(!isDragging) {
      return;
    }
    setDragOffset(e.clientX - dragStartX);
  };
  const handleMouseUp = () => {
    if(!isDragging) {
      return;
    }
    setIsDragging(false);
    const deltaCells = -Math.round(dragOffset / cellSizePx);
    if(deltaCells !== 0 && onTapePointerChange) {
      onTapePointerChange(tapePointer + deltaCells);
    }
    setDragOffset(0);
  };

  const pointerIndex = tapePointer - startIndex;
  const baseTranslate = (containerSize.width - cellSizePx) / 2 - pointerIndex * cellSizePx;
  const totalTranslate = baseTranslate + dragOffset;

  return (
    <div {...props}>
      <h3 className="font-semibold w-fit">Páska</h3>
      <div ref={containerRef} className="relative overflow-hidden w-full h-8 cursor-grab" 
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div className={`absolute flex flex-row ${!isDragging ? 'transition-transform duration-300' : ''}`} 
          style={{ transform: `translateX(${totalTranslate}px)` }}>
          {windowTape.map((cell, idx) => {
            const absIndex = startIndex + idx;
            const isPointer = idx === pointerIndex;
            const isLastChanged = absIndex === lastChangedPos;
            return (
              <span key={idx} className={`border inline-flex justify-center items-center w-8 h-8
                  ${isPointer ? 'bg-primary/30 font-semibold' : ''} ${isLastChanged ? '' : ''}`}>
                {cell}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
