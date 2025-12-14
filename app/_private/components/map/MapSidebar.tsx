"use client";

import { MenuItem } from "primereact/menuitem";
import { PanelMenu } from "primereact/panelmenu";
import { useMemo } from "react";
import { LatLng } from "leaflet";
import useProjectContext from "../../context/useProject";
import { ProjectCircuit } from "../../types/Project";
import { Button } from "primereact/button";

interface MapSidebarProps {
  onVisibilityChanged: (visible: boolean) => void;
  onMapPanTo: (coord: LatLng) => void;
}

export default function MapSidebar({
  onVisibilityChanged,
  onMapPanTo,
}: MapSidebarProps) {
  const project = useProjectContext();
  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: "Circuits",
        icon: "pi pi-th-large",
        data: project,
        items: project?.circuits?.map((circuit: ProjectCircuit) => ({
          id: circuit.id?.toString(),
          label: circuit.label,
          items: [
            {
              label: "Center on point",
              icon: "pi pi-map-marker",
              command: () => onMapPanTo(circuit?.geometry?.[0]),
            },
          ],
        })),
      },
    ],
    [project]
  );

  return (
    <>
      <div className="flex flex-col h-full m-3 gap-2 w-60">
        <div className="flex flex-row mb-5">
          <div className="flex flex-1 justify-center items-center font-bold text-2xl">
            Project details
          </div>
          <Button
            className="flex-none"
            icon="pi pi-times"
            size="small"
            severity="secondary"
            onClick={() => onVisibilityChanged(false)}
          />
        </div>
        <div className="flex flex-col h-full">
          {!!project && <PanelMenu model={menuItems} />}
        </div>
      </div>
    </>
  );
}
