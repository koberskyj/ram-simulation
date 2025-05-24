import { JSX } from "react";
import { Machine, MachineError } from "./Machine";

interface Instruction {
  options?: InstructionOption;
  execute(machine: RAMachine): void;
  asComponent(): JSX.Element;
}

interface RAMachineState {
  instructionPointer: number;
  memory: Map<number, number>;
  input: number[];
  output: number[];
  halted: boolean;
}

interface InstructionOption {
  label?: string;
  name?: string;
}

type Tape = number[];
type Memory = Map<number, number>;
type InstructionSet = Instruction[];
type JumpTarget = number | string;

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

class RAMachine extends Machine {
  public programUnit: InstructionSet;
  public instructionPointer: number;
  public memory: Memory;
  public input: Tape;
  public output: Tape;
  public halted: boolean;
  history: RAMachineState[];
  private labelMap: Map<string, number>;

  constructor(program: InstructionSet = [], input: Tape = []) {
    super();
    this.programUnit = program;
    this.input = input;
    this.output = [];
    this.memory = new Map<number, number>();
    this.instructionPointer = 0;
    this.halted = false;
    this.history = [];
    this.labelMap = new Map<string, number>();
    this.buildLabelMap();
  }

  private buildLabelMap(): void {
    this.programUnit.forEach((instr, index) => {
      if (instr.options?.label) {
        if (this.labelMap.has(instr.options.label)) {
          throw new MachineError(`Duplicitní návěští '${instr.options.label}'`, 'RAM');
        }
        this.labelMap.set(instr.options.label, index);
      }
    });
  }

  public getLabelIndex(name: string): number {
    const index = this.labelMap.get(name);
    if (index === undefined) {
      throw new MachineError(`Návěští '${name}' nenalezeno`, 'RAM');
    }
    return index;
  }

  run(): void {
    let run = 0;
    while(!this.hasEnded()) {
      if(run >= 2000) {
        throw new MachineError(`Překročen maximální počet kroků`, 'RAM');
      }
      this.step();
      run++;
    }
  }

  step(): void {
    if(this.hasEnded()) {
      return;
    }

    this.saveState();
    const currentPointer = this.instructionPointer;
    const instr = this.programUnit[this.instructionPointer];
    instr.execute(this);

    if (!this.halted && this.instructionPointer === currentPointer) {
      this.instructionPointer++;
    }
  }

  backstep(): void {
    if (this.history.length > 0) {
      const prevState = this.history.pop();
      if (prevState) {
        this.restoreState(prevState, null);
      }
    }
  }

  hasEnded(): boolean {
    return this.halted || this.instructionPointer >= this.programUnit.length;
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

  getState(): RAMachineState {
    const state: RAMachineState = {
      instructionPointer: this.instructionPointer,
      memory: new Map(this.memory),
      input: this.input.slice(),
      output: this.output.slice(),
      halted: this.halted,
    };
    return state;
  }

  private saveState(): void {
    this.history.push(this.getState());
  }

  restoreState(state: RAMachineState, newHistory: RAMachineState[]|null): void {
    if(newHistory) {
      this.history = newHistory;
    }
    this.instructionPointer = state.instructionPointer;
    this.memory = new Map(state.memory);
    this.input = state.input.slice();
    this.output = state.output.slice();
    this.halted = state.halted;
  }

  reset(): void {
    if(this.history.length > 0) {
      this.restoreState(this.history[0], []);
    }
  }

  getPreviousState(): RAMachineState | undefined {
    return this.history.length ? this.history[this.history.length - 1] : undefined;
  }

  getLastLabel(): string|null {
    for(let i = this.history.length-1; i >= 0; i--) {
      const label = this.programUnit[this.history[i].instructionPointer].options?.label;
      if(label) {
        return label;
      }
    }
    return null;
  }
}

class Load implements Instruction {
  options?: InstructionOption;
  private register: number;
  private operand: Operand;
  constructor(register: number, operand: Operand, options?: InstructionOption) {
    this.register = register;
    this.operand = operand;
    this.options = options;
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
  options?: InstructionOption;
  private registerWithAddressFrom: number;
  private registerTo: number;
  constructor(registerTo: number, registerWithAddressFrom: number, options?: InstructionOption) {
    this.registerWithAddressFrom = registerWithAddressFrom;
    this.registerTo = registerTo;
    this.options = options;
  }
  execute(machine: RAMachine): void {
    const address = machine.readMemory(this.registerWithAddressFrom);
    const value = machine.readMemory(address);
    machine.writeMemory(this.registerTo, value);
  }
  asComponent(): JSX.Element {
    return <span>R<sub>{this.registerTo}</sub> := [R<sub>{this.registerWithAddressFrom}</sub>]</span>;
  }
}

class LoadToAddress implements Instruction {
  options?: InstructionOption;
  private operandFrom: Operand;
  private registerWithAddressTo: number;
  constructor(registerWithAddressTo: number, operandFrom: Operand, options?: InstructionOption) {
    this.operandFrom = operandFrom;
    this.registerWithAddressTo = registerWithAddressTo;
    this.options = options;
  }
  execute(machine: RAMachine): void {
    const value = resolveOperand(machine, this.operandFrom);
    const address = machine.readMemory(this.registerWithAddressTo);
    machine.writeMemory(address, value);
  }
  asComponent(): JSX.Element {
    return <span>[R<sub>{this.registerWithAddressTo}</sub>] := {operandToJSX(this.operandFrom)}</span>;
  }
}

class Add implements Instruction {
  options?: InstructionOption;
  private registerTo: number;
  private operand1: Operand;
  private operand2: Operand;
  constructor(registerTo: number, operand1: Operand, operand2: Operand, options?: InstructionOption) {
    this.registerTo = registerTo;
    this.operand1 = operand1;
    this.operand2 = operand2;
    this.options = options;
  }
  execute(machine: RAMachine): void {
    const value1 = resolveOperand(machine, this.operand1);
    const value2 = resolveOperand(machine, this.operand2);
    machine.writeMemory(this.registerTo, value1 + value2);
  }
  asComponent(): JSX.Element {
    const operand = { ...this.operand2 };
    operand.value = Math.abs(operand.value);
    return (
      <span>R<sub>{this.registerTo}</sub> := {operandToJSX(this.operand1)} {this.operand2.value == operand.value ? '+' : '-'} {operandToJSX(operand)}</span>
    );
  }
}

class Subtract implements Instruction {
  options?: InstructionOption;
  private registerTo: number;
  private operand1: Operand;
  private operand2: Operand;
  constructor(registerTo: number, operand1: Operand, operand2: Operand, options?: InstructionOption) {
    this.registerTo = registerTo;
    this.operand1 = operand1;
    this.operand2 = operand2;
    this.options = options;
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
  options?: InstructionOption;
  private registerTo: number;
  constructor(registerTo: number, options?: InstructionOption) {
    this.registerTo = registerTo;
    this.options = options;
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
  options?: InstructionOption;
  private operandFrom: Operand;
  constructor(operandFrom: Operand, options?: InstructionOption) {
    this.operandFrom = operandFrom;
    this.options = options;
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
  options?: InstructionOption;
  private target: JumpTarget;
  constructor(target: JumpTarget, options?: InstructionOption) {
    this.target = target;
    this.options = options;
  }
  execute(machine: RAMachine): void {
    let resolvedTarget: number;
    if (typeof this.target === "string") {
      resolvedTarget = machine.getLabelIndex(this.target);
    } else {
      resolvedTarget = this.target - 1;
    }
    machine.instructionPointer = resolvedTarget;
  }
  asComponent(): JSX.Element {
    return <span>goto {this.target}</span>;
  }
}

// Conditional jump accepting a JumpTarget.
type CompareOperation = '=' | '!=' | '<' | '<=' | '>' | '>=';
class ConditionalJump implements Instruction {
  options?: InstructionOption;
  private target: JumpTarget;
  private operand1: Operand;
  private compareOperation: CompareOperation;
  private operand2: Operand;
  constructor(target: JumpTarget, operand1: Operand, compareOperation: CompareOperation, operand2: Operand, options?: InstructionOption) {
    this.target = target;
    this.operand1 = operand1;
    this.compareOperation = compareOperation;
    this.operand2 = operand2;
    this.options = options;
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
      let resolvedTarget: number;
      if (typeof this.target === "string") {
        resolvedTarget = machine.getLabelIndex(this.target);
      } else {
        resolvedTarget = this.target - 1;
      }
      machine.instructionPointer = resolvedTarget;
    }
  }
  asComponent(): JSX.Element {
    return (
      <span>if ({operandToJSX(this.operand1)} {this.compareOperation} {operandToJSX(this.operand2)}) goto {this.target}</span>
    );
  }
}

class Halt implements Instruction {
  options?: InstructionOption;
  constructor(options?: InstructionOption) {
    this.options = options;
  }
  execute(machine: RAMachine): void {
    machine.halt();
  }
  asComponent() {
    return <span>halt</span>;
  }
}

const program: Instruction[] = [
  new Load(0, { type: 'constant', value: 3 }),                                                                      //      R0 := 3
  new Load(1, { type: 'register', value: 0 }),                                                                      //      R1 := R0
  new ReadInput(2, { label: 'L1' }),                                                                                // L1 : R2 := READ()
  new ConditionalJump('L3', { type: 'register', value: 2 }, '=', { type: 'constant', value: 0 }),                   //      if(R2 = 0) goto L3
  new LoadToAddress(1, { type: "register", value: 2 }),                                                             //      [R1] := R2
  new Add(1, { type: 'register', value: 1 }, { type: 'constant', value: 1 }),                                       //      R1 := R1 + 1
  new Jump('L1'),                                                                                                   //      goto L1
  new Subtract(1, { type: 'register', value: 1 }, { type: 'constant', value: 1 }, { label: 'L2' }),                 // L2 : R1 := R1 - 1
  new LoadFromAddress(2, 1),                                                                                        //      R2 := [R1]
  new WriteOutput({ type: 'register', value: 2 }),                                                                  //      WRITE(R2)
  new ConditionalJump('L2', { type: 'register', value: 1 }, '>', { type: 'register', value: 0 }, { label: 'L3' }),  // L3 : if(R1 > R0) goto L2
  new Halt()                                                                                                        //      halt
];

export default RAMachine;
export { Load, LoadFromAddress, LoadToAddress, Add, Subtract, ReadInput, WriteOutput, Jump, ConditionalJump, Halt, program }
export type { Instruction, CompareOperation, Tape, Memory, InstructionSet, Operand, JumpTarget, RAMachineState }