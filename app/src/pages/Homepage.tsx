import ProgramTape from "@/components/machines/ram/ProgramTape";
import ProgramUnit from "@/components/machines/ram/ProgramUnit";
import TuringTape from "@/components/machines/turing/TuringTape";
import { Button } from "@/components/ui/button";
import TuringMachine, { TuringMachineDefinition } from "@/lib/TuringMachine";
import { useEffect, useState } from "react";
import TransitionFunctions from "@/components/machines/turing/TransitionFunctions";
import TuringMachineRAMSimulation from "@/lib/TuringMachineRAMSimulation";
import WorkingMemoryTMSim from "@/components/machines/ram/WorkingMemoryTMSim";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TuringList from "@/components/machines/turing/machineList/TuringList";

function Homepage() {
  const [, setRenderTrigger] = useState(0);
  const forceUpdate = () => setRenderTrigger(prev => prev + 1);
  const [ turingDefinition, setTuringDefinition ] = useState<TuringMachineDefinition|null>(null);
  const [ turing, setTuring ] = useState<TuringMachine|null>(null);
  const [ turingSimulated, setTuringSimulated ] = useState<TuringMachine|null>(null);
  const [ simulation, setSimulation ] = useState<TuringMachineRAMSimulation|null>(null);

  useEffect(() => {
    if(!turingDefinition) {
      setTuring(null);
      setTuringSimulated(null);
      return;
    }
    setTuring(new TuringMachine(turingDefinition));
    setTuringSimulated(new TuringMachine(turingDefinition));
  }, [turingDefinition]);

  useEffect(() => {
    if(!turingSimulated) {
      setSimulation(null);
      return;
    }
    setSimulation(new TuringMachineRAMSimulation(turingSimulated));
  }, [turingSimulated]);

  return (
    <div className='p-4'>
      <Card>
        <CardHeader>
          <CardTitle>Výběr Turingova stroje k simulaci</CardTitle>
        </CardHeader>
        <CardContent>
          <TuringList onUpdate={c => setTuringDefinition(c)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Simulace Turingova stroje strojem RAM</CardTitle>
        </CardHeader>
        <CardContent>
          {!simulation && <p>Není vybrán stroj pro simulaci.</p>}
          {simulation && <>
            <div className="flex">
              <Button onClick={() => {simulation.reset(); forceUpdate(); }} className='mr-2'>Reset</Button>
              <Button onClick={() => {simulation.backstepTuring(); forceUpdate(); }} className='mr-2'>Backstep TM</Button>
              <Button onClick={() => {simulation.backstep(); forceUpdate(); }} className='mr-2'>Backstep</Button>
              <Button onClick={() => {simulation.step(); forceUpdate(); }} className='mr-2'>Step</Button>
              <Button onClick={() => {simulation.stepTuring(); forceUpdate(); }} className='mr-2'>Step TM</Button>
              <Button onClick={() => {simulation.run(); forceUpdate(); }} className='mr-2'>Run</Button>
            </div>
            <p>Aktuální stav: q<sub>{simulation.turing.currentState}</sub></p>
            <div className="flex flex-wrap">
              <div className="flex flex-wrap p-5 border">
                <TransitionFunctions funcionts={simulation.turing.transitionFunctions} lastTransition={simulation.turing.transitionHistory.length > 0 ? simulation.turing.transitionHistory[simulation.turing.transitionHistory.length-1] : undefined} />
                <TuringTape tape={simulation.turing.tape} previousTape={simulation.turing.getPreviousState()?.tape} tapePointer={simulation.turing.tapePointer} horizontal={false} />
              </div>
              <div className=" p-5 border">
                <ProgramTape name='Vstup' tape={simulation.ram.input} />
                <div className="flex flex-wrap">
                <ProgramUnit instructionSet={simulation.ram.programUnit} instructionPointer={simulation.ram.instructionPointer} />
                <WorkingMemoryTMSim tmrs={simulation} />
                </div>
                <ProgramTape name='Výstup' tape={simulation.ram.output} />
              </div>
            </div>
          </>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Samostatný Turingův stroj</CardTitle>
        </CardHeader>
        <CardContent>
          {!turing && <p>Není vybrán stroj pro simulaci.</p>}
          {turing && <>
            <Button onClick={() => {turing.reset(); forceUpdate(); }} className='mr-2'>Reset</Button>
            <Button onClick={() => {turing.backstep(); forceUpdate(); }} className='mr-2'>Backstep</Button>
            <Button onClick={() => {turing.step(); forceUpdate(); }} className='mr-2'>Step</Button>
            <Button onClick={() => {turing.run(); forceUpdate(); }} className='mr-2'>Run</Button>
            <TuringTape tape={turing.tape} previousTape={turing.getPreviousState()?.tape} tapePointer={turing.tapePointer} />
            <p>Aktuální stav: q<sub>{turing.currentState}</sub></p>
            <TransitionFunctions funcionts={turing.transitionFunctions} lastTransition={turing.transitionHistory.length > 0 ? turing.transitionHistory[turing.transitionHistory.length-1] : undefined} />
          </>} 
        </CardContent>
      </Card>
      
    </div>
  );
}

export default Homepage;