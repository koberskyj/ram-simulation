import RAMachine, { Add, ConditionalJump, Halt, InstructionSet, Jump, Load, LoadFromAddress, LoadToAddress, RAMachineState, ReadInput, Tape, WriteOutput } from "./RAMachine";
import TuringMachine, { State, Symbol, Tape as TapeTM, TuringMachineState } from "./TuringMachine";

export interface TMRAMSimulationState {
  turingMachineState: TuringMachineState;
  ramState: RAMachineState;
  ignoreFirstNewInstr: boolean;
}

class TuringMachineRAMSimulation {
  ram: RAMachine;
  turing: TuringMachine;
  private ramProgram: InstructionSet;
  private symbolLegend: Map<Symbol, number>;
  private ignoreFirstNewInstr = true;
  private history: TMRAMSimulationState[];

  constructor(turingMachine: TuringMachine) {
    this.turing = turingMachine;
    this.symbolLegend = new Map();
    this.ramProgram = [];
    this.history = [];
    this.ram = this.initializeRAM();
  }

  private initializeRAM(): RAMachine {
    this.history = [];
    this.ignoreFirstNewInstr = true;
    this.symbolLegend.set('□', 0);
    this.turing.getTapeAlphabet().filter(s => s != '□')?.forEach((symbol, index) => {
      this.symbolLegend.set(symbol, index+1);
    });

    this.ramProgram = this.compileTMToRAMProgram(this.turing);
    const inputTape = this.parseTuringTape(this.turing.tape);
    const ram = new RAMachine(this.ramProgram, inputTape);
    return ram;
  }

  private parseTuringTape(tape: TapeTM): Tape {
    const maxValue = tape.size == 0 ? 0 : Math.max(...tape.keys());
    const newTape: Tape = Array(maxValue+1).fill(this.encodeSymbol('□'), 0, maxValue+2);
    newTape[maxValue+1] = -1;
    for(const [key, value] of tape) {
      newTape[key] = this.encodeSymbol(value);
    }
    return newTape;
  }

  private compileTMToRAMProgram(tm: TuringMachine): InstructionSet {
    // TODO: Verification: jednostranná páska, 
    const tapeStartInMemory = 3;
    let program: InstructionSet = [];

    // Load input to memory
    program.push(new Load(0, { type: 'constant', value: tapeStartInMemory }));
    program.push(new ReadInput(1, { label: 'LD' }));
    program.push(new ConditionalJump('STA', { type: 'register', value: 1 }, '=', { type: 'constant', value: -1 }));
    program.push(new LoadToAddress(0, { type: 'register', value: 1 }));
    program.push(new Add(0, { type: 'register', value: 0 }, { type: 'constant', value: 1 }));
    program.push(new Jump('LD'));

    // Init variables
    program.push(new Load(0, { type: "constant", value: tm.tapePointer + tapeStartInMemory }, { label: 'STA' } ));
    program.push(new Jump(`q${tm.initialState}`));

    // Based on symbol on the tape, use specific function
    let previousState;
    const sortedFunctions = tm.transitionFunctions.sort((a,b) => String(a.stateFrom).localeCompare(String(b.stateFrom)));
    for(const func of sortedFunctions) {
      if(func.stateFrom != previousState) {
        program.push(new LoadFromAddress(1, 0, { label: `q${func.stateFrom}`, name: 'newInstr' }));
        previousState = func.stateFrom;
      }
      const symbolFromEnc = this.encodeSymbol(func.symbolFrom);
      program.push(new ConditionalJump(`q${func.stateFrom}${func.symbolFrom}`, { type: "register", value: 1 }, "=", { type: "constant", value: symbolFromEnc}));
    }

    // TM Functions logic
    for(const func of tm.transitionFunctions) {
      const symbolToEnc = this.encodeSymbol(func.symbolTo);
      program.push(new LoadToAddress(0, { type: "constant", value: symbolToEnc }, { label: `q${func.stateFrom}${func.symbolFrom}`, name: 'tmState' }));
      if(func.action != 0) {
        program.push(new Add(0, { type: 'register', value: 0 }, { type: 'constant', value: func.action }));
      }
      program.push(new Jump(`q${func.stateTo}`));
    };

    for(const finalState of tm.finalStates) {
      program.push(new Jump('FIN', { label:  `q${finalState}`, name: 'tmState' }));
    }

    // Write memory at the end
    program.push(new Load(0, { type: 'constant', value: tapeStartInMemory }, { label: 'FIN' }));
    program.push(new Load(2, { type: 'constant', value: 0 }));
    program.push(new LoadFromAddress(1, 0, { label: 'PRT' }));
    program.push(new ConditionalJump('PR0', { type: 'register', value: 1 }, '!=', { type: 'constant', value: 0 }));
    program.push(new ConditionalJump('END', { type: 'register', value: 2 }, '=', { type: 'constant', value: 1 }));
    program.push(new Load(2, { type: 'constant', value: 1 }));
    program.push(new Jump('PR1'));
    program.push(new Load(2, { type: 'constant', value: 0 }, { label: 'PR0' }));
    program.push(new WriteOutput({ type: 'register', value: 1 }, { label: 'PR1' }));
    program.push(new Add(0, { type: 'register', value: 0 }, { type: 'constant', value: 1 }));
    program.push(new Jump('PRT'));
    program.push(new Halt({ label: 'END' }))
    // Other way
    /*program.push(new Load(0, { type: 'constant', value: tapeStartInMemory }, { label: 'FIN' }));
    program.push(new Load(2, { type: 'constant', value: 0 }));
    program.push(new LoadFromAddress(1, 0, { label: 'PRT' }));
    program.push(new ConditionalJump('PR3', { type: 'register', value: 1 }, '!=', { type: 'constant', value: 0 }));
    program.push(new ConditionalJump('END', { type: 'register', value: 2 }, '=', { type: 'constant', value: 1 }));
    program.push(new Load(2, { type: 'constant', value: 0 }, { label: 'PR3' }));
    program.push(new ConditionalJump('PR2', { type: 'register', value: 1 }, '!=', { type: 'constant', value: 0 }));
    program.push(new Load(2, { type: 'constant', value: 1 }));
    program.push(new WriteOutput({ type: 'register', value: 1 }, { label: 'PR2' }));
    program.push(new Add(0, { type: 'register', value: 0 }, { type: 'constant', value: 1 }));
    program.push(new Jump('PRT'));
    program.push(new Halt({ label: 'END' }))*/

    return program;
  }

  encodeSymbol(symbol: Symbol): number {
    const value = this.symbolLegend.get(symbol);
    if(value === undefined) {
      /*let counter = 1;
      this.symbolLegend.forEach(_ => counter++);
      this.symbolLegend.set(symbol, counter);
      return counter;*/
      throw new Error(`Unknown symbol '${symbol}' to encode.`);
    }
    return value;
  }

  decodeSymbol(num: number): Symbol|null {
    for(const value of this.symbolLegend) {
      if(value[1] == num) {
        return value[0];
      }
    }
    return null;
  }

  public step(): boolean {
    if(this.ram.hasEnded()) {
      return false;
    }
    
    let returnState = false;
    this.saveState();
    this.ram.step();
    if(this.ram.programUnit[this.ram.instructionPointer].options?.name == 'newInstr') {
      if(this.ignoreFirstNewInstr) {
        this.ignoreFirstNewInstr = false;
      }
      else {
        returnState = true;
        this.turing.step();
      }
    }
    if(this.ram.hasEnded()) {
      returnState = true;
      this.turing.step();
    }

    if(this.ram.hasEnded() != this.turing.hasEnded()) {
      throw new Error(`One machine ended before another.`);
    }
    return returnState;
  }

  public stepTuring(): void {
    while(!this.step()) {
      if(this.ram.hasEnded()) {
        return;
      }
    }
  }

  public backstepTuring(): void {
    while(!this.backstep()) {
      if(this.history.length == 0) {
        return;
      }
    }
  }

  public run(): void {
    while (!this.ram.hasEnded()) {
      this.step();
    }
  }

  public backstep(): boolean {
    if (this.history.length > 0) {
      const prevState = this.history.pop();
      if (prevState) {
        this.restoreState(prevState, null);
        if(this.ram.programUnit[this.ram.instructionPointer].options?.name == 'newInstr' && !this.ignoreFirstNewInstr) {
          return true;
        }
      }
    }
    return false;
  }

  public reset(): void {
    this.ram.reset();
    this.turing.reset();
    this.initializeRAM();
  }

  getState(): TMRAMSimulationState {
    const state: TMRAMSimulationState = {
      turingMachineState: this.turing.getState(),
      ramState: this.ram.getState(),
      ignoreFirstNewInstr: this.ignoreFirstNewInstr
    };
    return state;
  }

  private saveState(): void {
    this.history.push(this.getState());
  }

  restoreState(state: TMRAMSimulationState, newHistory: TMRAMSimulationState[]|null): void {
    if(newHistory) {
      this.history = newHistory;
    }
    this.ignoreFirstNewInstr = state.ignoreFirstNewInstr;
    this.ram.restoreState(state.ramState, this.history.map(h => h.ramState));
    this.turing.restoreState(state.turingMachineState, this.history.map(h => h.turingMachineState));
  }

  public getTuringMachineState(): TuringMachine {
    return this.turing;
  }

  public getRAMState(): RAMachine {
    return this.ram;
  }

  public getSymbolLegend() {
    return this.symbolLegend;
  }

  public getLastSimulatedState(): State|null {
    for(let i = this.history.length-1; i >= 0; i--) {
      const label = this.ram.programUnit[this.history[i].ramState.instructionPointer].options?.label;
      const name = this.ram.programUnit[this.history[i].ramState.instructionPointer].options?.name;
      if(label && name == 'tmState') {
        return label;
      }
    }
    return null;
  }
}

export default TuringMachineRAMSimulation;