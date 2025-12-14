import L from "leaflet";
import { GeometryLineString } from "../types/Geometry";

export function latLngsToLineString(latLngs: L.LatLng[]): GeometryLineString {
  return {
    type: "LineString",
    coordinates: latLngs.map(({ lat, lng }) => [lng, lat]),
  };
}

export function addLatLngsToLineString(
  lineString: GeometryLineString,
  addedLatLngs: L.LatLng[]
): GeometryLineString {
  const addedCoords: [number, number][] = addedLatLngs.map(
    (latLng: L.LatLng) => [latLng.lng, latLng.lat]
  );

  return {
    type: lineString.type,
    coordinates: [...lineString.coordinates, ...addedCoords],
  };
}

export function lineStringToLatLngs(line: GeometryLineString): L.LatLng[] {
  return line.coordinates.map(([lng, lat]) => L.latLng(lat, lng));
}
