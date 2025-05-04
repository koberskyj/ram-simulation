import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Trash2 } from "lucide-react";
import { TransitionFunction } from "@/lib/TuringMachine";

export type TuringCreatorType = { 
  onUpdate: (functions: TransitionFunction[]) => void;
  value: TransitionFunction[];
} & React.ComponentProps<"div">;

export default function TuringTransitions({ value, onUpdate }: TuringCreatorType) {
  useEffect(() => {
    if(value.length == 0) {
      onUpdate([{ stateFrom: "", symbolFrom: "", stateTo: "", symbolTo: "", action: 0 }]);
    }
  })

  const addTransition = () => {
    onUpdate([
      ...value, { stateFrom: "", symbolFrom: "", stateTo: "", symbolTo: "", action: 0 }
    ]);
  };

  const updateTransition = (index: number, field: keyof TransitionFunction, val: string|number) => {
    if(field == 'action') {
      val = parseInt(val+"");
    }
    onUpdate(value.map((t, i) => (index == i ? { ...t, [field]: val } : t)));
  };

  const removeTransition = (index: number) => {
    onUpdate(value.filter((_, i) => i != index));
  };

  return (
    <div className="space-y-6">

      <div className="space-y-2">
        {value.map((t, i) => (
          <div key={i} className="flex justify-between border rounded-lg">
            <div className="flex items-center p-2 gap-2 flex-wrap">
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <Input value={t.stateFrom} onChange={(e) => updateTransition(i, 'stateFrom', e.target.value) } placeholder="Stav" className="w-15" />
                <Input value={t.symbolFrom} onChange={(e) => updateTransition(i, 'symbolFrom', e.target.value) } placeholder="Symbol" className="w-20" />

                <ArrowRight />
              </div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <Input value={t.stateTo} onChange={(e) => updateTransition(i, 'stateTo', e.target.value) } placeholder="Stav" className="w-15" />
                <Input value={t.symbolTo} onChange={(e) => updateTransition(i, 'symbolTo', e.target.value) } placeholder="Symbol" className="w-20" />

                <Select value={t.action+""} onValueChange={(val) => updateTransition(i, 'action', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="0" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Doleva (-1)</SelectItem>
                    <SelectItem value="0">Zůstat (0)</SelectItem>
                    <SelectItem value="1">Doprava (+1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="py-2 pr-2">
              {value.length > 1 && (
                <Button className='text-red-600 hover:text-red-600 hover:bg-red-50' tabIndex={-1} variant="ghost" size="icon" onClick={() => removeTransition(i)}>
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </div>
        ))}

        <Button onClick={addTransition}>Přidat přechodovou funkci</Button>
      </div>
    </div>
  );
};
