import { InstructionSet } from "@/lib/RAMachine";
import { useEffect, useRef } from "react";

type ProgramUnitType = { 
  instructionSet: InstructionSet,
  instructionPointer?: number,
} & React.ComponentProps<"div">;

export default function ProgramUnit({ instructionSet, instructionPointer, ...props}: ProgramUnitType) {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLTableRowElement>(null);
  const SCROLL_MARGIN = 100;

  useEffect(() => {
    const el = highlightRef.current;
    const container = containerRef.current;
    if (el && container) {
      const elTop = el.offsetTop;
      const elBottom = elTop + el.offsetHeight;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      if (elTop < scrollTop + SCROLL_MARGIN) {
        container.scrollTo({
          top: Math.max(elTop - SCROLL_MARGIN, 0),
          behavior: "smooth",
        });
      }
      else if (elBottom > scrollTop + containerHeight - SCROLL_MARGIN) {
        container.scrollTo({
          top: elBottom - containerHeight + SCROLL_MARGIN,
          behavior: "smooth",
        });
      }
    }
  }, [instructionPointer]);

  return(
    <div {...props}>
      <h3 className="font-semibold w-fit">Programová jednotka</h3>
      <div className="relative w-full text-sm">
        <div ref={containerRef} className="max-h-[32rem] overflow-auto pr-2 w-full text-sm">
          <table>
            <tbody>
              {instructionSet.map((instruction, index) => 
                <tr key={index} ref={index == instructionPointer ? highlightRef : null}
                  className={'' + (index == instructionPointer ? ' font-semibold bg-primary/30' : ' ') + (index % 2 ? ' bg-primary/7' : ' ')}>
                  <td className="text-right px-1 h-full">{instruction.options?.label}</td>
                  <td className="w-8 bg-primary/25 px-1">{index+1}</td>
                  <td className="px-1">{instruction.asComponent()}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
