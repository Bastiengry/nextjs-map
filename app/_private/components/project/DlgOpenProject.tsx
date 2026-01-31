import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { Button } from "primereact/button";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { useProjectIdLabelQuery } from "../../api/useProjectQuery";
import { ProjectIdLabel } from "../../types/Project";
import { useTranslation } from "react-i18next";

interface DlgOpenProjectProps {
  onCancel: () => void;
  onOpenProject: (projectId: number) => void;
}

export default function DlgOpenProject({
  onOpenProject,
  onCancel,
}: DlgOpenProjectProps) {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState<ProjectIdLabel>();
  const {
    data: projectIdLabels = [],
    isLoading: projectIdLabelsLoading,
    error: projectIdLabelsLoadError,
  } = useProjectIdLabelQuery();

  return (
    <Dialog
      header={t("dlgOpenProject.title")}
      aria-label="dlg-open-project"
      visible={true}
      onHide={() => onCancel()}
    >
      <div className="flex flex-col gap-2">
        <div
          className="flex flex-col gap-2"
          aria-label="project-selector-field"
        >
          <label
            aria-label="project-selector-label"
            htmlFor="selectedProjectId"
          >
            {t("dlgOpenProject.projectSelector.label")}
          </label>
          <Dropdown
            id="selectedProject"
            aria-label="project-selector-field-select"
            value={selectedProject}
            onChange={(event: DropdownChangeEvent) =>
              setSelectedProject(event.target.value)
            }
            options={projectIdLabels}
            optionLabel="label"
            placeholder={t(
              "dlgOpenProject.projectSelector.dropdown.placeholder",
            )}
            pt={{
              input: {
                className: "font-extrabold",
              },
            }}
            checkmark={true}
            highlightOnSelect={false}
          />
          <small id="label-help">
            {t("dlgOpenProject.projectSelector.helper")}
          </small>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button
            aria-label="validate-button"
            label={t("dlgOpenProject.validateBtn.label")}
            onClick={() =>
              !!selectedProject && onOpenProject(selectedProject?.id)
            }
            disabled={!selectedProject}
          />
          <Button
            aria-label="cancel-button"
            label={t("dlgOpenProject.cancelBtn.label")}
            onClick={() => onCancel()}
          />
        </div>
      </div>
    </Dialog>
  );
}
