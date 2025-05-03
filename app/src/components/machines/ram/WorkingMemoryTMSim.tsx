import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card {...props} className="w-fit">
      <CardHeader>
        <CardTitle>Pracovní paměť</CardTitle>
      </CardHeader>
      <CardContent>
        {memoryPart.map((memoryCell, index) => 
          <div key={index} className="flex items-center" >
            <div className="text-gray-500 text-sm w-5 text-right">
              {index}
            </div>
            <div className={"border inline-flex justify-center items-center w-12 h-12 ml-2 " + (previousMemory !== undefined && memoryCell != (previousMemory.get(index) ?? 0) ? 'text-red-700' : '') }>
              {memoryCell}
            </div>
            <div className={"border inline-flex justify-center items-center w-12 h-12 " + (previousMemory !== undefined && memoryCell != (previousMemory.get(index) ?? 0) ? 'text-red-700' : '') }>
              {index > 2 ? tmrs.decodeSymbol(memoryCell) : '-'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
