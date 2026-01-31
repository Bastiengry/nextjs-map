import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Project } from "../../types/Project";
import { useState } from "react";
import { Button } from "primereact/button";
import { useTranslation } from "react-i18next";

interface DlgAddProjectProps {
  onCancel: () => void;
  onCreateProject: (project: Project) => void;
}

export default function DlgAddProject({
  onCreateProject,
  onCancel,
}: DlgAddProjectProps) {
  const { t } = useTranslation();
  const [project, setProject] = useState<Project>({ label: "" });

  const onDataChange = (name: string, value: string) => {
    const newProjet: Project = { ...project, [name]: value };
    setProject(newProjet);
  };

  return (
    <Dialog
      header={t("dlgAddProject.title")}
      aria-label="dlg-add-project"
      visible={true}
      onHide={() => onCancel()}
    >
      <div className="flex flex-col gap-2">
        <div aria-label="project-label-field" className="flex flex-col gap-2">
          <label aria-label="project-label-field-label" htmlFor="label">
            {t("dlgAddProject.projectLabelField.label")}
          </label>
          <InputText
            id="label"
            aria-label="project-label-field-input"
            aria-describedby="label-help"
            value={project.label}
            onChange={(e) => onDataChange("label", e.target.value)}
          />
          <small id="label-help">
            {t("dlgAddProject.projectLabelField.helper")}
          </small>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button
            aria-label="validate-button"
            label={t("dlgAddProject.validateBtn.label")}
            onClick={() => onCreateProject(project)}
          />
          <Button
            aria-label="cancel-button"
            label={t("dlgAddProject.cancelBtn.label")}
            onClick={() => onCancel()}
          />
        </div>
      </div>
    </Dialog>
  );
}
