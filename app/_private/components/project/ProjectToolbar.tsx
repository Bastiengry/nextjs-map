"use client";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { SplitButton } from "primereact/splitbutton";
import { Project } from "../../types/Project";
import { useTranslation } from "react-i18next";

/**
 * Properties for the ProjectToolbar component.
 *
 * project currently opened project.
 * onCreateProject callback when asking for the creation of a project.
 * onOpenProject callback when asking for the opening of a project.
 * onEditProject callback when asking for the edition of a project.
 * onDeleteProject callback when asking for the deletion of a project.
 */
export interface ProjectToolbarProps {
  project: Project | undefined;
  onCreateProject: () => void;
  onOpenProject: () => void;
  onEditProject: (projectId: number) => void;
  onDeleteProject: (projectId: number) => void;
}

/**
 * Project toolbar.
 *
 * This is located at the top of the application.
 */
export default function ProjectToolbar({
  project,
  onCreateProject,
  onOpenProject,
  onEditProject,
  onDeleteProject,
}: ProjectToolbarProps) {
  const { t } = useTranslation();

  const onClickCreateProject = () => {
    onCreateProject();
  };

  /**
   * Action when clicking on the button to open a project.
   */
  const onClickOpenProject = () => {
    onOpenProject();
  };

  /**
   * Action when clicking on the button to edit a project.
   */
  const onClickEditProject = () => {
    !!project?.id && onEditProject(project.id);
  };

  /**
   * Action when clicking on the button to delete a project.
   */
  const onClickDeleteProject = () => {
    !!project?.id && onDeleteProject(project.id);
  };

  /**
   * Extra-buttons for the Primereact split button (to add extra actions on the menu which open
   * when clicking on the "expand" icon of the split button).
   */
  const projectExtendBtnItems = [
    {
      label: t("projectToolbar.deleteBtn.label"),
      icon: "pi pi-trash",
      command: onClickDeleteProject,
      disabled: !project?.id,
    },
  ];

  return (
    <div className="flex-1 flex gap-1 m-1" aria-label="project-toolbar">
      <div className="flex-none flex gap-1">
        <Button
          aria-label="create-project-button"
          icon="pi pi-plus"
          size="small"
          severity="secondary"
          onClick={onClickCreateProject}
        />
        <Button
          aria-label="open-project-button"
          icon="pi pi-folder-open"
          size="small"
          severity="secondary"
          onClick={onClickOpenProject}
        />
      </div>
      <div className="flex-1 flex">
        <InputText
          aria-label="current-project-text"
          disabled
          className="flex-1 p-inputtext-sm"
          value={
            project?.label ||
            t("projectToolbar.projectNameInput.noProjectSelect")
          }
          pt={{
            root: {
              style: {
                fontWeight: "bold",
              },
            },
          }}
        />
      </div>
      <div className="flex-none flex gap-1">
        <SplitButton
          aria-label="edit-project-button"
          icon="pi pi-pencil"
          label={t("projectToolbar.editBtn.label")}
          severity="secondary"
          onClick={onClickEditProject}
          model={projectExtendBtnItems}
          size="small"
          pt={{
            menuButton: {
              root: {
                "aria-label": "expand-edit-menu",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
