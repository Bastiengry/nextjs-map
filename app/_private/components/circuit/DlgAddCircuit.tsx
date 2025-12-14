import { useState } from "react";
import { GeometryLineString } from "../../types/Geometry";
import { ProjectCircuit } from "../../types/Project";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ColorPicker } from "primereact/colorpicker";

interface DlgAddCircuitProps {
  geometry: GeometryLineString;
  onCancel: () => void;
  onCreateCircuit: (circuit: ProjectCircuit) => void;
}

export default function DlgAddCircuit({
  geometry,
  onCreateCircuit,
  onCancel,
}: DlgAddCircuitProps) {
  const [circuit, setCircuit] = useState<ProjectCircuit>({
    label: "",
    color: "#000000",
    geometry,
  });

  const onDataChange = (name: string, value: string | undefined) => {
    const newCircuit: ProjectCircuit = { ...circuit, [name]: value };
    setCircuit(newCircuit);
  };

  return (
    <Dialog header="Create circuit" visible={true} onHide={() => onCancel()}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="label">Circuit label</label>
          <InputText
            id="label"
            aria-describedby="label-help"
            value={circuit.label}
            onChange={(e) => onDataChange("label", e.target.value)}
          />
          <small id="label-help">Enter a circuit name.</small>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="label">Circuit color</label>
          <ColorPicker
            id="color"
            aria-describedby="color-help"
            value={circuit.color || "000000"}
            onChange={(e) =>
              onDataChange("color", "#" + e.target.value?.toString())
            }
          />
          <small id="label-help">Select a circuit color.</small>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button label="OK" onClick={() => onCreateCircuit(circuit)} />
          <Button label="Cancel" onClick={() => onCancel()} />
        </div>
      </div>
    </Dialog>
  );
}
