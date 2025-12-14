import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Project } from "../../types/Project";
import { useState } from "react";
import { Button } from "primereact/button";
import _ from "lodash";

interface DlgEditProjectProps {
  project: Project;
  onClose: () => void;
  onSaveProject: (project: Project) => void;
}

export default function DlgEditProject({
  project,
  onSaveProject,
  onClose,
}: DlgEditProjectProps) {
  const [modifiedProject, setModifiedProject] = useState<Project>(
    _.cloneDeep(project)
  );

  const onDataChange = (name: string, value: string) => {
    const newPrj: Project = { ...project, [name]: value };
    setModifiedProject(newPrj);
  };

  return (
    <Dialog header="Edit project" visible={true} onHide={() => onClose()}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="label">Project label</label>
          <InputText
            id="label"
            aria-describedby="label-help"
            value={modifiedProject.label}
            onChange={(e) => onDataChange("label", e.target.value)}
          />
          <small id="label-help">Enter a project name.</small>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button label="OK" onClick={() => onSaveProject(modifiedProject)} />
          <Button label="Cancel" onClick={() => onClose()} />
        </div>
      </div>
    </Dialog>
  );
}
