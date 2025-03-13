
type State = number|string;
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

interface TuringMachineState {
  tape: Tape;
  tapePointer: number;
  currentState: State;
}

class TuringMachine {
  tape: Tape;
  tapePointer: number = 0;
  currentState: State;
  states: State[];
  initialState: State;
  finalStates: State[];
  transitionFunctions: TransitionFunction[];
  private history: TuringMachineState[];

  constructor(tape: Tape, states: State[], initialState: State, finalStates: State[], transitionFunctions: TransitionFunction[]) {
    this.tape = tape;
    this.states = states;
    this.initialState = initialState;
    this.finalStates = finalStates;
    this.transitionFunctions = transitionFunctions;
    this.history = [];
    this.currentState = initialState;
  }

  run(): void {
    while(!this.finalStates.includes(this.currentState)) {
      this.step();
    }
  }

  step(): void {
    if(this.finalStates.includes(this.currentState)) {
      return;
    }

    this.saveState();
    this.processState();
  }

  backstep(): void {
    if (this.history.length > 0) {
      const prevState = this.history.pop();
      if (prevState) {
        this.restoreState(prevState);
      }
    }
  }

  private processState(): TransitionFunction|null {
    for(const transitionFunction of this.transitionFunctions) {
      if(transitionFunction.stateFrom == this.currentState && transitionFunction.symbolFrom == (this.tape.get(this.tapePointer) ?? '□')) {
        this.tape.set(this.tapePointer, transitionFunction.symbolTo);
        this.currentState = transitionFunction.stateTo;
        this.tapePointer += transitionFunction.action;
        return transitionFunction;
      }
    }
    return null;
  }

  private saveState(): void {

    const state: TuringMachineState = {
      currentState: this.currentState,
      tape: new Map(this.tape),
      tapePointer: this.tapePointer
    };

    this.history.push(state);
  }

  private restoreState(state: TuringMachineState): void {
    this.currentState = state.currentState;
    this.tape = new Map(state.tape);
    this.tapePointer = state.tapePointer;
  }

  reset(): void {
    if(this.history.length > 0) {
      this.restoreState(this.history[0]);
      this.history = [];
    }
  }

  getPreviousState(): TuringMachineState | undefined {
    return this.history.length ? this.history[this.history.length - 1] : undefined;
  }
}

const tape: Tape = new Map<number, Symbol>();
tape.set(0, 'a');
tape.set(1, 'a');
tape.set(2, 'a');
tape.set(3, 'a');
tape.set(4, 'b');
tape.set(5, 'b');
tape.set(6, 'b');
tape.set(7, 'b');
tape.set(8, 'c');
tape.set(9, 'c');
tape.set(10, 'c');
tape.set(11, 'c');
const states: State[] = [0, 1, 2, 3, 4, 'acc', 'rej'];
const transitionFunctions: TransitionFunction[] = [
  { stateFrom: 0, stateTo: 'acc', symbolFrom: '□', symbolTo: '□', action: 0 },
  { stateFrom: 0, stateTo: 1,     symbolFrom: 'a', symbolTo: 'x', action: 1 },
  { stateFrom: 0, stateTo: 'rej', symbolFrom: 'b', symbolTo: 'b', action: 0 },
  { stateFrom: 0, stateTo: 'rej', symbolFrom: 'c', symbolTo: 'c', action: 0 },
  { stateFrom: 0, stateTo: 0,     symbolFrom: 'x', symbolTo: 'x', action: 1 },

  { stateFrom: 1, stateTo: 'rej', symbolFrom: '□', symbolTo: '□', action: 0 },
  { stateFrom: 1, stateTo: 1,     symbolFrom: 'a', symbolTo: 'a', action: 1 },
  { stateFrom: 1, stateTo: 2,     symbolFrom: 'b', symbolTo: 'x', action: 1 },
  { stateFrom: 1, stateTo: 'rej', symbolFrom: 'c', symbolTo: 'c', action: 0 },
  { stateFrom: 1, stateTo: 1,     symbolFrom: 'x', symbolTo: 'x', action: 1 },

  { stateFrom: 2, stateTo: 'rej', symbolFrom: '□', symbolTo: '□', action: 0 },
  { stateFrom: 2, stateTo: 'rej', symbolFrom: 'a', symbolTo: 'a', action: 0 },
  { stateFrom: 2, stateTo: 2,     symbolFrom: 'b', symbolTo: 'b', action: 1 },
  { stateFrom: 2, stateTo: 3,     symbolFrom: 'c', symbolTo: 'x', action: 1 },
  { stateFrom: 2, stateTo: 2,     symbolFrom: 'x', symbolTo: 'x', action: 1 },

  { stateFrom: 3, stateTo: 4,     symbolFrom: '□', symbolTo: '□', action: -1 },
  { stateFrom: 3, stateTo: 'rej', symbolFrom: 'a', symbolTo: 'a', action: 0 },
  { stateFrom: 3, stateTo: 'rej', symbolFrom: 'b', symbolTo: 'b', action: 0 },
  { stateFrom: 3, stateTo: 3,     symbolFrom: 'c', symbolTo: 'c', action: 1 },
  { stateFrom: 3, stateTo: 3,     symbolFrom: 'x', symbolTo: 'x', action: 1 },

  { stateFrom: 4, stateTo: 0,     symbolFrom: '□', symbolTo: '□', action: 1 },
  { stateFrom: 4, stateTo: 4,     symbolFrom: 'a', symbolTo: 'a', action: -1 },
  { stateFrom: 4, stateTo: 4,     symbolFrom: 'b', symbolTo: 'b', action: -1 },
  { stateFrom: 4, stateTo: 4,     symbolFrom: 'c', symbolTo: 'c', action: -1 },
  { stateFrom: 4, stateTo: 4,     symbolFrom: 'x', symbolTo: 'x', action: -1 },
];

const testTuring = new TuringMachine(tape, states, 0, ['acc','rej'], transitionFunctions);

export default TuringMachine;
export { testTuring }
export type { State, Symbol, Action, Tape, TransitionFunction, TuringMachineState }