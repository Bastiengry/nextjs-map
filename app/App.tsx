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
import { Project, ProjectCircuit } from "./_private/types/Project";
import EditModeTypes from "./_private/types/EditModeTypes";
import DlgAddProject from "./_private/components/project/DlgAddProject";
import DlgOpenProject from "./_private/components/project/DlgOpenProject";
import HeaderWrapper from "./_private/components/header/HeaderWrapper";
import DlgEditProject from "./_private/components/project/DlgEditProject";
import _ from "lodash";
import { GeometryLineString, GeometryPoint } from "./_private/types/Geometry";
import { useQueryClient } from "@tanstack/react-query";
import DlgAddCircuit from "./_private/components/circuit/DlgAddCircuit";
import DlgEditCircuit from "./_private/components/circuit/DlgEditCircuit";
import { useSession } from "next-auth/react";
import ProjectToolbarWrapper from "./_private/components/project/ProjectToolbarWrapper";

export default function App() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState<number | undefined>();
  const [editedCircuit, setEditedCircuit] = useState<
    ProjectCircuit | undefined
  >();
  const [editMode, setEditMode] = useState<string>(EditModeTypes.VIEW);
  const postProject = usePostProject(queryClient, (prj: Project) => {
    setProjectId(prj?.id);
  });
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

  const onCreateProject = (prj: Project) => {
    postProject.mutate(prj);
    setProjectId(project?.id);
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

  const onStartMapEdit = useCallback(() => {
    setEditMode(EditModeTypes.EDIT_MAP);
  }, []);

  const onEndMapEdit = useCallback(() => {
    setEditMode(EditModeTypes.VIEW);
  }, []);

  const onAddCircuitPolylineDemanded = useCallback(
    (polyline: GeometryLineString) => {
      setEditedCircuit({
        label: "",
        color: "#000000",
        geometry: polyline,
      });
      setEditMode(EditModeTypes.CREATE_CIRCUIT);
    },
    [],
  );

  const addCircuitToProject = useCallback(
    (prj: Project, circuit: ProjectCircuit) => {
      if (!prj.circuits) {
        prj.circuits = [];
      }
      prj.circuits = [...prj.circuits, circuit];
    },
    [],
  );

  const onEndAddCircuit = useCallback(
    (circuit: ProjectCircuit) => {
      if (project) {
        const prj = _.cloneDeep(project);
        addCircuitToProject(prj, circuit);
        putProject.mutate(prj);
        setEditMode(EditModeTypes.VIEW);
      }
    },
    [project, addCircuitToProject],
  );

  const onEditCircuit = useCallback(
    (circuitToEdit: ProjectCircuit) => {
      setEditedCircuit(circuitToEdit);
      setEditMode(EditModeTypes.EDIT_CIRCUIT);
    },
    [project],
  );

  const onSaveModifiedCircuit = (circuit: ProjectCircuit) => {
    if (project) {
      const prj = _.cloneDeep(project);
      if (prj.circuits) {
        prj.circuits = prj.circuits.filter((circ) => circ.id !== circuit.id);
        prj.circuits.push(circuit);
        putProject.mutate(prj);
        setEditMode(EditModeTypes.VIEW);
      }
    }
  };

  const onUpdateCircuitGeometry = (circuit: ProjectCircuit) => {
    if (project) {
      const prj = _.cloneDeep(project);
      if (prj.circuits) {
        prj.circuits = prj.circuits.filter((circ) => circ.id !== circuit.id);
        prj.circuits.push(circuit);
        putProject.mutate(prj);
        setEditMode(EditModeTypes.VIEW);
      }
    }
  };

  const addMarkerToProject = useCallback(
    (prj: Project, markerPoint: GeometryPoint) => {
      if (!prj.markers) {
        prj.markers = [];
      }
      prj.markers = [
        ...prj.markers,
        {
          label: "",
          point: markerPoint,
        },
      ];
    },
    [],
  );

  const onRemoveCircuit = useCallback(
    (circuitToDelete: ProjectCircuit) => {
      if (project) {
        const prj = _.cloneDeep(project);
        if (prj.circuits) {
          prj.circuits = prj.circuits.filter(
            (circ) => circ.id !== circuitToDelete.id,
          );
        }
        putProject.mutate(prj);
      }
    },
    [project],
  );

  const onAddMarkerPoint = useCallback(
    (markerPoint: GeometryPoint) => {
      if (project) {
        const prj = _.cloneDeep(project);
        addMarkerToProject(prj, markerPoint);
        putProject.mutate(prj);
      }
    },
    [project],
  );

  return (
    <ProjectContext.Provider value={project}>
      <header className="card">
        <HeaderWrapper />
        {!!session?.user && (
          <ProjectToolbarWrapper
            project={project}
            onEditProject={onClickEditProject}
            onCreateProject={onClickCreateProject}
            onOpenProject={onClickOpenProject}
            onDeleteProject={onClickDeleteProject}
          />
        )}
      </header>
      <main>
        {!!session?.user && (
          <>
            <div className="w-full h-full flex">
              <MapWrapper
                key={project?.id || -1}
                position={{ lat: 46.603354, lng: 1.888334 }}
                zoom={6}
                project={project}
                editMode={editMode}
                onStartMapEdit={onStartMapEdit}
                onEndMapEdit={onEndMapEdit}
                setEditMode={setEditMode}
                onAddPolyline={onAddCircuitPolylineDemanded}
                onAddMarker={onAddMarkerPoint}
                onEditCircuit={onEditCircuit}
                onRemoveCircuit={onRemoveCircuit}
                onUpdateCircuitGeometry={onUpdateCircuitGeometry}
              />
            </div>
            {editMode === EditModeTypes.OPEN_PROJECT && (
              <DlgOpenProject
                onCancel={() => onQuitEditMode()}
                onOpenProject={onOpenProject}
              />
            )}
            {editMode === EditModeTypes.CREATE_PROJECT && (
              <DlgAddProject
                onCancel={() => onQuitEditMode()}
                onCreateProject={onCreateProject}
              />
            )}
            {editMode === EditModeTypes.EDIT_PROJECT && (
              <>
                {!!project && (
                  <DlgEditProject
                    project={project}
                    onCancel={() => onQuitEditMode()}
                    onSaveProject={onSaveProject}
                  />
                )}
              </>
            )}
            {editMode === EditModeTypes.CREATE_CIRCUIT && (
              <>
                {!!editedCircuit && (
                  <DlgAddCircuit
                    geometry={editedCircuit?.geometry}
                    onCancel={() => onQuitEditMode()}
                    onCreateCircuit={onEndAddCircuit}
                  />
                )}
              </>
            )}
            {editMode === EditModeTypes.EDIT_CIRCUIT && (
              <>
                {!!editedCircuit && (
                  <DlgEditCircuit
                    circuit={editedCircuit}
                    onCancel={() => onQuitEditMode()}
                    onSaveCircuit={onSaveModifiedCircuit}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>
    </ProjectContext.Provider>
  );
}
