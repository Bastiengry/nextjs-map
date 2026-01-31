import { useState } from "react";
import { ProjectCircuit } from "../../types/Project";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ColorPicker } from "primereact/colorpicker";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const [modifiedCircuit, setModifiedCircuit] = useState<ProjectCircuit>({
    ...circuit,
  });

  const onDataChange = (name: string, value: string | undefined) => {
    const newCircuit: ProjectCircuit = { ...modifiedCircuit, [name]: value };
    setModifiedCircuit(newCircuit);
  };

  return (
    <Dialog
      aria-label="dlg-edit-circuit"
      header={t("dlgEditCircuit.title")}
      visible={true}
      onHide={() => onCancel()}
    >
      <div aria-label="circuit-label-field" className="flex flex-col gap-2">
        <div
          className="flex flex-col gap-2"
          aria-label="circuit-label-field-label"
        >
          <label htmlFor="label">
            {t("dlgEditCircuit.circuitLabelField.label")}
          </label>
          <InputText
            id="label"
            aria-label="circuit-label-field-input"
            aria-describedby="label-help"
            value={modifiedCircuit.label}
            onChange={(e) => onDataChange("label", e.target.value)}
          />
          <small id="label-help">
            {t("dlgEditCircuit.circuitLabelField.helper")}
          </small>
        </div>
        <div aria-label="circuit-color-field" className="flex flex-col gap-2">
          <label htmlFor="label">
            {t("dlgEditCircuit.circuitColorField.label")}
          </label>
          <ColorPicker
            id="color"
            aria-label="circuit-color-field-picker"
            aria-describedby="color-help"
            value={modifiedCircuit.color || "000000"}
            onChange={(e) =>
              onDataChange("color", "#" + e.target.value?.toString())
            }
          />
          <small id="label-help">
            {t("dlgEditCircuit.circuitColorField.helper")}
          </small>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button
            aria-label="validate-button"
            label={t("dlgEditCircuit.validateBtn.label")}
            onClick={() => onSaveCircuit(modifiedCircuit)}
          />
          <Button
            aria-label="cancel-button"
            label={t("dlgEditCircuit.cancelBtn.label")}
            onClick={() => onCancel()}
          />
        </div>
      </div>
    </Dialog>
  );
}
