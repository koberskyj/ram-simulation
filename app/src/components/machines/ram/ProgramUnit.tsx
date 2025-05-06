import { InstructionSet } from "@/lib/RAMachine";

type ProgramUnitType = { 
  instructionSet: InstructionSet,
  instructionPointer?: number,
} & React.ComponentProps<"div">;

export default function ProgramUnit({ instructionSet, instructionPointer, ...props}: ProgramUnitType) {


  return(
    <div {...props} className="flex flex-col">
      <h3 className="font-semibold border-b mb-1 w-fit">Programová jednotka</h3>
      <div className="relative w-full text-sm">
        <div className="max-h-[32rem] overflow-auto pr-2 w-full text-sm">
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
      </div>
    </div>
  );
}
