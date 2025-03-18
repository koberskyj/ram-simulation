
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { equalTransitions, TransitionFunction as TFType } from "@/lib/TuringMachine";
import TransitionFunction from "./TransitionFunction";

type TransitionFunctionsType = { 
  funcionts: TFType[],
  lastTransition?: TFType
} & React.ComponentProps<"div">;



export default function TransitionFunctions({ funcionts, lastTransition, ...props }: TransitionFunctionsType) {

  return(
    <Card {...props} className="w-fit">
      <CardHeader>
        <CardTitle>Přechodové funkce</CardTitle>
      </CardHeader>
      <CardContent>
        {funcionts.map((func, index) => 
          <div key={index} >
            <span className={"" + (lastTransition && equalTransitions(func, lastTransition)  ? ' text-red-700' : '') }>
              <TransitionFunction func={func} />
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
