import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { SplitButton } from "primereact/splitbutton";
import { Project } from "../../types/Project";

export interface HeaderProps {
  project: Project | undefined;
  onCreateProject: () => void;
  onOpenProject: () => void;
  onEditProject: (projectId: number) => void;
  onDeleteProject: (projectId: number) => void;
}

export default function Header({
  project,
  onCreateProject,
  onOpenProject,
  onEditProject,
  onDeleteProject,
}: HeaderProps) {
  const onClickCreateProject = () => {
    onCreateProject();
  };

  const onClickOpenProject = () => {
    onOpenProject();
  };

  const onClickEditProject = () => {
    !!project?.id && onEditProject(project.id);
  };

  const onClickDeleteProject = () => {
    !!project?.id && onDeleteProject(project.id);
  };

  const projectExtendBtnItems = [
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: onClickDeleteProject,
      disabled: !project?.id,
    },
  ];

  return (
    <div className="p-menubar flex flex-col">
      <div className="flex-1 flex mb-3">
        <div className="flex-none">
          <img
            alt="logo"
            src="https://primefaces.org/cdn/primereact/images/logo.png"
            height={40}
            width={40}
            className="mr-2"
          ></img>
        </div>
        <div className="flex-1 flex justify-center">
          <h1 className="text-3xl font-extrabold">NextJS Map</h1>
        </div>
      </div>
      <div className="flex-1 flex gap-1">
        <div className="flex-none flex gap-1">
          <Button
            icon="pi pi-plus"
            size="small"
            severity="secondary"
            onClick={onClickCreateProject}
          />
          <Button
            icon="pi pi-folder-open"
            size="small"
            severity="secondary"
            onClick={onClickOpenProject}
          />
        </div>
        <div className="flex-1 flex">
          <InputText
            disabled
            className="flex-1 p-inputtext-sm"
            value={project?.label || "No project selected"}
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
            icon="pi pi-pencil"
            label="Edit"
            severity="secondary"
            onClick={onClickEditProject}
            model={projectExtendBtnItems}
            size="small"
          />
        </div>
      </div>
    </div>
  );
}
