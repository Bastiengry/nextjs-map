import { useState } from "react";
import { ProjectCircuit } from "../../types/Project";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ColorPicker } from "primereact/colorpicker";

interface DlgEditCircuitProps {
  circuit: ProjectCircuit;
  onCancel: () => void;
  onSaveCircuit: (circuit: ProjectCircuit) => void;
}

export default function DlgEditCircuit({
  circuit,
  onSaveCircuit,
  onCancel,
}: DlgEditCircuitProps) {
  const [modifiedCircuit, setModifiedCircuit] = useState<ProjectCircuit>({
    ...circuit,
  });

  const onDataChange = (name: string, value: string | undefined) => {
    const newCircuit: ProjectCircuit = { ...circuit, [name]: value };
    setModifiedCircuit(newCircuit);
  };

  return (
    <Dialog header="Edit circuit" visible={true} onHide={() => onCancel()}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="label">Circuit label</label>
          <InputText
            id="label"
            aria-describedby="label-help"
            value={modifiedCircuit.label}
            onChange={(e) => onDataChange("label", e.target.value)}
          />
          <small id="label-help">Enter a circuit name.</small>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="label">Circuit color</label>
          <ColorPicker
            id="color"
            aria-describedby="color-help"
            value={modifiedCircuit.color || "000000"}
            onChange={(e) =>
              onDataChange("color", "#" + e.target.value?.toString())
            }
          />
          <small id="label-help">Select a circuit color.</small>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button label="OK" onClick={() => onSaveCircuit(modifiedCircuit)} />
          <Button label="Cancel" onClick={() => onCancel()} />
        </div>
      </div>
    </Dialog>
  );
}
