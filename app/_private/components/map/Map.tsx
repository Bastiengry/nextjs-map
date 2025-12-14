"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import L from "leaflet";
import { useCallback, useEffect, useState } from "react";
import { MapAddressSearchControl } from "./MapAddressSearchControl";
import MapSidebar from "./MapSidebar";
import { MapSidebarMenuControl } from "./MapSidebarMenuControl";
import { MapDrawPolylineControl } from "./MapDrawPolylineControl";
import { MapAddMarkerControl } from "./MapAddMarkerControl";
import {
  MapContainer,
  Marker,
  GeoJSON,
  Popup,
  TileLayer,
  Polygon,
} from "react-leaflet";
import { MapLocationControl } from "./MapLocationControl";
import { Project } from "../../types/Project";
import { GeometryLineString } from "../../types/Geometry";
import { lineStringToLatLngs } from "../../util/geomUtils";

export interface MapProps {
  position: L.LatLngExpression;
  zoom: number;
  editMode: string | undefined;
  project: Project | undefined;
  setEditMode: (mode: string) => void;
  onAddCircuitPolyline: (polyline: GeometryLineString) => void;
}

export default function Map({
  position,
  zoom,
  project,
  editMode,
  setEditMode,
  onAddCircuitPolyline,
}: MapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [visibleSidebar, setVisibleSidebar] = useState<boolean>(true);
  const [markers, setMarkers] = useState<L.LatLng[]>([]);
  const [currentDrawPolyline, setCurrentDrawPolyline] = useState<
    GeometryLineString | undefined
  >(undefined);
  const [loaded, setLoaded] = useState<boolean>(false);

  const onSideBarVisibilityChanged = (newVisibility: boolean) => {
    setVisibleSidebar(newVisibility);
    setTimeout(function () {
      map?.invalidateSize(false);
    }, 200);
  };

  const onMapPanTo = (coord: L.LatLng) => {
    map?.panTo(coord);
  };

  const onAddMarker = (coord: L.LatLng) => {
    setMarkers([...markers, coord]);
  };

  const onDrawPolyline = useCallback(
    (polyline: GeometryLineString) => {
      setCurrentDrawPolyline(polyline);
    },
    [setCurrentDrawPolyline]
  );

  const onValidateAddPolyline = useCallback(
    (polyline: GeometryLineString) => {
      setCurrentDrawPolyline(undefined);
      onAddCircuitPolyline(polyline);
    },
    [setCurrentDrawPolyline, onAddCircuitPolyline]
  );

  const onCancelAddPolyline = useCallback(() => {
    setCurrentDrawPolyline(undefined);
  }, [setCurrentDrawPolyline]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="w-full h-full flex">
      {visibleSidebar && (
        <div className="grow md:grow-0">
          <MapSidebar
            onVisibilityChanged={onSideBarVisibilityChanged}
            onMapPanTo={onMapPanTo}
          />
        </div>
      )}
      <div id="map" className="w-full h-full">
        {loaded && (
          <MapContainer
            center={position}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: "100%" }}
            ref={setMap}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers?.map((marker) => (
              <Marker key={marker.toString()} position={marker}>
                <Popup>
                  A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
              </Marker>
            ))}
            {project?.circuits?.map((circuit) => (
              <Polygon
                key={circuit.id}
                positions={lineStringToLatLngs(circuit.geometry)}
              />
            ))}
            {currentDrawPolyline && (
              <Polygon positions={lineStringToLatLngs(currentDrawPolyline)} />
            )}
            {!visibleSidebar && (
              <MapSidebarMenuControl
                onClickOpenSideMenu={() => onSideBarVisibilityChanged(true)}
              />
            )}
            <MapAddressSearchControl />
            <MapAddMarkerControl
              editMode={editMode}
              setEditMode={setEditMode}
              onAddMarker={onAddMarker}
            />
            <MapLocationControl />
            <MapDrawPolylineControl
              editMode={editMode}
              setEditMode={setEditMode}
              onDrawPolyline={onDrawPolyline}
              onValidateAddPolyline={onValidateAddPolyline}
              onCancelAddPolyline={onCancelAddPolyline}
            />
          </MapContainer>
        )}
      </div>
    </div>
  );
}
