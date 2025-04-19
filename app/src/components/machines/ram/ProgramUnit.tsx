import { InstructionSet } from "@/lib/RAMachine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProgramUnitType = { 
  instructionSet: InstructionSet,
  instructionPointer?: number,
} & React.ComponentProps<"div">;

export default function ProgramUnit({ instructionSet, instructionPointer, ...props}: ProgramUnitType) {


  return(
    <Card {...props} className="w-fit">
      <CardHeader>
        <CardTitle>Programová jednotka</CardTitle>
      </CardHeader>
      <CardContent className="">
        <div className="border max-h-[80vh] overflow-y-auto">
          {instructionSet.map((instruction, index) => 
            <div key={index} className={'flex' + (index == instructionPointer ? ' text-red-700' : ' ') + (index % 2 == 0 ? ' bg-foreground/5' : ' ')}>
              <p className="w-10 text-right px-1 h-full">
                {instruction.options?.label}
              </p>
              <p className="w-10 bg-primary/25 px-1">
              {index+1}
              </p>
              <p className="px-1">
                {instruction.asComponent()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
