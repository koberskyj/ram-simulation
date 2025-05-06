import { Tape } from "@/lib/RAMachine";

type ProgramTapeType = { 
  tape: Tape,
  name?: string,
} & React.ComponentProps<"div">;

export default function ProgramTape({ tape, name, ...props}: ProgramTapeType) {

  return(
    <div {...props} className="flex flex-col w-full">
      <h3 className="font-semibold border-b mb-1 w-fit">{name}</h3>
      <div className="relative w-full text-sm">
        <div className="flex flex-row flex-wrap">
          {tape.map((cell, index) => 
            <span key={index} className="border flex justify-center items-center w-8 h-8">
              {cell}
            </span>
          )}
          {tape.length == 0 && <span className="border flex justify-center items-center px-2 h-8">Prázdný</span>}
        </div>
      </div>
    </div>
  );
}
