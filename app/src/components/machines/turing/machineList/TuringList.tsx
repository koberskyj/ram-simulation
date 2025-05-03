
import { testTuring, TuringMachineDefinition } from "@/lib/TuringMachine";
import TuringCreator from "../creator/TuringCreator";
import { useEffect, useState } from "react";



type TuringListType = { 
  onUpdate: (turingDefinition: TuringMachineDefinition) => void;
} & React.ComponentProps<"div">;

export default function TuringList({ onUpdate, ...props}: TuringListType) {
  const [ turingDefinition, setTuringDefinition ] = useState<TuringMachineDefinition>(testTuring.getDefinition());

  useEffect(() => {
    onUpdate(turingDefinition);
  }, [turingDefinition])

  return(
    <div {...props}>
      <TuringCreator onUpdate={td => setTuringDefinition(td)} definition={turingDefinition}/>
    </div>
  );
}