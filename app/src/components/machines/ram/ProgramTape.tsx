import { Tape } from "@/lib/RAMachine";
import TuringMachineRAMSimulation from "@/lib/TuringMachineRAMSimulation";

type ProgramTapeType = { 
  tape: Tape,
  name?: string,
  tmrs: TuringMachineRAMSimulation
} & React.ComponentProps<"div">;

export default function ProgramTape({ tape, name, tmrs, ...props}: ProgramTapeType) {

  return(
    <div {...props}>
      <h3 className="font-semibold w-fit">{name}</h3>
      <div className="relative w-full text-sm">
        <div className="flex flex-row flex-wrap">
          {tape.map((cell, index) => 
            <span key={index} className="border flex justify-center items-center w-10 h-8">
              <span className="font-semibold mr-2">{cell}</span>
              <span className="text-foreground/60">{tmrs.decodeSymbol(cell, false) ?? ' '}</span>
            </span>
          )}
          {tape.length == 0 && <span className="border flex justify-center items-center px-2 h-8">Prázdný</span>}
        </div>
      </div>
    </div>
  );
}
