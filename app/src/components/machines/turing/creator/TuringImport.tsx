
import { Textarea } from "@/components/ui/textarea";
import { getTuringMachineDefinitionFromSave, TuringMachineSave } from "../machineList/TuringList";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { validateTuringMachineDefinition } from "@/lib/TuringMachine";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type TuringImportType = {
  onUpdate: (save: TuringMachineSave) => void;
} & React.ComponentProps<"div">;

export default function TuringImport({ onUpdate, ...props}: TuringImportType) {
  const [ text, setText ] = useState<string>("");
  const [ errorMessage, setErrorMessage ] = useState<string>("");

  const importMachine = () => {
    try {
      const parsedDefinition: TuringMachineSave = JSON.parse(text);
      if(parsedDefinition.name.length < 3) {
        setErrorMessage("Název stroje musí být delší než 2 znaky.");
        return;
      }
      const validationResult = validateTuringMachineDefinition(getTuringMachineDefinitionFromSave(parsedDefinition));
      if(validationResult !== true) {
        setErrorMessage(validationResult);
        return;
      }
      setErrorMessage("");
      onUpdate(parsedDefinition);
    }
    catch {
      setErrorMessage("Import se nezdařil. Definice pravděpodobně není validní.");
    }
  }

  return(
    <div className="flex flex-col gap-2 h-full overflow-auto p-1" {...props}>
      <Textarea value={text} onChange={e => setText(e.target.value)} className="h-40" placeholder="Zde vložte kód stroje." />
      <div className="flex justify-between items-end gap-2 pt-6">
      <Button onClick={importMachine} className='w-fit'>Importovat</Button>
        {errorMessage.length > 0 ? <Alert variant="destructive" className="p-2 w-fit font-semibold bg-destructive/18"><AlertCircle className="h-4 w-4" /><AlertDescription>{errorMessage}</AlertDescription></Alert> : ""}
      </div>
    </div>
  );
}