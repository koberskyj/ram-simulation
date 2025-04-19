import { Memory } from "@/lib/RAMachine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type WorkingMemoryType = { 
  memory: Memory,
  previousMemory?: Memory
} & React.ComponentProps<"div">;

export default function WorkingMemory({ memory, previousMemory, ...props}: WorkingMemoryType) {

  const memoryPart: number[] = [];
  for(let i=0; i<10; i++) {
    memoryPart.push(memory.get(i) ?? 0);
  }

  return(
    <Card {...props} className="w-fit">
      <CardHeader>
        <CardTitle>Pracovní paměť</CardTitle>
      </CardHeader>
      <CardContent>
        {memoryPart.map((memoryCell, index) => 
          <div key={index} >
            <span className="text-gray-500 text-sm">{index}</span>
            <span className={"border inline-flex justify-center items-center w-12 h-12 ml-2 " + (previousMemory !== undefined && memoryCell != (previousMemory.get(index) ?? 0) ? 'text-red-700' : '') }>
              {memoryCell}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
