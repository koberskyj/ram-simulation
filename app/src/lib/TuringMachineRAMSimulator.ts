import RAMachine, { Add, InstructionSet, Jump, Load, LoadToAddress } from "./RAMachine";
import TuringMachine, { Symbol } from "./TuringMachine";


class TuringMachineRAMSimulator {
  private turingMachine: TuringMachine;
  private ram: RAMachine;
  private ramProgram: InstructionSet;
  private symbolLegend: Map<Symbol, number>;

  constructor(turingMachine: TuringMachine) {
    this.turingMachine = turingMachine;
    this.ramProgram = this.compileTMToRAMProgram(this.turingMachine);
    this.ram = new RAMachine(this.ramProgram, []);
    this.symbolLegend = new Map();
    this.initializeRAM();
  }

  private initializeRAM(): void {
    this.turingMachine.getTapeAlphabet().forEach((symbol, index) => {

    });

    this.turingMachine.tape.forEach((symbol, index) => {
      
    });
  }

  private compileTMToRAMProgram(tm: TuringMachine): InstructionSet {
    let program: InstructionSet = [];
    tm.transitionFunctions.forEach((func, index) => {
      const symbolToEnc = this.encodeSymbol(func.symbolTo);
      program.push(new LoadToAddress(0, symbolToEnc, `q${func.stateFrom}${func.symbolFrom}`));
      program.push(new Add(1, { type: 'register', value: 0 }, { type: 'constant', value: func.action }));
      program.push(new Jump(`q${func.stateTo}`)); // TODO
    });

    return program;
  }

  private encodeSymbol(symbol: Symbol): number {

    return 0;
  }

  private decodeSymbol(num: number): Symbol|null {
    
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