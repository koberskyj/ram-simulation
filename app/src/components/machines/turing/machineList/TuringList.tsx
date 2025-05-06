
import rawMachines from '@/baseTuringMachines.json';
import { State, TransitionFunction, TuringMachineDefinition, Symbol } from "@/lib/TuringMachine";
import TuringCreator from "../creator/TuringCreator";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Copy, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ButtonHover from '@/components/custom/ButtonHover';
import TuringImport from '../creator/TuringImport';
import { toast } from 'sonner';

const baseMachines = rawMachines;

const turingMachines = () => JSON.parse(localStorage.getItem('turingMachines') ?? JSON.stringify(baseMachines));

export interface TuringMachineSave {
  name: string;
  description?: string;
  tapeArray: Symbol[];
  alphabet: Symbol[];
  transitionFunctions: TransitionFunction[];
  initialState: State;
  finalStates: State[];
}

type TuringListType = { 
  onUpdate: (turingSave: TuringMachineSave|null) => void;
} & React.ComponentProps<"div">;

export default function TuringList({ onUpdate, ...props}: TuringListType) {
  const [ machines, setMachines ] = useState<TuringMachineSave[]>(turingMachines());
  const [ editingMachineId, setEditingMachineId ] = useState<number|null>(null);
  const [ selectedMachineId, setSelectedMachineId ] = useState<number|null>(null);
  const [ editingOpen, setEditingOpen ] = useState(false);
  const [ showImport, setShowImport ] = useState(false);

  useEffect(() => {
    if(machines.length > 0 && selectedMachineId==null) {
      setSelectedMachineId(0);
      onUpdate(machines[0]);
    }
  }, []);

  useEffect(() => {
    /*if(selectedMachineId == null) {
      onUpdate(null);
      return;
    }
    onUpdate(machines[selectedMachineId]);*/
  }, [selectedMachineId]);

  useEffect(() => {
    setEditingOpen(editingMachineId != null);
  }, [editingMachineId]);

  useEffect(() => {
      localStorage.setItem('turingMachines', JSON.stringify(machines));
  }, [machines]);

  const saveTuringDefinition = (definition: TuringMachineDefinition, name: string, description: string|undefined) => {
    setEditingOpen(false);

    const maxValue = definition.tape.size == 0 ? 0 : Math.max(...definition.tape.keys());
    const tapeArray: Symbol[] = Array(maxValue+1).fill('□', 0, maxValue+1);
    for(const [key, value] of definition.tape) {
      tapeArray[key] = value;
    }

    const machineSave = {
      ...definition,
      tape: undefined,
      tapeArray: tapeArray,
      name, description
    }

    if(editingMachineId == -1) {
      setMachines(prev => [...prev, machineSave]);
      setSelectedMachineId(machines.length);
      onUpdate(machineSave);
      toast.success('Nová definice Turingova stroje úspěšně vytvořena');
    }
    else if(editingMachineId !== null) {
      setMachines(prev => prev.map((item, idx) => idx === editingMachineId ? machineSave : item ));
      selectMachine(editingMachineId);
      onUpdate(machineSave);
      toast.success('Definice Turingova stroje upravena');
    }
  }

  const editMachine = (id: number) => {
    setEditingMachineId(id);
    setEditingOpen(true);
  }

  const selectMachine = (id: number) => {
    setSelectedMachineId(id);
    setEditingOpen(false);
    onUpdate(machines[id]);
  }

  const copyMachine = (id: number) => {
    navigator.clipboard.writeText(JSON.stringify(machines[id]));
    toast.info(`Definice stroje ${machines[id].name.toLocaleLowerCase()} byla zkopírována do schránky`);
  }

  const removeMachine = (id: number) => {
    if(machines.length < 2) {
      return;
    }
    setMachines(prev => prev.filter((_, idx) => idx != id));
    selectMachine(0);
    setEditingMachineId(null);
    toast.info(`Definice stroje ${machines[id].name.toLocaleLowerCase()} odebrána`);
  }

  const createNewMachine = () => {
    setEditingMachineId(-1);
    setEditingOpen(true);
  }

  const importMachine = (save: TuringMachineSave) => {
    setShowImport(false);
    setMachines(prev => [...prev, save]);
    setSelectedMachineId(machines.length);
    toast.success('Definice Turingova stroje úspěšně importována');
    onUpdate(save);
  }

  return(
    <div {...props}>
      <div>
        <div className='border-1 rounded-md mb-6 max-h-[400px] overflow-auto'>
          {machines.map((m,i) => 
            <div key={i} className={'flex justify-between items-center flex-wrap pl-4 pr-2 hover:bg-primary/5 '+(selectedMachineId==i ? 'bg-primary/10 hover:bg-primary/15' : '')}>
              <span className="font-semibold grow-[10]">
                {m.name} {m.description ? <span className="text-muted-foreground text-sm font-normal">- {m.description}</span> : ''}
              </span>
              <div className='flex justify-end grow'>
                <ButtonHover hoverContent={<p>Zvolit k simulaci</p>} className='text-green-600 hover:text-green-600 hover:bg-green-600/10' variant="ghost" size="icon" onClick={() => selectMachine(i)}>
                  <Check />
                </ButtonHover>
                <ButtonHover hoverContent={<p>Upravit stroj</p>} className='text-yellow-600 hover:text-yellow-600 hover:bg-yellow-600/10' variant="ghost" size="icon" onClick={() => editMachine(i)}>
                  <Pencil />
                </ButtonHover>
                <ButtonHover hoverContent={<p>Kopírovat stroj do schránky v JSON formátu.</p>} className='text-primary hover:text-primary hover:bg-primary/10' variant="ghost" size="icon" onClick={() => copyMachine(i)}>
                  <Copy />
                </ButtonHover>
                {machines.length > 1 && <ButtonHover hoverContent={<p>Odstranit stroj</p>} className='text-red-600 hover:text-red-600 hover:bg-red-600/10' variant="ghost" size="icon" onClick={() => removeMachine(i)}>
                  <Trash2 />
                </ButtonHover>}
              </div>
            </div>
          )}
        </div>
        
        <div className='flex flex-wrap justify-between gap-3'>
          <Button onClick={createNewMachine}>Definovat nový stroj</Button>
          <Button onClick={() => setShowImport(true)} variant={"secondary"}>Importovat stroj</Button>
        </div>
      </div>
      {editingMachineId != null &&
        <Dialog open={editingOpen} onOpenChange={setEditingOpen}>
          <DialogContent className='max-h-[90vh] overflow-auto w-full max-w-[700px]!' >
            <DialogHeader>
              <DialogTitle>
                Definice Turingova stroje
              </DialogTitle>
            </DialogHeader>
            <TuringCreator 
              onUpdate={saveTuringDefinition} 
              definition={editingMachineId >= 0 ? getTuringMachineDefinitionFromSave(machines[editingMachineId]) : undefined} 
              name={editingMachineId >= 0 ? machines[editingMachineId].name : undefined} 
              description={editingMachineId >= 0 ? machines[editingMachineId].description : undefined} />
          </DialogContent>
        </Dialog>
      }
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className='max-h-[90vh] overflow-auto w-full max-w-[700px]!' >
          <DialogHeader>
            <DialogTitle>
              Import Turingova stroje z JSON formátu.
            </DialogTitle>
          </DialogHeader>
          <TuringImport onUpdate={importMachine} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function getTuringMachineDefinitionFromSave(save: TuringMachineSave): TuringMachineDefinition {
  const tapeMap = new Map();
  let i = 0;
  for(const tapeBox of save.tapeArray) {
    tapeMap.set(i++, tapeBox);
  }

  const definition = {
    ...save,
    tape: tapeMap,
    tapeArray: undefined,
    name: undefined,
    description: undefined 
  }
  return definition;
}