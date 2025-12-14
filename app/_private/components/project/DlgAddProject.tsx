import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Project } from "../../types/Project";
import { useState } from "react";
import { Button } from "primereact/button";

interface DlgAddProjectProps {
  onCancel: () => void;
  onCreateProject: (project: Project) => void;
}

export default function DlgAddProject({
  onCreateProject,
  onCancel,
}: DlgAddProjectProps) {
  const [project, setProject] = useState<Project>({ label: "" });

  const onDataChange = (name: string, value: string) => {
    const newProjet: Project = { ...project, [name]: value };
    setProject(newProjet);
  };

  return (
    <Dialog header="Create project" visible={true} onHide={() => onCancel()}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="label">Project label</label>
          <InputText
            id="label"
            aria-describedby="label-help"
            value={project.label}
            onChange={(e) => onDataChange("label", e.target.value)}
          />
          <small id="label-help">Enter a project name.</small>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button label="OK" onClick={() => onCreateProject(project)} />
          <Button label="Cancel" onClick={() => onCancel()} />
        </div>
      </div>
    </Dialog>
  );
}
