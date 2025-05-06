
import { equalTransitions, TransitionFunction as TFType } from "@/lib/TuringMachine";
import TransitionFunction from "./TransitionFunction";

type TransitionFunctionsType = { 
  funcionts: TFType[],
  lastTransition?: TFType
} & React.ComponentProps<"div">;



export default function TransitionFunctions({ funcionts, lastTransition, ...props }: TransitionFunctionsType) {

  return(
    <div {...props} className="">
      <h3 className="font-semibold border-b w-fit">Přechodové funkce</h3>
      <div className="max-h-[32rem] overflow-auto pr-2 w-fit">
        {funcionts.map((func, index) => 
          <div key={index} >
            <span className={"text-sm" + (lastTransition && equalTransitions(func, lastTransition)  ? ' text-red-700' : '') }>
              <TransitionFunction func={func} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
