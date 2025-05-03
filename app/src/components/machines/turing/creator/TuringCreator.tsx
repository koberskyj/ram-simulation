import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { State, Tape, TransitionFunction, TuringMachineDefinition, Symbol } from "@/lib/TuringMachine";
import TuringTransitions from "./TuringTransitions";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";


type TuringCreatorType = {
  definition?: TuringMachineDefinition
  onUpdate: (definition: TuringMachineDefinition) => void
} & React.ComponentProps<"div">;

export default function TuringCreator({ onUpdate, definition, ...props}: TuringCreatorType) {
  const [transitions, setTransitions] = useState<TransitionFunction[]>(definition ? definition.transitionFunctions.map(f => { return { ...f, stateFrom: 'q'+f.stateFrom, stateTo: 'q'+f.stateTo }}) : []);
  const [alphabetInput, setAlphabetInput] = useState<string>(definition ? definition.alphabet.join(', ') : "");
  const [initialTapeInput, setInitialTapeInput] = useState<string>(definition ? tapeMapToArray(definition.tape).join(', ') : "");
  const [initialStateInput, setInitialStateInput] = useState<string>(definition ? 'q'+definition.initialState : "");
  const [finalStatesInput, setFinalStatesInput] = useState<string>(definition ? definition.finalStates.map(s => 'q'+s).join(', ') : "");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const createTuring = () => {
    const alphabet = alphabetInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const initialTape = initialTapeInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const initialState = initialStateInput;
    const finalStates = finalStatesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const states = extractTransitionStates(transitions);
    if(alphabet.length == 0) {
      setErrorMessage("Abeceda nesmí být prázdná.");
      return;
    }
    if(!alphabet.includes('□')) {
      setErrorMessage("Abeceda neobsahuje prázdný symbol (□).");
      return;
    }
    const alphabetDuplicates = findDuplicates(alphabet);
    if(alphabetDuplicates.length > 0) {
      setErrorMessage(`Abeceda obsahuje duplicitní symboly: ${alphabetDuplicates}.`);
      return;
    }
    const invalidSymbols = alphabet.filter(symbol => symbol.length > 1);
    if(invalidSymbols.length > 0) {
      setErrorMessage(`Abeceda obsahuje neplatné symboly: ${invalidSymbols}.`);
      return;
    }
    const invalidTapeSymbols = findInvalidSymbols(alphabet, initialTape);
    if(invalidTapeSymbols.length > 0) {
      setErrorMessage(`Páska obsahuje symboly, které nejsou z abecedy: ${invalidTapeSymbols}.`);
      return;
    }
    if(transitions.length == 0) {
      setErrorMessage(`Neexistuje žádná přechodová funkce.`);
      return;
    }
    const transitionsMessage = validateTransitions(transitions, alphabet);
    if(transitionsMessage !== null) {
      setErrorMessage(transitionsMessage);
      return;
    }
    if(initialState.trim().length == 0) {
      setErrorMessage(`Počáteční stav není nastavený.`);
      return;
    }
    if(!states.includes(initialState.trim())) {
      setErrorMessage(`Počáteční stav nemá definovanou žádnou přechodovou funkci.`);
      return;
    }
    if(finalStates.length == 0) {
      setErrorMessage(`Přijímací stavy nejsou nastavené.`);
      return;
    }
    const invalidFinalStates = findInvalidSymbols(states, finalStates);
    if(invalidFinalStates.length > 0) {
      setErrorMessage(`Některé počáteční stavy nemají definované žádné přechodové funkce: ${invalidFinalStates}.`);
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
    setErrorMessage("");

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
    onUpdate(definition);
  }

  return(
    <div {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Definice Turingova stroje</CardTitle>
          <CardDescription>Zde lze {definition ? "upravit existující" : "vytvořit nový"} Turingův stroj.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div>
            <label htmlFor="alphabet" className="font-semibold">Abeceda <span className="text-muted-foreground text-sm font-normal">- symboly odděleny čárkou - neprázdná množina páskových symbolů včetně prázdného symbolu □</span></label>
            <Input type="text" id="alphabet" placeholder="a, b, c, □" value={alphabetInput} onChange={e => setAlphabetInput(e.target.value)} />
          </div>
          <div>
            <label htmlFor="initialTape" className="font-semibold">Páska <span className="text-muted-foreground text-sm font-normal">- buňky pásky odděleny čárkou - jednostranná páska, kde první buňka je na první pozici</span></label>
            <Input type="text" id="initialTape" placeholder="□, a, a, b, b, c, c, □" value={initialTapeInput} onChange={e => setInitialTapeInput(e.target.value)} />
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
        </CardContent>
        <CardFooter className="flex justify-between items-end gap-2">
          <Button onClick={createTuring}>Uložit</Button>
          {errorMessage.length > 0 ? <Alert variant="destructive" className="p-2 w-fit font-semibold bg-destructive/18"><AlertCircle className="h-4 w-4" /><AlertDescription>{errorMessage}</AlertDescription></Alert> : ""}
        </CardFooter>
      </Card>
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

function findDuplicates<T>(arr: T[]) {
  const seen = new Set<T>();
  const duplicates = new Set<T>();

  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }
  return Array.from(duplicates);
}

function findInvalidSymbols<T>(alphabet: T[],input: T[]) {
  const alphaSet = new Set(alphabet);
  return input.filter(symbol => !alphaSet.has(symbol));
}

function validateTransitions(transitions: TransitionFunction[], alphabet: string[]): string|null {
  for(const tr of transitions) {
    if((tr.stateFrom+"").trim() === "" || tr.stateTo.trim() === "") {
      return `Některé stavy přechodových funkcí mají prázdný název.`;
    }
    if((tr.symbolFrom+"").trim() === "" || tr.symbolTo.trim() === "") {
      return `Některé symboly přechodových funkcí jsou prázdné.`;
    }
    if(tr.stateFrom[0] != 'q') {
      return `Stav '${tr.stateFrom}' přechodové funkce nezačíná předponou 'q'.`;
    }
    if(tr.stateTo[0] != 'q') {
      return `Stav '${tr.stateTo}' přechodové funkce nezačíná předponou 'q'.`;
    }
  }
  const byState = transitions.reduce<Record<string, TransitionFunction[]>>(
    (acc, tf) => {
      (acc[tf.stateFrom] ||= []).push(tf);
      return acc;
    },
    {}
  );

  for (const state in byState) {
    const symbols = byState[state].map((tf) => tf.symbolFrom);
    const symbolsTo = byState[state].map((tf) => tf.symbolTo);

    /*const missing = alphabet.filter((sym) => !symbols.includes(sym));
    if (missing.length > 0) {
      return `Chybí přechodové funkce ze stavu ${state} a symbolů ${missing}.`;
    }*/

    const invalidSymbols = findInvalidSymbols(alphabet, [...symbols, ...symbolsTo]);
    if (invalidSymbols.length > 0) {
      return `Přechodová funkce ${state} obsahuje symboly, které nejsou z abecedy: ${invalidSymbols}.`;
    }

    const freq: Record<string, number> = {};
    for (const sym of symbols) {
      freq[sym] = (freq[sym] || 0) + 1;
    }
    const duplicates = Object.entries(freq).filter(([, cnt]) => cnt > 1).map(([sym]) => sym);
    if (duplicates.length > 0) {
      return `Pro stav ${state} se opakují symboly ${duplicates}.`;
    }
  }

  return null;
}

function extractTransitionStates(transitions: TransitionFunction[]): State[] {
  const statesSet = new Set<State>();

  for (const t of transitions) {
    statesSet.add(t.stateFrom);
    statesSet.add(t.stateTo);
  }
  return Array.from(statesSet);
}