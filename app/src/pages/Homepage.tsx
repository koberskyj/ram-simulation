import ProgramTape from "@/components/machines/ProgramTape";
import ProgramUnit from "@/components/machines/ProgramUnit";
import WorkingMemory from "@/components/machines/WorkingMemory";
import { Button } from "@/components/ui/button";
import RAMachine, { program } from "@/lib/RAMachine";
import { useAppStore } from "@/store";
import { useMemo, useState } from "react";

function Homepage() {
  const [, setRenderTrigger] = useState(0);
  const forceUpdate = () => setRenderTrigger(prev => prev + 1);

  const ram = useMemo(() => {
    const ram = new RAMachine();
    ram.input = [13, -2, 42, 5, 17, 0];
    ram.programUnit = program;
    return ram;
  }, [])

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Homepage</h1>
      <Button onClick={() => {ram.reset(); forceUpdate(); }} className='mr-2'>Reset</Button>
      <Button onClick={() => {ram.backstep(); forceUpdate(); }} className='mr-2'>Backstep</Button>
      <Button onClick={() => {ram.step(); forceUpdate(); }} className='mr-2'>Step</Button>
      <Button onClick={() => {ram.run(); forceUpdate(); }} className='mr-2'>Run</Button>
      <ProgramTape name='Vstup' tape={ram.input} />
      <div className="flex flex-wrap">
        <ProgramUnit instructionSet={ram.programUnit} instructionPointer={ram.instructionPointer} />
        <WorkingMemory memory={ram.memory} previousMemory={ram.getPreviousState()?.memory} />
      </div>
      <ProgramTape name='Výstup' tape={ram.output} />
    </div>
  );
}

export default Homepage;