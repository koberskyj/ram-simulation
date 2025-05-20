import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { State, Tape, TransitionFunction, TuringMachineDefinition, Symbol, validateTuringMachineDefinition } from "@/lib/TuringMachine";
import TuringTransitions from "./TuringTransitions";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


type TuringCreatorType = {
  definition?: TuringMachineDefinition
  onUpdate: (definition: TuringMachineDefinition, name: string, description: string|undefined) => void;
  name?: string;
  description?: string;
} & React.ComponentProps<"div">;

export default function TuringCreator({ onUpdate, definition, name, description, ...props}: TuringCreatorType) {
  const [transitions, setTransitions] = useState<TransitionFunction[]>(definition ? definition.transitionFunctions.map(f => { return { ...f, stateFrom: 'q'+f.stateFrom, stateTo: 'q'+f.stateTo }}) : []);
  const [alphabetInput, setAlphabetInput] = useState<string>(definition ? definition.alphabet.join(', ') : "");
  const [initialTapeInput, setInitialTapeInput] = useState<string>(definition ? tapeMapToArray(definition.tape).join(', ') : "");
  const [initialStateInput, setInitialStateInput] = useState<string>(definition ? 'q'+definition.initialState : "");
  const [finalStatesInput, setFinalStatesInput] = useState<string>(definition ? definition.finalStates.map(s => 'q'+s).join(', ') : "");
  const [nameInput, setNameInput] = useState<string>(name ?? "");
  const [descriptionInput, setDesciptionInput] = useState<string>(description ?? "");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const createTuring = () => {
    const alphabet = alphabetInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const initialTape = initialTapeInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const initialState = initialStateInput;
    const finalStates = finalStatesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

    if(nameInput.length < 3) {
      setErrorMessage("Název stroje musí být delší než 2 znaky. Ten lze upravit v záložce \"Upravit název a popisek stroje\".");
      return;
    }
    if(initialState[0] != 'q') {
      setErrorMessage("Počáteční stav nezačíná předponou 'q'.");
      return;
    }
    if((finalStates.find(s => s[0] != 'q') ?? []).length > 0) {
      setErrorMessage("Některý z koncových stavů nezačíná předponou 'q'.");
      return;
    }
    for(const tr of transitions) {
      if(tr.stateFrom[0] != 'q') {
        setErrorMessage(`Stav přechodové funkce '${tr.stateFrom}' nezačíná předponou 'q'.`);
        return;
      }
      if(tr.stateTo[0] != 'q') {
        setErrorMessage(`Stav přechodové funkce '${tr.stateTo}' nezačíná předponou 'q'.`);
        return;
      }
    }

    const cleanedTransitions = transitions.map(f => ({
      ...f,
      stateFrom: removeQFromState(f.stateFrom),
      stateTo: removeQFromState(f.stateTo),
    }));

    const tapeMap = new Map();
    let i = 0;
    for(const tapeBox of initialTape) {
      tapeMap.set(i++, tapeBox);
    }
    const definition: TuringMachineDefinition = {
      initialState: removeQFromState(initialState),
      tape: tapeMap,
      alphabet: alphabet,
      finalStates: finalStates.map(s => removeQFromState(s)),
      transitionFunctions: cleanedTransitions
    }

    const validationResult = validateTuringMachineDefinition(definition);
    if(validationResult !== true) {
      setErrorMessage(validationResult);
      return;
    }
    setErrorMessage("");
    onUpdate(definition, nameInput, descriptionInput=="" ? undefined : descriptionInput);
  }

  return(
    <div className="flex flex-col gap-2 h-full overflow-auto p-1" {...props}>
      <div className="mb-2">
        <span className="text-muted-foreground text-sm font-normal">{definition ? "Upravit existující" : "Definovat nový"} Turingův stroj{name ? ` ${name}.` : '.'}</span>
      </div>
      <div className="border-1 px-2 rounded-lg mb-2">
        <Accordion type="single" collapsible >
          <AccordionItem value="item-1">
            <AccordionTrigger className="py-2 cursor-pointer">
              Upravit název a popisek stroje
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2 px-1">
            <div>
              <label htmlFor="name" className="font-semibold">Název <span className="text-muted-foreground text-sm font-normal"></span></label>
              <Input type="text" id="name" placeholder="Krátký výstižný název" value={nameInput} onChange={e => setNameInput(e.target.value)} />
            </div>
            <div>
              <label htmlFor="description" className="font-semibold">Popisek <span className="text-muted-foreground text-sm font-normal"></span></label>
              <Input type="text" id="description" placeholder="K čemu stroj slouží?" value={descriptionInput} onChange={e => setDesciptionInput(e.target.value)} />
            </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="relative">
        <label htmlFor="alphabet" className="font-semibold">Abeceda <span className="text-muted-foreground text-sm font-normal">- symboly odděleny čárkou - neprázdná množina páskových symbolů včetně prázdného symbolu □</span></label>
        <Input type="text" id="alphabet" placeholder="a, b, c, □" value={alphabetInput} onChange={e => setAlphabetInput(e.target.value)} />
        <Button type="button" size="icon" variant="secondary" onClick={() => setAlphabetInput(prev => prev+'□')} className="absolute right-0 bottom-0 transform text-lg z-[1]">□</Button>
      </div>
      <div className="relative">
        <label htmlFor="initialTape" className="font-semibold">Páska <span className="text-muted-foreground text-sm font-normal">- buňky pásky odděleny čárkou - jednostranná páska, kde první buňka je na první pozici</span></label>
        <Input type="text" id="initialTape" placeholder="□, a, a, b, b, c, c, □" value={initialTapeInput} onChange={e => setInitialTapeInput(e.target.value)} />
        <Button type="button" size="icon" variant="secondary" onClick={() => setInitialTapeInput(prev => prev+'□')} className="absolute right-0 bottom-0 transform text-lg z-[1]">□</Button>
      </div>
      <div>
        <span className="font-semibold">Přechodové funkce <span className="text-muted-foreground text-sm font-normal">- ze stavu s daným symbolem do nového stavu s novým symbolem a následném posunu pásky</span></span>
        <TuringTransitions value={transitions}  onUpdate={t => setTransitions(t)} />
      </div>
      <div className="flex items-end gap-2">
        <div className="grow">
          <label htmlFor="initialState" className="font-semibold">Počáteční stav <span className="text-muted-foreground text-sm font-normal"></span></label>
          <Input type="text" id="initialState" placeholder="q0" value={initialStateInput} onChange={e => setInitialStateInput(e.target.value)} />
        </div>
        <div className="grow">
          <label htmlFor="finalStates" className="font-semibold">Koncové stavy <span className="text-muted-foreground text-sm font-normal">- stavy stroje odděleny čárkou</span></label>
          <Input type="text" id="finalStates" placeholder="qacc, qrej" value={finalStatesInput} onChange={e => setFinalStatesInput(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-between items-end gap-2 pt-6">
        <Button onClick={createTuring}>Uložit</Button>
        {errorMessage.length > 0 ? <Alert variant="destructive" className="p-2 w-fit font-semibold bg-destructive/18 max-w-96"><AlertCircle className="h-4 w-4" /><AlertDescription>{errorMessage}</AlertDescription></Alert> : ""}
      </div>
    </div>
  );
}

function removeQFromState(state: State) {
  if(state.length > 0) {
    return state.substring(1);
  }
  return state;
}

function tapeMapToArray(tape: Tape) {
  const maxValue = tape.size == 0 ? 0 : Math.max(...tape.keys());
  const newTape: Symbol[] = Array(maxValue+1).fill('□', 0, maxValue+1);
  for(const [key, value] of tape) {
    newTape[key] = value;
  }
  return newTape;
}