"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-routing-machine";

import L from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapAddressSearchControl } from "./MapAddressSearchControl";
import MapSidebar from "./MapSidebar";
import { MapSidebarMenuControl } from "./MapSidebarMenuControl";
import { MapAddPolylineControl } from "./MapAddPolylineControl";
import { MapAddMarkerControl } from "./MapAddMarkerControl";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { MapLocationControl } from "./MapLocationControl";
import { Project, ProjectCircuit } from "../../types/Project";
import { GeometryLineString, GeometryPoint } from "../../types/Geometry";
import {
  latLngsToLineString,
  lineStringToLatLngs,
  pointToLatLng,
} from "../../util/geomUtils";
import MapModes from "../../types/MapMode";
import EditModeTypes from "../../types/EditModeTypes";
import CircuitLayer from "./CircuitLayer";
import MapInstanceSetter from "./MapInstanceSetter";
import { MapRoutingMachineControl } from "./MapRoutingMachineControl";
import { RouteResult } from "../../types/leaflet-routing-machine";
import * as turf from "@turf/turf";
import { useTranslation } from "react-i18next";

export interface MapProps {
  position: L.LatLngLiteral;
  zoom: number;
  editMode: string | undefined;
  project: Project | undefined;
  setEditMode: (mode: string) => void;
  onStartMapEdit: () => void;
  onEndMapEdit: () => void;
  onAddPolyline: (polyline: GeometryLineString) => void;
  onEditCircuit: (circuit: ProjectCircuit) => void;
  onRemoveCircuit: (circuit: ProjectCircuit) => void;
  onUpdateCircuitGeometry: (circuit: ProjectCircuit) => void;
  onAddMarker: (point: GeometryPoint) => void;
  onDeleteMarker?: (markerId: number) => void;
}

export default function Map({
  position,
  zoom,
  project,
  editMode,
  onStartMapEdit,
  onEndMapEdit,
  onAddPolyline,
  onEditCircuit,
  onRemoveCircuit,
  onUpdateCircuitGeometry,
  onAddMarker,
  onDeleteMarker,
}: MapProps) {
  const { t } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const [mapMode, setMapMode] = useState<string>(MapModes.VIEW);
  const [visibleSidebar, setVisibleSidebar] = useState<boolean>(true);
  const [currentDrawPolyline, setCurrentDrawPolyline] = useState<
    GeometryLineString | undefined
  >(undefined);
  const [selectedPolylineId, setSelectedPolylineId] = useState<number | null>(
    null,
  );
  const [loaded, setLoaded] = useState<boolean>(false);
  const [currentRoutingMachinePolyline, setCurrentRoutingMachinePolyline] =
    useState<GeometryLineString | null>(null);

  const onSideBarVisibilityChanged = (newVisibility: boolean) => {
    setVisibleSidebar(newVisibility);
    setTimeout(function () {
      mapRef.current?.invalidateSize(false);
    }, 200);
  };

  const onMapPanTo = (coord: L.LatLngLiteral) => {
    mapRef.current?.panTo(coord);
  };

  const onControlClickStartAddMarker = useCallback(() => {
    setMapMode(MapModes.ADD_MARKER);
    onStartMapEdit();
  }, [onStartMapEdit]);

  const onControlClickEndAddMarker = useCallback(() => {
    setMapMode(MapModes.VIEW);
    onEndMapEdit();
  }, [onEndMapEdit]);

  const onControlClickStartAddPolyline = useCallback(() => {
    setMapMode(MapModes.ADD_POLYLINE);
    onStartMapEdit();
  }, [onStartMapEdit]);

  const onControlClickDrawPolyline = useCallback(
    (polyline: GeometryLineString) => {
      setCurrentDrawPolyline(polyline);
    },
    [],
  );

  const onControlClickValidateAddPolyline = useCallback(
    (polyline: GeometryLineString) => {
      setCurrentDrawPolyline(undefined);
      onAddPolyline(polyline);
    },
    [onAddPolyline],
  );

  const onControlClickCancelAddPolyline = useCallback(() => {
    setCurrentDrawPolyline(undefined);
    setMapMode(MapModes.VIEW);
  }, []);

  useEffect(() => {
    if (editMode !== EditModeTypes.EDIT_MAP) {
      setMapMode(MapModes.VIEW);
    }
  }, [editMode]);

  /**
   * Edits a circuit.
   *
   * @param id id of the circuit to edit.
   */
  const editCircuit = useCallback(
    (id: number) => {
      const circuitToEdit = project?.circuits?.find((circ) => circ.id === id);
      if (circuitToEdit) {
        onEditCircuit(circuitToEdit);
      }
    },
    [onEditCircuit],
  );

  /**
   * Deletes a circuit.
   *
   * @param id id of the circuit to delete.
   */
  const deleteCircuit = useCallback(
    (id: number) => {
      const circuitToDelete = project?.circuits?.find((circ) => circ.id === id);
      if (id === selectedPolylineId) {
        setSelectedPolylineId(null);
      }
      if (circuitToDelete) {
        onRemoveCircuit(circuitToDelete);
      }
    },
    [onRemoveCircuit, selectedPolylineId],
  );

  /**
   * Deletes the selected circuit.
   */
  const deleteSelectedCircuit = useCallback(() => {
    if (selectedPolylineId !== null) {
      deleteCircuit(selectedPolylineId);
    }
  }, [selectedPolylineId, deleteCircuit]);

  /**
   * Adds a point to a circuit.
   *
   * @param id id of the circuit.
   * @param latlng coordinates of the point to add.
   */
  const addPointToCircuit = useCallback(
    (id: number, latlng: L.LatLng) => {
      const circuitToModify = project?.circuits?.find((circ) => circ.id === id);
      if (circuitToModify) {
        // Converts actual coordinates from LineString to LatLng.
        const currentCoordsLatLng = lineStringToLatLngs(
          circuitToModify.geometry,
        );

        // Conversion to be able to use Turf.
        const line = turf.lineString(
          currentCoordsLatLng.map((c) => [c.lng, c.lat]),
        );
        const point = turf.point([latlng.lng, latlng.lat]);

        // Finds the nearest segment from the point to add.
        const nearestSegment = turf.nearestPointOnLine(line, point);

        // Inserts the point at the good location
        const insertIndex = nearestSegment.properties.index! + 1;
        const newCoords = [...currentCoordsLatLng];
        newCoords.splice(insertIndex, 0, latlng);

        // Creates the new geometry.
        const updatedCircuit: ProjectCircuit = {
          ...circuitToModify,
          geometry: latLngsToLineString(newCoords),
        };

        // Transmits the modification to the App component.
        onUpdateCircuitGeometry(updatedCircuit);
      }
    },
    [project, onEditCircuit],
  );

  /**
   * Updates when dragging the circuit geometry.
   *
   * @param id id of the circuit.
   * @param newLatLngs new geometry.
   */
  const updateCircuitGeometry = useCallback(
    (id: number, newLatLngs: L.LatLng[]) => {
      let circuitToModify =
        project?.circuits?.find((circ) => circ.id === id) || null;
      if (circuitToModify) {
        const updatedCircuit: ProjectCircuit = {
          ...circuitToModify,
          geometry: latLngsToLineString(newLatLngs),
        };
        onUpdateCircuitGeometry(updatedCircuit);
      }
    },
    [onUpdateCircuitGeometry],
  );

  const deletePointFromCircuit = useCallback(
    (id: number, indexToDelete: number) => {
      let circuitToModify =
        project?.circuits?.find((circ) => circ.id === id) || null;
      if (circuitToModify) {
        if (circuitToModify.geometry.coordinates.length <= 2) {
          alert(t("circuit.circuitMustContainAtLeast2Points"));
          return;
        }

        const updatedCircuit: ProjectCircuit = {
          ...circuitToModify,
          geometry: {
            type: "LineString",
            coordinates: [
              ...circuitToModify.geometry.coordinates.filter(
                (_, index) => index !== indexToDelete,
              ),
            ],
          },
        };
        onUpdateCircuitGeometry(updatedCircuit);
      }
    },
    [onUpdateCircuitGeometry],
  );

  /**
   * Right clic events.
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete") {
        deleteSelectedCircuit();
      }
    };

    // On attache l'événement
    window.addEventListener("keydown", handleKeyDown);

    // Nettoyage crucial pour éviter les fuites de mémoire
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteSelectedCircuit]);

  /**
   * Actions done when the component is mounted or his key is refreshed.
   */
  useEffect(() => {
    setSelectedPolylineId(null);
    setCurrentDrawPolyline(undefined);
    setLoaded(true);
  }, []);

  /**
   * Prepares the circuits to display them on the circuit layer.
   *
   * @returns circuits to display.
   */
  const prepareCircuitsForCircuitLayer = (): ProjectCircuit[] => {
    let circs: ProjectCircuit[] = [];
    if (project?.circuits) {
      circs.push(...project.circuits);
    }

    if (currentDrawPolyline) {
      circs.push({
        geometry: currentDrawPolyline,
        color: "#000000",
        label: "",
      });
    }
    if (currentRoutingMachinePolyline) {
      circs.push({
        geometry: currentRoutingMachinePolyline,
        color: "#48FF45",
        label: "",
      });
    }
    return circs;
  };

  /**
   * Calculates a route (leaflet routing machine).
   *
   * @param points  points of the original circuit.
   * @returns calculated route.
   */
  const calculateRoute = (points: L.LatLng[]) => {
    // Uses the router of leaflet routing machine
    const router = (L as any).Routing.osrmv1({
      serviceUrl: "https://router.project-osrm.org/route/v1",
    });

    // Prepares the waypoints
    const waypoints = points.map((p) => ({ latLng: p }));

    // Executes the request and returns a promise.
    return new Promise((resolve, reject) => {
      router.route(waypoints, (err: any, routes: any) => {
        if (err) {
          reject(err);
        } else {
          // routes[0] contient la géométrie lissée, la distance et le temps
          resolve(routes[0]);
        }
      });
    });
  };

  /**
   * Calculates a route (leaflet routing machine) for the selected polyline.
   *
   * @returns calculated route.
   */
  const calculateRouteForSelectedPolyline = async () => {
    if (selectedPolylineId !== null) {
      const selectedCircuitGeometry = project?.circuits?.find(
        (circ) => circ.id === selectedPolylineId,
      )?.geometry;
      if (selectedCircuitGeometry) {
        const latLngCircuit = lineStringToLatLngs(selectedCircuitGeometry);

        if (latLngCircuit) {
          const routedPolyline = (await calculateRoute(
            latLngCircuit,
          )) as RouteResult;
          if (routedPolyline) {
            setCurrentRoutingMachinePolyline(
              latLngsToLineString(routedPolyline.coordinates),
            );
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-full flex">
      {visibleSidebar && (
        <div className="grow md:grow-0">
          <MapSidebar
            project={project}
            onVisibilityChanged={onSideBarVisibilityChanged}
            onMapPanTo={onMapPanTo}
          />
        </div>
      )}
      <div id="map" data-testid="map" className="w-full h-full">
        {loaded && (
          <MapContainer
            center={position}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: "100%" }}
          >
            <MapInstanceSetter
              onReady={(map) => {
                mapRef.current = map;
              }}
            />
            <TileLayer
              aria-label="tile-layer"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {project?.markers?.map((marker) => (
              <Marker
                key={`map-marker-${marker.id}`}
                aria-label={`map-marker-${marker.id}`}
                position={pointToLatLng(marker.point)}
                eventHandlers={{
                  contextmenu: (e) => {
                    L.DomEvent.stopPropagation(e);
                    if (onDeleteMarker && marker?.id) {
                      onDeleteMarker(marker.id);
                    }
                  },
                }}
              />
            ))}
            <CircuitLayer
              mapMode={mapMode}
              circuits={prepareCircuitsForCircuitLayer()}
              selectedId={selectedPolylineId}
              onSelect={setSelectedPolylineId}
              onEdit={editCircuit}
              onDelete={deleteCircuit}
              onAddPointToCircuit={addPointToCircuit}
              onUpdateCircuitGeometry={updateCircuitGeometry}
              onDeletePointFromCircuit={deletePointFromCircuit}
            />
            {!visibleSidebar && (
              <MapSidebarMenuControl
                onClickOpenSideMenu={() => onSideBarVisibilityChanged(true)}
              />
            )}
            <MapAddressSearchControl mapMode={mapMode} />
            <MapAddMarkerControl
              mapMode={mapMode}
              onAddMarker={onAddMarker}
              onClickStartAddMarker={onControlClickStartAddMarker}
              onClickEndAddMarker={onControlClickEndAddMarker}
            />
            <MapAddPolylineControl
              mapMode={mapMode}
              onClickStartAddPolyline={onControlClickStartAddPolyline}
              onClickDrawPolyline={onControlClickDrawPolyline}
              onClickValidateAddPolyline={onControlClickValidateAddPolyline}
              onClickCancelAddPolyline={onControlClickCancelAddPolyline}
            />
            <MapLocationControl mapMode={mapMode} />
            <MapRoutingMachineControl
              mapMode={mapMode}
              onClickCreateRoute={calculateRouteForSelectedPolyline}
            />
          </MapContainer>
        )}
      </div>
    </div>
  );
}
