import { Tape } from "@/lib/RAMachine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProgramTapeType = { 
  tape: Tape,
  name?: string,
} & React.ComponentProps<"div">;

export default function ProgramTape({ tape, name, ...props}: ProgramTapeType) {

  return(
    <Card {...props} className="w-fit">
      <CardHeader>
        <CardTitle>{name ?? 'Páska'}</CardTitle>
      </CardHeader>
      <CardContent>
        {tape.map((cell, index) => 
          <div key={index} className="inline" >
            <span className="border inline-flex justify-center items-center w-12 h-12">
              {cell}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
