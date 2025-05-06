import TuringMachineRAMSimulation from "@/lib/TuringMachineRAMSimulation";

export type WorkingMemoryTMSimType = { 
  tmrs: TuringMachineRAMSimulation
} & React.ComponentProps<"div">;

export default function WorkingMemoryTMSim({ tmrs, ...props}: WorkingMemoryTMSimType) {

  const previousMemory = tmrs.ram.getPreviousState()?.memory;
  const memoryPart: number[] = [];
  for(let i=0; i<20; i++) {
    memoryPart.push(tmrs.ram.memory.get(i) ?? 0);
  }

  return(
    <div {...props} className="flex flex-col relative">
      <h3 className="font-semibold border-b mb-1 w-fit">Pracovní paměť</h3>
      <div className="relative min-w-full">
        <div className="max-h-[32rem] overflow-auto pr-2 w-full text-sm">
          {memoryPart.map((memoryCell, index) => 
            <div key={index} className="relative flex items-top border-b w-fit" >
              <div className="absolute left-0.5 top-0.2 text-gray-500 text-xs">
                {index}
              </div>
              <div className={"border-t border-l border-r flex justify-end items-center pt-2 pr-1 w-10 h-8 font-semibold " + (previousMemory !== undefined && memoryCell != (previousMemory.get(index) ?? 0) ? 'text-red-700' : '') }>
                {memoryCell}
              </div>
              <div className={"border-t border-r inline-flex justify-center items-center pt-2 min-w-8 h-8 " + (previousMemory !== undefined && memoryCell != (previousMemory.get(index) ?? 0) ? 'text-red-700' : '') }>
                {index > 2 ? tmrs.decodeSymbol(memoryCell) : '-'}  
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
