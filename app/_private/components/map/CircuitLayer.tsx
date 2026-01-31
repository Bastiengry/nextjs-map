import React, { useRef, useState } from "react";
import { Marker, Polyline } from "react-leaflet";
import { ProjectCircuit } from "../../types/Project";
import { lineStringToLatLngs } from "../../util/geomUtils";
import CircuitSelectionContextMenu from "./CircuitSelectionContextMenu";
import MapModes from "../../types/MapMode";
import L from "leaflet";
import { PolyPointContextMenu } from "./PolyPointContextMenu";

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
 * onDeletePointFromCircuit callback to delete a point from a circuit.
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
  onDeletePointFromCircuit: (id: number, index: number) => void;
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
  onDeletePointFromCircuit,
}: CircuitLayerProps) => {
  const [menuConfig, setMenuConfig] = useState<{
    x: number;
    y: number;
    latlng: L.LatLng;
    id: number;
  } | null>(null);
  const [pointMenuConfig, setPointMenuConfig] = useState<{
    x: number;
    y: number;
    circuitId: number;
    pointIndex: number;
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
          <React.Fragment key={`circuit-${circuit.id || -1}`}>
            {/* Virtual line more thick to facilitate the click (Capture area) */}
            <Polyline
              key="virtual"
              aria-label={`virtual-polyline-circuit-${circuit.id || -1}`}
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
            ></Polyline>

            {/* Real line (Interactivity inactive to avoid to pertubate the capture area) */}
            <Polyline
              key="real"
              aria-label={`real-polyline-circuit-${circuit.id || -1}`}
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
                  key={`point-${circuit.id || -1}-${index}`}
                  aria-label={`points-circuit-${circuit.id || -1}`}
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
                      setPointMenuConfig(null);
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
                    contextmenu: (e) => {
                      L.DomEvent.stopPropagation(e);

                      if (circuit.id) {
                        const { clientX, clientY } = e.originalEvent;
                        setPointMenuConfig({
                          x: clientX,
                          y: clientY,
                          circuitId: circuit.id,
                          pointIndex: index,
                        });
                      }
                    },
                  }}
                />
              ))}

            {/* Display the contextual menu on the circuit */}
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

            {/* Display the contextual menu on a point of the circuit */}
            {pointMenuConfig && (
              <PolyPointContextMenu
                x={pointMenuConfig.x}
                y={pointMenuConfig.y}
                onClose={() => setPointMenuConfig(null)}
                onDelete={() => {
                  onDeletePointFromCircuit(
                    pointMenuConfig.circuitId,
                    pointMenuConfig.pointIndex,
                  );
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default CircuitLayer;
