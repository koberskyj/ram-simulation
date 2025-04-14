import RAMachine, { Add, InstructionSet, Jump, Load, LoadToAddress } from "./RAMachine";
import TuringMachine, { Symbol } from "./TuringMachine";


class TuringMachineRAMSimulator {
  private turingMachine: TuringMachine;
  private ram: RAMachine;
  private ramProgram: InstructionSet;
  private symbolLegend: Map<Symbol, number>;
  private programStepSizes: number[];

  constructor(turingMachine: TuringMachine) {
    this.turingMachine = turingMachine;
    this.ramProgram = this.compileTMToRAMProgram(this.turingMachine);
    this.ram = new RAMachine(this.ramProgram, []);
    this.symbolLegend = new Map();
    this.programStepSizes = [];
    this.initializeRAM();
  }

  private initializeRAM(): void {
    this.turingMachine.getTapeAlphabet().forEach((symbol, index) => {
      this.symbolLegend.set(symbol, index);
    });

    this.turingMachine.tape.forEach(symbol => {
      this.encodeSymbol(symbol); // Redundancy
    });
  }

  private compileTMToRAMProgram(tm: TuringMachine): InstructionSet {
    let program: InstructionSet = [];
    tm.transitionFunctions.forEach((func, index) => {
      const symbolToEnc = this.encodeSymbol(func.symbolTo);
      program.push(new LoadToAddress(0, symbolToEnc, `q${func.stateFrom}${func.symbolFrom}`));
      program.push(new Add(1, { type: 'register', value: 0 }, { type: 'constant', value: func.action }));
      program.push(new Jump(`q${func.stateTo}`)); // TODO jak zjistit symbol 
      this.programStepSizes.push(3);
    });

    return program;
  }

  private encodeSymbol(symbol: Symbol): number {
    const value = this.symbolLegend.get(symbol);
    if(value === undefined) {
      let counter = 1;
      this.symbolLegend.forEach(_ => counter++);
      this.symbolLegend.set(symbol, counter);
      return counter;
    }
    return value;
  }

  private decodeSymbol(num: number): Symbol|null {
    for(const value of this.symbolLegend) {
      if(value[1] == num) {
        return value[0];
      }
    }
    return null;
  }

  public step(): void {

  }

  public run(): void {
    while (!this.turingMachine.finalStates.includes(this.turingMachine.currentState)) {
      this.step();
    }
  }

  public backstep(): void {
    this.ram.backstep();
    this.turingMachine.backstep();
  }

  public reset(): void {
    this.ram.reset();
    this.turingMachine.reset();
    this.initializeRAM();
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