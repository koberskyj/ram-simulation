import ProgramTape from "@/components/machines/ram/ProgramTape";
import ProgramUnit from "@/components/machines/ram/ProgramUnit";
import TuringTape from "@/components/machines/turing/TuringTape";
import TuringMachine from "@/lib/TuringMachine";
import { useEffect, useState } from "react";
import TransitionFunctions from "@/components/machines/turing/TransitionFunctions";
import TuringMachineRAMSimulation from "@/lib/TuringMachineRAMSimulation";
import WorkingMemoryTMSim from "@/components/machines/ram/WorkingMemoryTMSim";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TuringList, { getTuringMachineDefinitionFromSave, TuringMachineSave } from "@/components/machines/turing/machineList/TuringList";
import TransitionFunction from "@/components/machines/turing/TransitionFunction";
import DivHover from "@/components/custom/DivHover";
import { Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Play, RotateCcw } from "lucide-react";
import ButtonHover from "@/components/custom/ButtonHover";
import { Slider } from "@/components/ui/slider";

function Homepage() {
  const [, setRenderTrigger] = useState(0);
  const forceUpdate = () => setRenderTrigger(prev => prev + 1);
  const [ turingSave, setTuringSave ] = useState<TuringMachineSave|null>(null);
  const [ turingSimulated, setTuringSimulated ] = useState<TuringMachine|null>(null);
  const [ simulation, setSimulation ] = useState<TuringMachineRAMSimulation|null>(null);
  const [ simulationSpeed, setSimulationSpeed ] = useState<number>(50)

  useEffect(() => {
    if(!turingSave) {
      setTuringSimulated(null);
      return;
    }
    const definition = getTuringMachineDefinitionFromSave(turingSave);
    setTuringSimulated(new TuringMachine(definition));
  }, [turingSave]);

  useEffect(() => {
    if(!turingSimulated) {
      setSimulation(null);
      return;
    }
    setSimulation(new TuringMachineRAMSimulation(turingSimulated));
  }, [turingSimulated]);

  return (
    <div className='p-4'>
      <h1 className="mb-6 mt-1 text-2xl font-semibold">Simulace Turingova stroje strojem RAM</h1>
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Výběr Turingova stroje</CardTitle>
          </CardHeader>
          <CardContent>
            <TuringList onUpdate={c => setTuringSave(c)} />
          </CardContent>
        </Card>
      </div>
      <div>
        {!simulation && 
        <Card className="mb-3">
          <CardHeader>
            <CardTitle className="text-xl">Není vybrán stroj k simulaci</CardTitle>
          </CardHeader>
        </Card>}
        {simulation && 
        <div>
          <Card className="mb-3">
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col justify-between gap-6 grow-[100]">
                <CardTitle className="text-xl">Simulace {turingSave?.name.toLocaleLowerCase()}</CardTitle>
                <div className="flex flex-col">
                  <div className="flex flex-wrap gap-2">
                    <ButtonHover hoverContent={"Na začátek"} onClick={() => {simulation.reset(); forceUpdate(); }} size={"icon"} className=''>
                      <RotateCcw />
                    </ButtonHover>
                    <ButtonHover hoverContent={"Jeden krok zpět ekvivalentní Turingovému stroji"} onClick={() => {simulation.backstepTuring(); forceUpdate(); }} size={"icon"} className=''>
                      <ChevronsLeft />
                    </ButtonHover>
                    <ButtonHover hoverContent={"Jeden krok zpět ekvivalentní stroji RAM"} onClick={() => {simulation.backstep(); forceUpdate(); }} size={"icon"} className=''>
                      <ChevronLeft />
                    </ButtonHover>
                    <ButtonHover hoverContent={"Spustit"} onClick={() => {simulation.step(); forceUpdate(); }} size={"icon"} className=''>
                      <Play />
                    </ButtonHover>
                    <ButtonHover hoverContent={"Jeden krok ekvivalentní stroji RAM"} onClick={() => {simulation.step(); forceUpdate(); }} size={"icon"} className=''>
                      <ChevronRight />
                    </ButtonHover>
                    <ButtonHover hoverContent={"Jeden krok ekvivalentní Turingovému stroji"} onClick={() => {simulation.stepTuring(); forceUpdate(); }} size={"icon"} className=''>
                      <ChevronsRight />
                    </ButtonHover>
                    <ButtonHover hoverContent={"Na konec"} onClick={() => {simulation.run(); forceUpdate(); }} size={"icon"} className=''>
                      <Check />
                    </ButtonHover>
                  </div>
                  <div className="">
                    <DivHover hoverContent={`Rychlost simulace (${simulationSpeed})`} className="max-w-[300px] w-[70vw]">
                      <Slider value={[simulationSpeed]} onValueChange={e => setSimulationSpeed(e[0])} max={100} step={1} />
                    </DivHover>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end grow">
                <DivHover className="" hoverContent={"Aktuální, dosud neprovedený, stav Turingova stroje."}>Aktuální stav: <span className="font-semibold">q<sub>{simulation.turing.currentState}</sub></span></DivHover>
                {simulation.ram.getLastLabel() && 
                  <DivHover className="" hoverContent={"Poslední navštívené návěští v RAM stroji."}>Návěští stroje RAM: <span className="font-semibold">{simulation.ram.getLastLabel()}</span></DivHover>}
                {simulation.getLastSimulatedState() && 
                  <DivHover className="" hoverContent={"Poslední navštívené návěští značící stav Turingova stroje."}>Návěští Turingova stavu: <span className="font-semibold">{simulation.getLastSimulatedState()}</span></DivHover>}
                {simulation.turing.getLastTransitionFunction() && 
                  <DivHover className="" hoverContent={"Poslední provedená přechodová funkce Turingova stroje."}>Přechodová funkce: <span className="font-semibold"><TransitionFunction func={simulation.turing.getLastTransitionFunction()!} /></span></DivHover>}
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Card className="grow">
              <CardHeader>
                <CardTitle>Turingův stroj</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap p-5 border">
                  <TransitionFunctions funcionts={simulation.turing.transitionFunctions} lastTransition={simulation.turing.transitionHistory.length > 0 ? simulation.turing.transitionHistory[simulation.turing.transitionHistory.length-1] : undefined} />
                  <TuringTape tape={simulation.turing.tape} previousTape={simulation.turing.getPreviousState()?.tape} tapePointer={simulation.turing.tapePointer} horizontal={false} />
                </div>
              </CardContent>
            </Card>
            <Card className="grow">
              <CardHeader>
                <CardTitle>Stroj RAM</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=" p-5 border">
                  <ProgramTape name='Vstup' tape={simulation.ram.input} />
                  <div className="flex flex-wrap">
                  <ProgramUnit instructionSet={simulation.ram.programUnit} instructionPointer={simulation.ram.instructionPointer} />
                  <WorkingMemoryTMSim tmrs={simulation} />
                  </div>
                  <ProgramTape name='Výstup' tape={simulation.ram.output} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>}
      </div>
    </div>
  );
}

export default Homepage;