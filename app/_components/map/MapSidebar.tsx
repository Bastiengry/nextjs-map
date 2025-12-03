"use client";

import { Button } from "primereact/button";
import { MenuItem } from "primereact/menuitem";
import { PanelMenu } from "primereact/panelmenu";
import { useMemo, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { useQuery } from "@tanstack/react-query";
import { useConfiguration } from "../configuration/useConfiguration";
import { ConfIdLabel } from "../configuration/ConfIdLabel";
import { LatLng } from "leaflet";
import {
  ConfigurationCircuit,
  ConfigurationPoint,
} from "../configuration/Configuration";

interface MapSidebarProps {
  onVisibilityChanged: (visible: boolean) => void;
  onMapPanTo: (coord: LatLng) => void;
}

export default function MapSidebar({
  onVisibilityChanged,
  onMapPanTo,
}: MapSidebarProps) {
  const {
    data: confNames = [],
    isLoading: confNamesLoading,
    error: confNamesLoadError,
  } = useQuery<ConfIdLabel[]>({
    queryKey: ["confNames"],
    queryFn: async () => {
      const res = await fetch("/api/configuration/name");
      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
  });
  const [selectedConfIdLbl, setSelectedConfIdLbl] = useState<
    ConfIdLabel | null | undefined
  >();
  const { data: conf } = useConfiguration(selectedConfIdLbl?.id);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: "Circuits",
        icon: "pi pi-th-large",
        data: conf,
        items: conf?.circuits?.map((circuit: ConfigurationCircuit) => ({
          id: circuit.id.toString(),
          label: circuit.label,
          items: circuit?.pts.map((pt: ConfigurationPoint) => ({
            id: pt.id.toString(),
            label: pt.label,
            items: [
              {
                label: `Latitude: ${pt.position.lat}`,
                disabled: true,
              },
              {
                label: `Longitude: ${pt.position.lng}`,
                disabled: true,
              },
              {
                label: "Center on point",
                icon: "pi pi-map-marker",
                command: () => onMapPanTo(pt.position),
              },
            ],
          })),
        })),
      },
    ],
    [conf]
  );

  const onConfSelectionChanged = (event: DropdownChangeEvent) => {
    const newSelectedConfIdLbl: ConfIdLabel = event.value;
    setSelectedConfIdLbl(newSelectedConfIdLbl);
  };
  console.log("confNames", confNames);
  return (
    <>
      <div className="flex flex-col m-3 gap-2 min-w-2xs">
        <div className="flex ">
          <div className="flex flex-1 justify-center items-center font-bold text-2xl">
            NextJS MAP
          </div>
          <Button
            className="flex-none"
            icon="pi pi-times"
            size="small"
            severity="secondary"
            onClick={() => onVisibilityChanged(false)}
          />
        </div>
        <Dropdown
          value={selectedConfIdLbl}
          onChange={onConfSelectionChanged}
          options={confNames}
          optionLabel="label"
          placeholder="Select a configuration"
          pt={{
            input: {
              className: "font-extrabold",
            },
          }}
          checkmark={true}
          highlightOnSelect={false}
        />
        {!!selectedConfIdLbl && <PanelMenu model={menuItems} />}
      </div>
    </>
  );
}
