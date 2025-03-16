


import { TransitionFunction as TFType } from "@/lib/TuringMachine";

type TransitionFunctionType = { 
  func: TFType
} & React.ComponentProps<"span">;

export default function TransitionFunction({ func, ...props}: TransitionFunctionType) {

  return(
    <span {...props}>δ(q<sub>{func.stateFrom}</sub>, {func.symbolFrom}) = (q<sub>{func.stateTo}</sub>, {func.symbolTo}, {func.action})</span>
  );
}
