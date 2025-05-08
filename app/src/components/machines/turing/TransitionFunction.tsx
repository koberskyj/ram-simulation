


import { TransitionFunction as TFType } from "@/lib/TuringMachine";
import { ArrowRight } from "lucide-react";

type TransitionFunctionType = { 
  func: TFType
} & React.ComponentProps<"span">;

export default function TransitionFunction({ func, ...props}: TransitionFunctionType) {

  return(
    <span {...props}>
      <span>δ(q<sub>{func.stateFrom}</sub>, {func.symbolFrom})</span>
      <span>
        <ArrowRight className="inline h-4" />
        (q<sub>{func.stateTo}</sub>, {func.symbolTo}, {func.action})
      </span>
    </span>
  );
}
