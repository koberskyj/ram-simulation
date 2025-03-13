import ProgramTape from "@/components/machines/ProgramTape";
import ProgramUnit from "@/components/machines/ProgramUnit";
import TuringTape from "@/components/machines/TuringTape";
import WorkingMemory from "@/components/machines/WorkingMemory";
import { Button } from "@/components/ui/button";
import RAMachine, { program } from "@/lib/RAMachine";
import { testTuring } from "@/lib/TuringMachine";
import { useMemo, useState } from "react";

function Homepage() {
  const [, setRenderTrigger] = useState(0);
  const forceUpdate = () => setRenderTrigger(prev => prev + 1);

  const ram = useMemo(() => {
    const ram = new RAMachine();
    ram.input = [13, -2, 42, 5, 17];
    ram.programUnit = program;
    return ram;
  }, []);

  const turing = useMemo(() => {
    return testTuring;
  }, []);
  console.log(turing.tape);

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Homepage</h1>
      <div className="border p-10">
        <h2>Turing</h2>
        <Button onClick={() => {turing.reset(); forceUpdate(); }} className='mr-2'>Reset</Button>
        <Button onClick={() => {turing.backstep(); forceUpdate(); }} className='mr-2'>Backstep</Button>
        <Button onClick={() => {turing.step(); forceUpdate(); }} className='mr-2'>Step</Button>
        <Button onClick={() => {turing.run(); forceUpdate(); }} className='mr-2'>Run</Button>
        <TuringTape tape={turing.tape} previousTape={turing.getPreviousState()?.tape} tapePointer={turing.tapePointer} />
        <p>q<sub>{turing.currentState}</sub></p>
      </div>
      <div className="border p-10">
        <h2>RAM</h2>
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
      
    </div>
  );
}

export default Homepage;