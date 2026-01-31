import { useState } from "react";
import { GeometryLineString } from "../../types/Geometry";
import { ProjectCircuit } from "../../types/Project";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ColorPicker } from "primereact/colorpicker";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
    <Dialog
      header={t("dlgAddCircuit.title")}
      aria-label="dlg-add-circuit"
      visible={true}
      onHide={() => onCancel()}
    >
      <div aria-label="circuit-label-field" className="flex flex-col gap-2">
        <div
          aria-label="circuit-label-field-label"
          className="flex flex-col gap-2"
        >
          <label htmlFor="label">
            {t("dlgAddCircuit.circuitLabelField.label")}
          </label>
          <InputText
            id="label"
            aria-label="circuit-label-field-input"
            aria-describedby="label-help"
            value={circuit.label}
            onChange={(e) => onDataChange("label", e.target.value)}
          />
          <small id="label-help">
            {" "}
            {t("dlgAddCircuit.circuitLabelField.helper")}
          </small>
        </div>
        <div aria-label="circuit-color-field" className="flex flex-col gap-2">
          <label htmlFor="label">
            {t("dlgAddCircuit.circuitColorField.label")}
          </label>
          <ColorPicker
            id="color"
            aria-label="circuit-color-field-picker"
            aria-describedby="color-help"
            value={circuit.color || "000000"}
            onChange={(e) =>
              onDataChange("color", "#" + e.target.value?.toString())
            }
          />
          <small id="label-help">
            {t("dlgAddCircuit.circuitColorField.helper")}
          </small>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button
            aria-label="validate-button"
            label={t("dlgAddCircuit.validateBtn.label")}
            onClick={() => onCreateCircuit(circuit)}
          />
          <Button
            aria-label="cancel-button"
            label={t("dlgAddCircuit.cancelBtn.label")}
            onClick={() => onCancel()}
          />
        </div>
      </div>
    </Dialog>
  );
}
