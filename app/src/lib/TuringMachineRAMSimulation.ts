import RAMachine, { Add, ConditionalJump, Halt, InstructionSet, Jump, Load, LoadFromAddress, LoadToAddress, RAMachineState } from "./RAMachine";
import TuringMachine, { Symbol, TuringMachineState } from "./TuringMachine";

export interface TMRAMSimulationState {
  turingMachineState: TuringMachineState;
  ramState: RAMachineState;
  ignoreFirstNewInstr: boolean;
}

class TuringMachineRAMSimulation {
  ram: RAMachine;
  private turingMachine: TuringMachine;
  private ramProgram: InstructionSet;
  private symbolLegend: Map<Symbol, number>;
  private ignoreFirstNewInstr = true;
  private history: TMRAMSimulationState[];

  constructor(turingMachine: TuringMachine) {
    this.turingMachine = turingMachine;
    this.symbolLegend = new Map();
    this.ramProgram = [];
    this.history = [];
    this.ram = this.initializeRAM();
  }

  private initializeRAM(): RAMachine {
    this.history = [];
    this.ignoreFirstNewInstr = true;
    this.symbolLegend.set('□', 0);
    this.turingMachine.getTapeAlphabet().forEach((symbol, index) => {
      this.symbolLegend.set(symbol, index);
    });

    this.ramProgram = this.compileTMToRAMProgram(this.turingMachine);
    const ram = new RAMachine(this.ramProgram, []);
    ram.memory.set(2, 0);
    for(const tapeLocation of this.turingMachine.tape) {
      ram.memory.set(tapeLocation[0] + 3, this.encodeSymbol(tapeLocation[1]));
    }

    return ram;
  }

  private compileTMToRAMProgram(tm: TuringMachine): InstructionSet {
    let program: InstructionSet = [];

    program.push(new Load(0, { type: "constant", value: tm.tapePointer + 3 }));
    program.push(new Jump(`q${tm.initialState}`));

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

    for(const func of tm.transitionFunctions) {
      const symbolToEnc = this.encodeSymbol(func.symbolTo);
      program.push(new LoadToAddress(0, { type: "constant", value: symbolToEnc }, { label: `q${func.stateFrom}${func.symbolFrom}` }));
      if(func.action != 0) {
        program.push(new Add(0, { type: 'register', value: 0 }, { type: 'constant', value: func.action }));
      }

      if(tm.finalStates.includes(func.stateTo)) {
        program.push(new Halt());
      }
      else {
        program.push(new Jump(`q${func.stateTo}`));
      }
    };

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

  public step(): void {
    if(this.ram.hasEnded()) {
      return;
    }
    
    this.saveState();
    this.ram.step();
    if(this.ram.programUnit[this.ram.instructionPointer].options?.name == 'newInstr') {
      if(this.ignoreFirstNewInstr) {
        this.ignoreFirstNewInstr = false;
      }
      else {
        this.turingMachine.step();
      }
    }
    if(this.ram.hasEnded()) {
      this.turingMachine.step();
    }

    if(this.ram.hasEnded() != this.turingMachine.hasEnded()) {
      throw new Error(`One machine ended before another.`);
    }
  }

  public run(): void {
    while (!this.ram.hasEnded()) {
      this.step();
    }
  }

  public backstep(): void {
    if (this.history.length > 0) {
      const prevState = this.history.pop();
      if (prevState) {
        this.restoreState(prevState);
      }
    }
  }

  public reset(): void {
    this.ram.reset();
    this.turingMachine.reset();
    this.initializeRAM();
  }

  getState(): TMRAMSimulationState {
    const state: TMRAMSimulationState = {
      turingMachineState: this.turingMachine.getState(),
      ramState: this.ram.getState(),
      ignoreFirstNewInstr: this.ignoreFirstNewInstr
    };
    return state;
  }

  private saveState(): void {
    this.history.push(this.getState());
  }

  restoreState(state: TMRAMSimulationState): void {
    this.ignoreFirstNewInstr = state.ignoreFirstNewInstr;
    this.ram.restoreState(state.ramState);
    this.turingMachine.restoreState(state.turingMachineState);
  }

  public getTuringMachineState(): TuringMachine {
    return this.turingMachine;
  }

  public getRAMState(): RAMachine {
    return this.ram;
  }

  public getSymbolLegend() {
    return this.symbolLegend;
  }
}

export default TuringMachineRAMSimulation;