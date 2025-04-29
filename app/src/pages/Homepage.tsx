import ProgramTape from "@/components/machines/ram/ProgramTape";
import ProgramUnit from "@/components/machines/ram/ProgramUnit";
import TuringTape from "@/components/machines/turing/TuringTape";
import WorkingMemory from "@/components/machines/ram/WorkingMemory";
import { Button } from "@/components/ui/button";
import RAMachine, { program } from "@/lib/RAMachine";
import { testTuring } from "@/lib/TuringMachine";
import { useMemo, useState } from "react";
import TransitionFunctions from "@/components/machines/turing/TransitionFunctions";
import TuringMachineRAMSimulation from "@/lib/TuringMachineRAMSimulation";
import WorkingMemoryTMSim from "@/components/machines/ram/WorkingMemoryTMSim";

function Homepage() {
  const [, setRenderTrigger] = useState(0);
  const forceUpdate = () => setRenderTrigger(prev => prev + 1);

  const ram = useMemo(() => {
    return new RAMachine(program, [13, -2, 42, 5, 17]);
  }, []);

  const turing = useMemo(() => {
    return testTuring;
  }, []);

  const turingTBS = useMemo(() => {
    return testTuring;
  }, []);

  const compiledTuring = useMemo(() => {
    return new TuringMachineRAMSimulation(turingTBS);
  }, []);

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
        <p>Aktuální stav: q<sub>{turing.currentState}</sub></p>
        <TransitionFunctions funcionts={turing.transitionFunctions} lastTransition={turing.transitionHistory.length > 0 ? turing.transitionHistory[turing.transitionHistory.length-1] : undefined} />
      </div>

      <div className="border p-10">
        <h2>Compiled Turing to RAM</h2>
        <Button onClick={() => {compiledTuring.reset(); forceUpdate(); }} className='mr-2'>Reset</Button>
        <Button onClick={() => {compiledTuring.backstepTuring(); forceUpdate(); }} className='mr-2'>Backstep TM</Button>
        <Button onClick={() => {compiledTuring.backstep(); forceUpdate(); }} className='mr-2'>Backstep</Button>
        <Button onClick={() => {compiledTuring.step(); forceUpdate(); }} className='mr-2'>Step</Button>
        <Button onClick={() => {compiledTuring.stepTuring(); forceUpdate(); }} className='mr-2'>Step TM</Button>
        <Button onClick={() => {compiledTuring.run(); forceUpdate(); }} className='mr-2'>Run</Button>
        <p>Aktuální stav: q<sub>{turing.currentState}</sub></p>
        <div className="flex flex-wrap">
          <div className="flex flex-wrap p-5 border">
            <TransitionFunctions funcionts={turingTBS.transitionFunctions} lastTransition={turingTBS.transitionHistory.length > 0 ? turingTBS.transitionHistory[turingTBS.transitionHistory.length-1] : undefined} />
            <TuringTape tape={turingTBS.tape} previousTape={turingTBS.getPreviousState()?.tape} tapePointer={turingTBS.tapePointer} horizontal={false} />
          </div>
          <div className=" p-5 border">
            <ProgramTape name='Vstup' tape={compiledTuring.ram.input} />
            <div className="flex flex-wrap">
            <ProgramUnit instructionSet={compiledTuring.ram.programUnit} instructionPointer={compiledTuring.ram.instructionPointer} />
            <WorkingMemoryTMSim tmrs={compiledTuring} />
            </div>
            <ProgramTape name='Výstup' tape={compiledTuring.ram.output} />
          </div>
        </div>
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