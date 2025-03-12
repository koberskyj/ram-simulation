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
      <CardContent>
        {instructionSet.map((instruction, index) => 
          <div key={index} className={index == instructionPointer ? 'text-red-700' : ''}>
            {index+1}: {instruction.asComponent()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
