"use client";

import { useCallback, useState } from "react";
import MapWrapper from "./_private/components/map/MapWrapper";
import { ProjectContext } from "./_private/context/ProjectContext";
import {
  useDeleteProject,
  useGetProject,
  usePostProject,
  usePutProject,
} from "./_private/api/useProjectQuery";
import { Project } from "./_private/types/Project";
import EditModeTypes from "./_private/types/EditModeTypes";
import DlgAddProject from "./_private/components/project/DlgAddProject";
import DlgOpenProject from "./_private/components/project/DlgOpenProject";
import HeaderWrapper from "./_private/components/header/HeaderWrapper";
import DlgEditProject from "./_private/components/project/DlgEditProject";
import _ from "lodash";
import { GeometryLineString } from "./_private/types/Geometry";
import { useQueryClient } from "@tanstack/react-query";

export default function App() {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState<number | undefined>();
  const [editMode, setEditMode] = useState<string>(EditModeTypes.VIEW);
  const postProject = usePostProject(queryClient);
  const putProject = usePutProject(queryClient);
  const deleteProject = useDeleteProject(queryClient);
  const {
    data: project,
    isLoading: projectLoading,
    error: projectLoadError,
  } = useGetProject(queryClient, projectId);

  const onQuitEditMode = () => setEditMode(EditModeTypes.VIEW);

  const onClickEditProject = () => setEditMode(EditModeTypes.EDIT_PROJECT);

  const onClickCreateProject = () => setEditMode(EditModeTypes.CREATE_PROJECT);

  const onClickOpenProject = () => setEditMode(EditModeTypes.OPEN_PROJECT);

  const onCreateProject = (project: Project) => {
    postProject.mutate(project);
    setEditMode(EditModeTypes.VIEW);
  };

  const onSaveProject = (prj: Project) => {
    putProject.mutate(prj);
    setEditMode(EditModeTypes.VIEW);
  };

  const onOpenProject = (prjId: number) => {
    setProjectId(prjId);
    setEditMode(EditModeTypes.VIEW);
  };

  const onClickDeleteProject = (prjId: number) => {
    deleteProject.mutate(prjId);
    setProjectId(undefined);
  };

  const onAddCircuitPolyline = useCallback(
    (polyline: GeometryLineString) => {
      if (project) {
        const prj = _.cloneDeep(project);
        if (!prj.circuits) {
          prj.circuits = [];
        }
        prj.circuits = [
          ...prj.circuits,
          {
            label: "",
            geometry: polyline,
          },
        ];
        putProject.mutate(prj);
      }
    },
    [project]
  );

  return (
    <ProjectContext.Provider value={project}>
      <header className="card">
        <HeaderWrapper
          project={project}
          onEditProject={onClickEditProject}
          onCreateProject={onClickCreateProject}
          onOpenProject={onClickOpenProject}
          onDeleteProject={onClickDeleteProject}
        />
      </header>
      <main>
        <div className="w-full h-full flex">
          <MapWrapper
            position={{ lat: 47.75, lng: 7.33333 }}
            zoom={100}
            project={project}
            editMode={editMode}
            setEditMode={setEditMode}
            onAddCircuitPolyline={onAddCircuitPolyline}
          />
        </div>
        {editMode === EditModeTypes.OPEN_PROJECT && (
          <DlgOpenProject
            onClose={() => onQuitEditMode()}
            onOpenProject={onOpenProject}
          />
        )}
        {editMode === EditModeTypes.CREATE_PROJECT && (
          <DlgAddProject
            onClose={() => onQuitEditMode()}
            onCreateProject={onCreateProject}
          />
        )}
        {editMode === EditModeTypes.EDIT_PROJECT && (
          <>
            {!!project && (
              <DlgEditProject
                project={project}
                onClose={() => onQuitEditMode()}
                onSaveProject={onSaveProject}
              />
            )}
          </>
        )}
      </main>
    </ProjectContext.Provider>
  );
}
