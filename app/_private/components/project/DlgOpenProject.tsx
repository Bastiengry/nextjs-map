import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { Button } from "primereact/button";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { useProjectIdLabelQuery } from "../../api/useProjectQuery";
import { ProjectIdLabel } from "../../types/Project";

interface DlgOpenProjectProps {
  onCancel: () => void;
  onOpenProject: (projectId: number) => void;
}

export default function DlgOpenProject({
  onOpenProject,
  onCancel,
}: DlgOpenProjectProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectIdLabel>();
  const {
    data: projectIdLabels = [],
    isLoading: projectIdLabelsLoading,
    error: projectIdLabelsLoadError,
  } = useProjectIdLabelQuery();

  return (
    <Dialog header="Open project" visible={true} onHide={() => onCancel()}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="selectedProjectId">Project label</label>
          <Dropdown
            id="selectedProject"
            value={selectedProject}
            onChange={(event: DropdownChangeEvent) =>
              setSelectedProject(event.target.value)
            }
            options={projectIdLabels}
            optionLabel="label"
            placeholder="Select a project"
            pt={{
              input: {
                className: "font-extrabold",
              },
            }}
            checkmark={true}
            highlightOnSelect={false}
          />
          <small id="label-help">Select a project.</small>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button
            label="OK"
            onClick={() =>
              !!selectedProject && onOpenProject(selectedProject?.id)
            }
            disabled={!selectedProject}
          />
          <Button label="Cancel" onClick={() => onCancel()} />
        </div>
      </div>
    </Dialog>
  );
}
