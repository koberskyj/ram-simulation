import { Machine, MachineError } from "./Machine";

type State = string;
type Symbol = string;
type Action = -1 | 0 | 1;
type Tape = Map<number, Symbol>;

interface TransitionFunction {
  stateFrom: State;
  symbolFrom: Symbol;
  stateTo: State;
  symbolTo: Symbol;
  action: Action;
}

interface TuringMachineDefinition {
  alphabet: Symbol[];
  tape: Tape;
  transitionFunctions: TransitionFunction[];
  initialState: State;
  finalStates: State[];
}

interface TuringMachineState {
  tape: Tape;
  tapePointer: number;
  currentState: State;
  transitionHistory: TransitionFunction[];
}

function equalTransitions(transition1: TransitionFunction, transition2: TransitionFunction): boolean {
  return (
    transition1.stateFrom == transition2.stateFrom &&
    transition1.stateTo == transition2.stateTo &&
    transition1.symbolFrom == transition2.symbolFrom &&
    transition1.symbolTo == transition2.symbolTo &&
    transition1.action == transition2.action
  );
}

class TuringMachine extends Machine {
  tape: Tape;
  initialTape: Tape;
  tapePointer: number = 0;
  currentState: State;
  initialState: State;
  finalStates: State[];
  transitionFunctions: TransitionFunction[];
  transitionHistory: TransitionFunction[];
  private history: TuringMachineState[];
  private tapeAlphabet: Symbol[];

  constructor(definition: TuringMachineDefinition) {
    super();
    this.tape = definition.tape;
    this.initialTape = this.tape;
    this.initialState = definition.initialState;
    this.finalStates = definition.finalStates;
    this.transitionFunctions = definition.transitionFunctions;
    this.history = [];
    this.transitionHistory = [];
    this.currentState = definition.initialState;
    this.tapeAlphabet = definition.alphabet;
  }

  run(): void {
    while(!this.hasEnded()) {
      this.step();
    }
  }

  step(): void {
    if(this.hasEnded()) {
      return;
    }

    this.saveState();
    this.processState();
  }

  backstep(): void {
    if (this.history.length > 0) {
      const prevState = this.history.pop();
      if (prevState) {
        this.restoreState(prevState, null);
      }
    }
  }

  private processState(): TransitionFunction {
    for(const transitionFunction of this.transitionFunctions) {
      if(transitionFunction.stateFrom == this.currentState && transitionFunction.symbolFrom == (this.tape.get(this.tapePointer) ?? '□')) {
        this.tape.set(this.tapePointer, transitionFunction.symbolTo);
        this.currentState = transitionFunction.stateTo;
        this.tapePointer += transitionFunction.action;
        this.transitionHistory.push(transitionFunction);
        return transitionFunction;
      }
    }
    throw new MachineError(`Nebyla nalezena žádná přechodová funkce ze stavu q${this.currentState} se symbolem ${this.tape.get(this.tapePointer) ?? '□'}`, 'Turing');
  }

  getState(): TuringMachineState {
    const state: TuringMachineState = {
      currentState: this.currentState,
      tape: new Map(this.tape),
      tapePointer: this.tapePointer,
      transitionHistory: this.transitionHistory.slice()
    };
    return state;
  }

  private saveState(): void {
    this.history.push(this.getState());
  }

  restoreState(state: TuringMachineState, newHistory: TuringMachineState[]|null): void {
    if(newHistory) {
      this.history = newHistory;
    }
    this.currentState = state.currentState;
    this.tape = new Map(state.tape);
    this.tapePointer = state.tapePointer;
    this.transitionHistory = state.transitionHistory.slice();
  }

  hasEnded(): boolean {
    return this.finalStates.includes(this.currentState);
  }

  reset(): void {
    if(this.history.length > 0) {
      this.restoreState(this.history[0], []);
      this.transitionHistory = [];
    }
  }

  getPreviousState(): TuringMachineState | undefined {
    return this.history.length ? this.history[this.history.length - 1] : undefined;
  }

  getTapeAlphabet() {
    return this.tapeAlphabet;
  }

  getDefinition(): TuringMachineDefinition {
    return {
      alphabet: this.tapeAlphabet,
      finalStates: this.finalStates,
      initialState: this.initialState,
      tape: this.initialTape,
      transitionFunctions: this.transitionFunctions
    }
  }

  getLastTransitionFunction() {
    if(this.history.length > 0) {
      const lastMove = this.history[this.history.length-1];
      const func = this.transitionFunctions.find(fn => fn.stateFrom == lastMove.currentState && fn.symbolFrom == lastMove.tape.get(lastMove.tapePointer));
      return func;
    }
    return null;
  }
}

export function validateTuringMachineDefinition(machineDefinition: TuringMachineDefinition): string|true {
  const states = extractTransitionStates(machineDefinition.transitionFunctions);
  const tape = tapeMapToArray(machineDefinition.tape)

  if(!machineDefinition.alphabet.includes('□')) {
    return "Abeceda neobsahuje prázdný symbol (□).";
  }
  const alphabetDuplicates = findDuplicates(machineDefinition.alphabet);
  if(alphabetDuplicates.length > 0) {
    return `Abeceda obsahuje duplicitní symboly: ${alphabetDuplicates}.`;
  }
  const invalidSymbols = machineDefinition.alphabet.filter(symbol => symbol.length > 1);
  if(invalidSymbols.length > 0) {
    return `Abeceda obsahuje neplatné symboly: ${invalidSymbols}.`;
  }
  const invalidTapeSymbols = findInvalidSymbols(machineDefinition.alphabet, tape);
  if(invalidTapeSymbols.length > 0) {
    return `Páska obsahuje symboly, které nejsou z abecedy: ${invalidTapeSymbols}.`;
  }
  if(machineDefinition.transitionFunctions.length == 0) {
    return `Neexistuje žádná přechodová funkce.`;
  }
  const transitionsMessage = validateTransitions(machineDefinition.transitionFunctions, machineDefinition.alphabet);
  if(transitionsMessage !== null) {
    return transitionsMessage;
  }
  if(machineDefinition.initialState.trim().length == 0) {
    return `Počáteční stav není nastavený.`;
  }
  if(!states.includes(machineDefinition.initialState.trim())) {
    return `Počáteční stav nemá definovanou žádnou přechodovou funkci.`;
  }
  if(machineDefinition.finalStates.includes(machineDefinition.initialState)) {
    return 'Počáteční stav nesmí být zároveň koncový.';
  }
  if(machineDefinition.finalStates.length == 0) {
    return `Koncové stavy nejsou nastavené.`;
  }
  const invalidFinalStates = findInvalidSymbols(states, machineDefinition.finalStates);
  if(invalidFinalStates.length > 0) {
    return `Některé stavy nemají definované žádné přechodové funkce: ${invalidFinalStates}.`;
  }
  return true;
}

function extractTransitionStates(transitions: TransitionFunction[]): State[] {
  const statesSet = new Set<State>();

  for (const t of transitions) {
    statesSet.add(t.stateFrom);
    statesSet.add(t.stateTo);
  }
  return Array.from(statesSet);
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
function tapeMapToArray(tape: Tape) {
  const maxValue = tape.size == 0 ? 0 : Math.max(...tape.keys());
  const newTape: Symbol[] = Array(maxValue+1).fill('□', 0, maxValue+1);
  for(const [key, value] of tape) {
    newTape[key] = value;
  }
  return newTape;
}

const tape: Tape = new Map<number, Symbol>();
tape.set(1, 'a');
tape.set(2, 'a');
tape.set(3, 'a');
tape.set(4, 'b');
tape.set(5, 'b');
tape.set(6, 'b');
tape.set(7, 'c');
tape.set(8, 'c');
tape.set(9, 'c');
const transitionFunctions: TransitionFunction[] = [
  { stateFrom: '0', stateTo: 'acc', symbolFrom: '□', symbolTo: '□', action: 0 },
  { stateFrom: '0', stateTo: '1',     symbolFrom: 'a', symbolTo: 'x', action: 1 },
  { stateFrom: '0', stateTo: 'rej', symbolFrom: 'b', symbolTo: 'b', action: 0 },
  { stateFrom: '0', stateTo: 'rej', symbolFrom: 'c', symbolTo: 'c', action: 0 },
  { stateFrom: '0', stateTo: '0',     symbolFrom: 'x', symbolTo: 'x', action: 1 },

  { stateFrom: '1', stateTo: 'rej', symbolFrom: '□', symbolTo: '□', action: 0 },
  { stateFrom: '1', stateTo: '1',     symbolFrom: 'a', symbolTo: 'a', action: 1 },
  { stateFrom: '1', stateTo: '2',     symbolFrom: 'b', symbolTo: 'x', action: 1 },
  { stateFrom: '1', stateTo: 'rej', symbolFrom: 'c', symbolTo: 'c', action: 0 },
  { stateFrom: '1', stateTo: '1',     symbolFrom: 'x', symbolTo: 'x', action: 1 },

  { stateFrom: '2', stateTo: 'rej', symbolFrom: '□', symbolTo: '□', action: 0 },
  { stateFrom: '2', stateTo: 'rej', symbolFrom: 'a', symbolTo: 'a', action: 0 },
  { stateFrom: '2', stateTo: '2',     symbolFrom: 'b', symbolTo: 'b', action: 1 },
  { stateFrom: '2', stateTo: '3',     symbolFrom: 'c', symbolTo: 'x', action: 1 },
  { stateFrom: '2', stateTo: '2',     symbolFrom: 'x', symbolTo: 'x', action: 1 },

  { stateFrom: '3', stateTo: '4',     symbolFrom: '□', symbolTo: '□', action: -1 },
  { stateFrom: '3', stateTo: 'rej', symbolFrom: 'a', symbolTo: 'a', action: 0 },
  { stateFrom: '3', stateTo: 'rej', symbolFrom: 'b', symbolTo: 'b', action: 0 },
  { stateFrom: '3', stateTo: '3',     symbolFrom: 'c', symbolTo: 'c', action: 1 },
  { stateFrom: '3', stateTo: '3',     symbolFrom: 'x', symbolTo: 'x', action: 1 },

  { stateFrom: '4', stateTo: '0',     symbolFrom: '□', symbolTo: '□', action: 1 },
  { stateFrom: '4', stateTo: '4',     symbolFrom: 'a', symbolTo: 'a', action: -1 },
  { stateFrom: '4', stateTo: '4',     symbolFrom: 'b', symbolTo: 'b', action: -1 },
  { stateFrom: '4', stateTo: '4',     symbolFrom: 'c', symbolTo: 'c', action: -1 },
  { stateFrom: '4', stateTo: '4',     symbolFrom: 'x', symbolTo: 'x', action: -1 },
];

const testTuring = new TuringMachine({
  alphabet: ['a','b','c','x','□'],
  finalStates: ['acc','rej'],
  initialState: '4',
  tape: tape,
  transitionFunctions: transitionFunctions
})

export default TuringMachine;
export { testTuring, equalTransitions }
export type { State, Symbol, Action, Tape, TransitionFunction, TuringMachineState, TuringMachineDefinition }