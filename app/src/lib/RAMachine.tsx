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

/**
 * R0 := 3
 * new LoadConstant(0, 3)
 * Save constant 3 to register R0
 */
class LoadConstant implements Instruction {
  private value: number;
  private register: number;
  constructor(register: number, value: number) {
    this.value = value;
    this.register = register;
  }
  execute(machine: RAMachine): void {
    machine.writeMemory(this.register, this.value);
  }
  asComponent() {
    return <span>R<sub>{this.register}</sub> := {this.value}</span>;
  }
}

/**
 * R1 := R0
 * new LoadFromMemory(1, 0)
 * Save number from register R0 to register R1
 */
class LoadFromMemory implements Instruction {
  private registerFrom: number;
  private registerTo: number;
  constructor(registerTo: number, registerFrom: number) {
    this.registerFrom = registerFrom;
    this.registerTo = registerTo;
  }
  execute(machine: RAMachine): void {
    const value = machine.readMemory(this.registerFrom);
    machine.writeMemory(this.registerTo, value);
  }
  asComponent() {
    return <span>R<sub>{this.registerTo}</sub> := R<sub>{this.registerFrom}</sub></span>;
  }
}

/**
 * R2 := [R1]
 * new LoadFromAddress(2, 1)
 * Save number from register at R1 position to register R2
 */
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
  asComponent() {
    return <span>R<sub>{this.registerTo}</sub> := [R<sub>{this.registerWithAddressFrom}</sub>]</span>;
  }
}

/**
 * [R1] := R2
 * new StoreFromAddress(1, 2)
 * Save number from register R2 to position, where R1 points.
 */
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
  asComponent() {
    return <span>[R<sub>{this.registerWithAddressTo}</sub>] := R<sub>{this.registerFrom}</sub></span>;
  }
}

class Add implements Instruction {
  private registerTo: number;
  private registerFrom1: number;
  private registerFrom2: number;
  constructor(registerTo: number, registerFrom1: number, registerFrom2: number) {
    this.registerTo = registerTo;
    this.registerFrom1 = registerFrom1;
    this.registerFrom2 = registerFrom2;
  }
  execute(machine: RAMachine): void {
    const value1 = machine.readMemory(this.registerFrom1);
    const value2 = machine.readMemory(this.registerFrom2);
    machine.writeMemory(this.registerTo, value1 + value2);
  }
  asComponent() {
    return <span>R<sub>{this.registerTo}</sub> := R<sub>{this.registerFrom1}</sub> + R<sub>{this.registerFrom2}</sub></span>;
  }
}

class Subtract implements Instruction {
  private registerTo: number;
  private registerFrom1: number;
  private registerFrom2: number;
  constructor(registerTo: number, registerFrom1: number, registerFrom2: number) {
    this.registerTo = registerTo;
    this.registerFrom1 = registerFrom1;
    this.registerFrom2 = registerFrom2;
  }
  execute(machine: RAMachine): void {
    const value1 = machine.readMemory(this.registerFrom1);
    const value2 = machine.readMemory(this.registerFrom2);
    machine.writeMemory(this.registerTo, value1 - value2);
  }
  asComponent() {
    return <span>R<sub>{this.registerTo}</sub> := R<sub>{this.registerFrom1}</sub> - R<sub>{this.registerFrom2}</sub></span>;
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
  asComponent() {
    return <span>R<sub>{this.registerTo}</sub> := READ()</span>;
  }
}

class WriteOutput implements Instruction {
  private registerFrom: number;
  constructor(registerFrom: number) {
    this.registerFrom = registerFrom;
  }
  execute(machine: RAMachine): void {
    const value = machine.readMemory(this.registerFrom);
    machine.writeOutput(value);
  }
  asComponent() {
    return <span>WRITE(R<sub>{this.registerFrom}</sub>)</span>;
  }
}

class Jump implements Instruction {
  private address: number;
  constructor(address: number) {
    this.address = address;
  }
  execute(machine: RAMachine): void {
    machine.instructionPointer = this.address - 1; // -1 because this is still an instruction
  }
  asComponent() {
    return <span>goto {this.address}</span>;
  }
}

type CompareOperation = '=' | '!=' | '<' | '<=' | '>' | '>=';
class ConditionalJump implements Instruction {
  private address: number;
  private registerCmp1: number;
  private compareOperation: CompareOperation;
  private registerCmp2: number;
  constructor(address: number, registerCmp1: number, compareOperation: CompareOperation, registerCmp2: number) {
    this.address = address;
    this.registerCmp1 = registerCmp1;
    this.compareOperation = compareOperation;
    this.registerCmp2 = registerCmp2;
  }
  execute(machine: RAMachine): void {
    const value1 = machine.readMemory(this.registerCmp1);
    const value2 = machine.readMemory(this.registerCmp2);
    let shouldJump = false;

    switch (this.compareOperation) {
      case '=': 
        shouldJump = value1 === value2; break;
      case '!=': shouldJump = value1 !== value2;
        break;
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
      machine.instructionPointer = this.address - 1; // -1 because this is still an instruction
    }
  }
  asComponent() {
    return <span>if (R<sub>{this.registerCmp1}</sub> {this.compareOperation} R<sub>{this.registerCmp2}</sub>) goto {this.address}</span>;
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
  new LoadConstant(0, 3),             // R0 := 3
  new LoadFromMemory(1, 0),           // R1 := R0
  new ReadInput(2),                   // R2 := READ()
  new LoadConstant(9, 0),             // (Navíc) R0 := 0
  new ConditionalJump(13, 2, '=', 9), // if(R2 = R0) goto L3
  new LoadToAddress(1, 2),            // [R1] := R2
  new LoadConstant(9, 1),             // (Navíc) R0 := 1
  new Add(1, 1, 9),                   // R1 := R1 + R0
  new Jump(2),                        // goto L1
  new LoadConstant(9, 1),             // (Navíc) R0 := 1
  new Subtract(1, 1, 9),              // R1 := R1 - R0
  new LoadFromAddress(2, 1),          // R2 := [R1]
  new WriteOutput(2),                 // WRITE(R2)
  new ConditionalJump(9, 1, '>', 0),  // if(R1 > R0) goto L2
  new Halt()
];

export default RAMachine;
export { LoadConstant, LoadFromMemory, LoadFromAddress, LoadToAddress, Add, Subtract, ReadInput, WriteOutput, Jump, ConditionalJump, Halt, program }
export type { Instruction, CompareOperation, Tape, Memory, InstructionSet }