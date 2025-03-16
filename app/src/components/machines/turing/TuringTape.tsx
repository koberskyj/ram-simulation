
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Symbol, Tape } from "@/lib/TuringMachine";

type TuringTapeType = { 
  tape: Tape,
  previousTape?: Tape,
  tapePointer: number
} & React.ComponentProps<"div">;

export default function TuringTape({ tape, previousTape, tapePointer, ...props}: TuringTapeType) {

  const tapePart: Symbol[] = [];
  for(let i=-2; i<15; i++) {
    tapePart.push(tape.get(i) ?? '□');
  }

  return(
    <Card {...props} className="w-fit">
      <CardHeader>
        <CardTitle>Páska</CardTitle>
      </CardHeader>
      <CardContent>
        {tapePart.map((tapeCell, index) => 
          <div key={index} className={"inline"}>
            <span className={"border inline-flex justify-center items-center w-12 h-12" + (previousTape !== undefined && tapeCell != (previousTape.get(index-2) ?? '□') ? ' text-red-700' : '') + (tapePointer+2 == index ? ' bg-amber-200' : '') }>
              {tapeCell}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
