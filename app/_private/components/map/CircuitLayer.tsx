import React, { useRef, useState } from "react";
import { Marker, Polyline } from "react-leaflet";
import { ProjectCircuit } from "../../types/Project";
import { lineStringToLatLngs } from "../../util/geomUtils";
import CircuitSelectionContextMenu from "./CircuitSelectionContextMenu";
import MapModes from "../../types/MapMode";
import L from "leaflet";

/**
 * Properties for the CircuitLayer component.
 *
 * mapMode map mode.
 * circuits circuits to display.
 * selectedId currently selected polyline (=circuit representation).
 * onSelect callback when a circuit is selected.
 * onEdit callback when asking for the edition mode for a circuit.
 * onDelete callback when asking for the deletion of the circuit.
 * onAddPointToCircuit callback when asking to add a point to the circuit.
 * onUpdateCircuitGeometry callback to save the updated circuit geometry.
 */
interface CircuitLayerProps {
  mapMode: string | undefined;
  circuits: ProjectCircuit[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAddPointToCircuit: (id: number, latlng: L.LatLng) => void;
  onUpdateCircuitGeometry: (id: number, newPositions: L.LatLng[]) => void;
}

/**
 * Component to create a circuit layer on the map.
 *
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
  onAddPointToCircuit,
  onUpdateCircuitGeometry,
}: CircuitLayerProps) => {
  const [menuConfig, setMenuConfig] = useState<{
    x: number;
    y: number;
    latlng: L.LatLng;
    id: number;
  } | null>(null);
  // Ref to access to the polyline directly.
  const realPolylineRef = useRef<L.Polyline | null>(null);

  // Ref to follow the mouse positions without re-rendering
  const draggingPositionsRef = useRef<L.LatLng[]>([]);

  return (
    <>
      {circuits?.map((circuit) => {
        const isSelected = selectedId === circuit.id;
        const positions = lineStringToLatLngs(circuit.geometry);

        const pathOptions = {
          color: circuit.color || "black",
          weight: isSelected ? 6 : 3,
          opacity: isSelected ? 1 : 0.7,
        };

        return (
          <React.Fragment key={`circuit-${circuit.id}`}>
            {/* Virtual line more thick to facilitate the click (Capture area) */}
            <Polyline
              key="virtual"
              positions={positions}
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
                      // Leaflet uses native events in e.originalEvent
                      const { clientX, clientY } = e.originalEvent;
                      setMenuConfig({
                        x: clientX,
                        y: clientY,
                        latlng: e.latlng,
                        id: circuit.id,
                      });
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
                  onClickAddPointToCircuit={() =>
                    onAddPointToCircuit(menuConfig.id, menuConfig.latlng)
                  }
                />
              )}
            </Polyline>

            {/* Real line (Interactivity incative to avoid to pertubate the capture area) */}
            <Polyline
              key="real"
              ref={
                isSelected
                  ? (ref) => {
                      realPolylineRef.current = ref;
                    }
                  : null
              }
              positions={positions}
              pathOptions={pathOptions}
              interactive={false} // To avoid to lock the click on the real line.
            />

            {/* Display of the points if the circuit is selected */}
            {isSelected &&
              positions?.map((pos, index) => (
                <Marker
                  key={`point-${circuit.id}-${index}`}
                  position={pos}
                  draggable={true}
                  icon={L.divIcon({
                    className: "custom-div-icon",
                    html: `<div style="background-color: white; border: 2px solid ${circuit.color || "black"}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
                    iconSize: [10, 10],
                    iconAnchor: [5, 5],
                  })}
                  eventHandlers={{
                    dragstart: () => {
                      draggingPositionsRef.current = [...positions];
                    },
                    drag: (e) => {
                      const newPos = e.target.getLatLng();

                      // Updates the rendering without react.
                      if (realPolylineRef.current) {
                        draggingPositionsRef.current[index] = newPos;
                        realPolylineRef.current.setLatLngs(
                          draggingPositionsRef.current,
                        );
                      }
                    },
                    dragend: (e) => {
                      // Notifies the parent
                      onUpdateCircuitGeometry(circuit.id!, [
                        ...draggingPositionsRef.current,
                      ]);
                    },
                  }}
                />
              ))}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default CircuitLayer;
