import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Symbol, Tape } from "@/lib/TuringMachine";

type TuringTapeProps = {
  tape: Tape;
  tapePointer: number;
} & React.ComponentProps<"div">;

export default function TuringTape({ tape, tapePointer, ...props }: TuringTapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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

  const desiredLeft  = tapePointer - half - margin;
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
    if(!lengthChanged) {
      for(let i = 0; i < newWindow.length; i++) {
        if(newWindow[i] !== windowTape[i]) {
          contentChanged = true;
          break;
        }
      }
    }

    if (newStart !== startIndex || lengthChanged || contentChanged) {
      setStartIndex(newStart);
      setWindowTape(newWindow);
    }
  }, [ tapePointer, tape, desiredLeft, desiredRight, startIndex, windowTape ]);

  const pointerIndex = tapePointer - startIndex;
  const translate = (containerSize.width - cellSizePx) / 2 - pointerIndex * cellSizePx;

  return (
    <div {...props} className="flex flex-col w-full flex-1">
      <h3 className="font-semibold border-b mb-1 w-fit">Páska</h3>
      <div ref={containerRef} className="relative overflow-hidden w-full h-8">
        <div className="absolute flex transition-transform duration-300 flex-row" style={{ transform: `translateX(${translate}px)` }}>
          {windowTape.map((cell, idx) => (
            <span key={idx} className={`border inline-flex justify-center items-center w-8 h-8 ${idx === pointerIndex ? 'bg-primary/30 font-semibold' : ''}`}>
              {cell}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
