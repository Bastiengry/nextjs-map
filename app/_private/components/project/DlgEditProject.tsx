import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Project } from "../../types/Project";
import { useState } from "react";
import { Button } from "primereact/button";
import _ from "lodash";
import { useTranslation } from "react-i18next";

interface DlgEditProjectProps {
  project: Project;
  onCancel: () => void;
  onSaveProject: (project: Project) => void;
}

export default function DlgEditProject({
  project,
  onSaveProject,
  onCancel,
}: DlgEditProjectProps) {
  const { t } = useTranslation();
  const [modifiedProject, setModifiedProject] = useState<Project>(
    _.cloneDeep(project),
  );

  const onDataChange = (name: string, value: string) => {
    const newPrj: Project = { ...project, [name]: value };
    setModifiedProject(newPrj);
  };

  return (
    <Dialog
      header={t("dlgEditProject.title")}
      aria-label="dlg-edit-project"
      visible={true}
      onHide={() => onCancel()}
    >
      <div className="flex flex-col gap-2">
        <div aria-label="project-label-field" className="flex flex-col gap-2">
          <label aria-label="project-label-field-label" htmlFor="label">
            {t("dlgEditProject.projectLabelField.label")}
          </label>
          <InputText
            id="label"
            aria-label="project-label-field-input"
            aria-describedby="label-help"
            value={modifiedProject.label}
            onChange={(e) => onDataChange("label", e.target.value)}
          />
          <small id="label-help">
            {t("dlgEditProject.projectLabelField.helper")}
          </small>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button
            aria-label="validate-button"
            label={t("dlgEditProject.validateBtn.label")}
            onClick={() => onSaveProject(modifiedProject)}
          />
          <Button
            aria-label="cancel-button"
            label={t("dlgEditProject.cancelBtn.label")}
            onClick={() => onCancel()}
          />
        </div>
      </div>
    </Dialog>
  );
}
