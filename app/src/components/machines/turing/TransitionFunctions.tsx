
import { equalTransitions, TransitionFunction as TFType } from "@/lib/TuringMachine";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

type TransitionFunctionsType = { 
  funcionts: TFType[],
  lastTransition?: TFType
} & React.ComponentProps<"div">;



export default function TransitionFunctions({ funcionts, lastTransition, ...props }: TransitionFunctionsType) {
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
  }, [lastTransition]);

  return(
    <div {...props}>
      <h3 className="font-semibold w-fit">Přechodové funkce</h3>
      <div ref={containerRef} className="max-h-[32rem] overflow-auto w-fit pr-2">
        <table>
          <tbody>
            {funcionts.map((func, index) => {
              const isHighlighted = lastTransition && equalTransitions(func, lastTransition);
              return (
                <tr key={index} ref={isHighlighted ? highlightRef : null} 
                  className={"px-1" + (isHighlighted  ? ' font-medium bg-primary/30' : '') + (index % 2 ? ' bg-primary/7' : ' ')} >
                    <td className="min-w-[55px]">δ(q<sub>{func.stateFrom}</sub>, {func.symbolFrom})</td>
                    <td>
                      <ArrowRight className="inline h-4" />
                      (q<sub>{func.stateTo}</sub>, {func.symbolTo}, {func.action})
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
