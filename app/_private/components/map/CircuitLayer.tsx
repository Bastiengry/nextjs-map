import React, { useState } from "react";
import { Polyline } from "react-leaflet";
import { ProjectCircuit } from "../../types/Project";
import { lineStringToLatLngs } from "../../util/geomUtils";
import CircuitSelectionContextMenu from "./CircuitSelectionContextMenu";
import MapModes from "../../types/MapMode";

/**
 * Properties for the CircuitLayer component.
 *
 * mapMode map mode.
 * circuits circuits to display.
 * selectedId currently selected polyline (=circuit representation).
 * onSelect callback when a circuit is selected.
 * onEdit callback when asking for the edition mode for a circuit.
 * onDelete callback when asking for the deletion of the circuit.
 */
interface CircuitLayerProps {
  mapMode: string | undefined;
  circuits: ProjectCircuit[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Component to create a circuit layer on the map.
 * @param param0 properties of the component.
 * @return component.
 */
const CircuitLayer = ({
  mapMode,
  circuits,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: CircuitLayerProps) => {
  const [menuConfig, setMenuConfig] = useState<{
    x: number;
    y: number;
    id: number;
  } | null>(null);

  return (
    <>
      {circuits?.map((circuit) => {
        const isSelected = selectedId === circuit.id;

        // On mémorise les options pour éviter les re-rendus inutiles
        const pathOptions = {
          color: circuit.color || "black",
          weight: isSelected ? 6 : 3,
          opacity: isSelected ? 1 : 0.7,
        };

        return (
          <React.Fragment key={`circuit-${circuit.id}`}>
            {/* 1. Ligne invisible large pour faciliter le clic (Zone de capture) */}
            <Polyline
              key="virtual"
              positions={lineStringToLatLngs(circuit.geometry)}
              pathOptions={{ color: "transparent", weight: 15 }}
              eventHandlers={{
                click: () => {
                  if (
                    circuit.id &&
                    circuit?.geometry?.coordinates?.length > 0
                  ) {
                    if (selectedId === circuit.id) {
                      onSelect(null);
                    } else {
                      onSelect(circuit.id);
                    }
                  }
                },
                contextmenu: (e) => {
                  if (mapMode === MapModes.VIEW) {
                    if (circuit.id) {
                      // Leaflet utilise des événements natifs dans e.originalEvent
                      const { clientX, clientY } = e.originalEvent;
                      setMenuConfig({ x: clientX, y: clientY, id: circuit.id });
                    }
                  }
                },
              }}
            >
              {mapMode === MapModes.VIEW && menuConfig && (
                <CircuitSelectionContextMenu
                  x={menuConfig.x}
                  y={menuConfig.y}
                  onClose={() => setMenuConfig(null)}
                  onClickEditCircuit={() => onEdit(menuConfig.id)}
                  onClickDeleteCircuit={() => onDelete(menuConfig.id)}
                />
              )}
            </Polyline>

            {/* 2. Ligne visible réelle (Interactivité désactivée pour ne pas gêner la zone de capture) */}
            <Polyline
              key="real"
              positions={lineStringToLatLngs(circuit.geometry)}
              pathOptions={pathOptions}
              interactive={false}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default CircuitLayer;
