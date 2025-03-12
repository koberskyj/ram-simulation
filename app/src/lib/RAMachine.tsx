import { JSX } from "react";

interface Instruction {
  execute(machine: RAMachine): void;
  asComponent(): JSX.Element;
}

interface MachineState {
  instructionPointer: number;
  memory: Map<number, number>;
  input: number[];
  output: number[];
  halted: boolean;
}

type Tape = number[];
type Memory = Map<number, number>;
type InstructionSet = Instruction[];

type Operand = 
  | { type: 'constant'; value: number }
  | { type: 'register'; value: number };

function resolveOperand(machine: RAMachine, operand: Operand): number {
  return operand.type === 'constant'
    ? operand.value
    : machine.readMemory(operand.value);
}

function operandToJSX(operand: Operand): JSX.Element {
  return operand.type === 'constant'
    ? <span>{operand.value}</span>
    : <span>R<sub>{operand.value}</sub></span>;
}

class RAMachine {
  public programUnit: InstructionSet;
  public instructionPointer: number;
  public memory: Memory;
  public input: Tape;
  public output: Tape;
  public halted: boolean;
  private history: MachineState[];

  constructor(program: InstructionSet = [], input: Tape = []) {
    this.programUnit = program;
    this.input = input;
    this.output = [];
    this.memory = new Map<number, number>();
    this.instructionPointer = 0;
    this.halted = false;
    this.history = [];
  }

  run(): void {
    while(!this.halted && this.instructionPointer < this.programUnit.length) {
      this.step();
    }
  }

  step(): void {
    if(this.halted) {
      return;
    }
    if(this.instructionPointer < this.programUnit.length) {
      this.saveState();
      const instr = this.programUnit[this.instructionPointer];
      instr.execute(this);
      if(!this.halted) {
        this.instructionPointer++;
      }
    }
  }

  backstep(): void {
    if (this.history.length > 0) {
      const prevState = this.history.pop();
      if (prevState) {
        this.restoreState(prevState);
      }
    }
  }

  halt(): void {
    this.halted = true;
  }

  readInput(): number | undefined {
    return this.input.shift();
  }

  writeOutput(value: number): void {
    this.output.push(value);
  }

  readMemory(address: number): number {
    return this.memory.get(address) ?? 0;
  }

  writeMemory(address: number, value: number): void {
    this.memory.set(address, value);
  }

  private saveState(): void {

    const state: MachineState = {
      instructionPointer: this.instructionPointer,
      memory: new Map(this.memory),
      input: this.input.slice(),
      output: this.output.slice(),
      halted: this.halted,
    };

    this.history.push(state);
  }

  private restoreState(state: MachineState): void {
    this.instructionPointer = state.instructionPointer;
    this.memory = new Map(state.memory);
    this.input = state.input.slice();
    this.output = state.output.slice();
    this.halted = state.halted;
  }

  reset(): void {
    if(this.history.length > 0) {
      this.restoreState(this.history[0]);
    }
  }

  getPreviousState(): MachineState | undefined {
    return this.history.length ? this.history[this.history.length - 1] : undefined;
  }
}

class Load implements Instruction {
  private register: number;
  private operand: Operand;
  constructor(register: number, operand: Operand) {
    this.register = register;
    this.operand = operand;
  }
  execute(machine: RAMachine): void {
    const value = resolveOperand(machine, this.operand);
    machine.writeMemory(this.register, value);
  }
  asComponent(): JSX.Element {
    return <span>R<sub>{this.register}</sub> := {operandToJSX(this.operand)}</span>;
  }
}

class LoadFromAddress implements Instruction {
  private registerWithAddressFrom: number;
  private registerTo: number;
  constructor(registerTo: number, registerWithAddressFrom: number) {
    this.registerWithAddressFrom = registerWithAddressFrom;
    this.registerTo = registerTo;
  }
  execute(machine: RAMachine): void {
    const register = machine.readMemory(this.registerWithAddressFrom);
    const value = machine.readMemory(register);
    machine.writeMemory(this.registerTo, value);
  }
  asComponent(): JSX.Element {
    return <span>R<sub>{this.registerTo}</sub> := [R<sub>{this.registerWithAddressFrom}</sub>]</span>;
  }
}

class LoadToAddress implements Instruction {
  private registerFrom: number;
  private registerWithAddressTo: number;
  constructor(registerWithAddressTo: number, registerFrom: number) {
    this.registerFrom = registerFrom;
    this.registerWithAddressTo = registerWithAddressTo;
  }
  execute(machine: RAMachine): void {
    const register = machine.readMemory(this.registerWithAddressTo);
    const value = machine.readMemory(this.registerFrom);
    machine.writeMemory(register, value);
  }
  asComponent(): JSX.Element {
    return <span>[R<sub>{this.registerWithAddressTo}</sub>] := R<sub>{this.registerFrom}</sub></span>;
  }
}

class Add implements Instruction {
  private registerTo: number;
  private operand1: Operand;
  private operand2: Operand;
  constructor(registerTo: number, operand1: Operand, operand2: Operand) {
    this.registerTo = registerTo;
    this.operand1 = operand1;
    this.operand2 = operand2;
  }
  execute(machine: RAMachine): void {
    const value1 = resolveOperand(machine, this.operand1);
    const value2 = resolveOperand(machine, this.operand2);
    machine.writeMemory(this.registerTo, value1 + value2);
  }
  asComponent(): JSX.Element {
    return (
      <span>R<sub>{this.registerTo}</sub> := {operandToJSX(this.operand1)} + {operandToJSX(this.operand2)}</span>
    );
  }
}

class Subtract implements Instruction {
  private registerTo: number;
  private operand1: Operand;
  private operand2: Operand;
  constructor(registerTo: number, operand1: Operand, operand2: Operand) {
    this.registerTo = registerTo;
    this.operand1 = operand1;
    this.operand2 = operand2;
  }
  execute(machine: RAMachine): void {
    const value1 = resolveOperand(machine, this.operand1);
    const value2 = resolveOperand(machine, this.operand2);
    machine.writeMemory(this.registerTo, value1 - value2);
  }
  asComponent(): JSX.Element {
    return (
      <span>R<sub>{this.registerTo}</sub> := {operandToJSX(this.operand1)} - {operandToJSX(this.operand2)}</span>
    );
  }
}

class ReadInput implements Instruction {
  private registerTo: number;
  constructor(registerTo: number) {
    this.registerTo = registerTo;
  }
  execute(machine: RAMachine): void {
    const value = machine.readInput() ?? 0;
    machine.writeMemory(this.registerTo, value);
  }
  asComponent(): JSX.Element {
    return <span>R<sub>{this.registerTo}</sub> := READ()</span>;
  }
}

class WriteOutput implements Instruction {
  private operandFrom: Operand;
  constructor(operandFrom: Operand) {
    this.operandFrom = operandFrom;
  }
  execute(machine: RAMachine): void {
    const value = resolveOperand(machine, this.operandFrom);
    machine.writeOutput(value);
  }
  asComponent(): JSX.Element {
    return <span>WRITE({operandToJSX(this.operandFrom)})</span>;
  }
}

class Jump implements Instruction {
  private address: number;
  constructor(address: number) {
    this.address = address;
  }
  execute(machine: RAMachine): void {
    machine.instructionPointer = this.address - 1 - 1; // -1 because this is still an instruction, -1 because line numbers start from 1
  }
  asComponent(): JSX.Element {
    return <span>goto {this.address}</span>;
  }
}

type CompareOperation = '=' | '!=' | '<' | '<=' | '>' | '>=';
class ConditionalJump implements Instruction {
  private address: number;
  private operand1: Operand;
  private compareOperation: CompareOperation;
  private operand2: Operand;
  constructor(address: number, operand1: Operand, compareOperation: CompareOperation, operand2: Operand) {
    this.address = address;
    this.operand1 = operand1;
    this.compareOperation = compareOperation;
    this.operand2 = operand2;
  }
  execute(machine: RAMachine): void {
    const value1 = resolveOperand(machine, this.operand1);
    const value2 = resolveOperand(machine, this.operand2);
    let shouldJump = false;

    switch (this.compareOperation) {
      case '=':
        shouldJump = value1 === value2; break;
      case '!=':
        shouldJump = value1 !== value2; break;
      case '<':
        shouldJump = value1 < value2; break;
      case '<=':
        shouldJump = value1 <= value2; break;
      case '>':
        shouldJump = value1 > value2; break;
      case '>=':
        shouldJump = value1 >= value2; break;
    }

    if (shouldJump) {
      machine.instructionPointer = this.address - 1 - 1;
    }
  }
  asComponent(): JSX.Element {
    return (
      <span>if ({operandToJSX(this.operand1)} {this.compareOperation} {operandToJSX(this.operand2)}) goto {this.address}</span>
    );
  }
}

class Halt implements Instruction {

  execute(machine: RAMachine): void {
    machine.halt();
  }
  asComponent() {
    return <span>halt</span>;
  }
}

const program: Instruction[] = [
  new Load(0, { type: 'constant', value: 3 }),                                                  // R0 := 3
  new Load(1, { type: 'register', value: 0 }),                                                  // R1 := R0
  new ReadInput(2),                                                                             // R2 := READ()
  new ConditionalJump(11, { type: 'register', value: 2 }, '=', { type: 'constant', value: 0 }), // if(R2 = 0) goto L3
  new LoadToAddress(1, 2),                                                                      // [R1] := R2
  new Add(1, { type: 'register', value: 1 }, { type: 'constant', value: 1 }),                   // R1 := R1 + 1
  new Jump(3),                                                                                  // goto L1
  new Subtract(1, { type: 'register', value: 1 }, { type: 'constant', value: 1 }),              // R1 := R1 - 1
  new LoadFromAddress(2, 1),                                                                    // R2 := [R1]
  new WriteOutput({ type: 'register', value: 2 }),                                              // WRITE(R2)
  new ConditionalJump(8, { type: 'register', value: 1 }, '>', { type: 'register', value: 0 }),  // if(R1 > R0) goto L2
  new Halt()                                                                                    // halt
];

export default RAMachine;
export { Load, LoadFromAddress, LoadToAddress, Add, Subtract, ReadInput, WriteOutput, Jump, ConditionalJump, Halt, program }
export type { Instruction, CompareOperation, Tape, Memory, InstructionSet, Operand }