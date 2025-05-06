
export class MachineError extends Error { 
  cause: any;
  machine?: string;
  constructor(message: string, machine?: string, cause?: any) {
    super(message);
    this.name = "MachineError";
    this.machine = machine;
    this.cause = cause;
  }
}

export class Machine {

}