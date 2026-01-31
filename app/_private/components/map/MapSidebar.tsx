"use client";

import { MenuItem } from "primereact/menuitem";
import { PanelMenu } from "primereact/panelmenu";
import { useMemo } from "react";
import { LatLngLiteral } from "leaflet";
import { Project, ProjectCircuit } from "../../types/Project";
import { Button } from "primereact/button";
import { numberArrayToLatLng } from "../../util/geomUtils";
import { useTranslation } from "react-i18next";

/**
 * Properties for the sidebar component.
 *
 * project currently opened project.
 * onVisibilityChanged callback when clicking on the "close" button.
 * onMapPanTo callback when clicking on the "locate" button.
 */
interface MapSidebarProps {
  project: Project | undefined;
  onVisibilityChanged: (visible: boolean) => void;
  onMapPanTo: (coord: LatLngLiteral) => void;
}

/**
 * Component for map sidebar.
 *
 * @param param0 component properties.
 */
export default function MapSidebar({
  project,
  onVisibilityChanged,
  onMapPanTo,
}: MapSidebarProps) {
  const { t } = useTranslation();

  /**
   *
   * @param item Renderer for a single circuit menu item.
   * @param options additional options.
   * @returns renderer.
   */
  const circuitItemRenderer = (item: MenuItem, options: any) => {
    const circuit = item.data;
    return (
      <div
        className="flex px-3 py-2"
        aria-label={`circuit-menu-item-renderer-${item.id}`}
      >
        <div className="flex-none self-center" aria-label="circuit-label">
          {item.label}
        </div>
        <div className="flex-1 flex justify-end">
          {!!circuit.color && (
            <div
              className="self-center w-[15px] h-[15px]"
              aria-label="circuit-color"
              style={{
                backgroundColor: circuit.color,
              }}
            />
          )}
          <div
            className="self-center pi pi-map-marker p-[5px] ms-[10px] cursor-pointer"
            aria-label="locate-button"
            onClick={() => {
              onMapPanTo(
                numberArrayToLatLng(circuit?.geometry?.coordinates?.[0]),
              );
            }}
          />
        </div>
      </div>
    );
  };

  /**
   * Menu items to display for the "circuits" menu.
   */
  const menuCircuitItems: MenuItem[] = useMemo(
    () => [
      {
        label: t("map.sidebar.circuits"),
        icon: "pi pi-th-large",
        data: project,
        items: project?.circuits?.map((circuit: ProjectCircuit) => ({
          id: circuit.id?.toString(),
          label: circuit.label,
          template: circuitItemRenderer,
          data: circuit,
        })),
      },
    ],
    [project],
  );

  return (
    <>
      <div
        className="flex flex-col h-full m-3 gap-2 w-64"
        aria-label="map-sidebar"
      >
        <div className="flex flex-row mb-5 gap-2">
          <div
            className="flex flex-1 justify-center items-center font-bold text-2xl"
            aria-label="title"
          >
            {t("map.sidebar.projectDetails")}
          </div>
          <Button
            className="flex-none"
            icon="pi pi-times"
            size="small"
            severity="secondary"
            onClick={() => onVisibilityChanged(false)}
            aria-label="close-button"
          />
        </div>
        <div className="flex flex-col h-full">
          {!!project && (
            <PanelMenu
              aria-label="circuits-menu"
              model={menuCircuitItems}
              pt={{ headerAction: { "aria-label": "expand-menu" } }}
            />
          )}
        </div>
      </div>
    </>
  );
}
