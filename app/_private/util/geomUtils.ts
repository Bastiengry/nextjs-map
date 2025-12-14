import L from "leaflet";
import { GeometryLineString, GeometryPoint } from "../types/Geometry";

export function latLngsToLineString(
  latLngs: L.LatLngLiteral[]
): GeometryLineString {
  return {
    type: "LineString",
    coordinates: latLngs.map(({ lat, lng }) => [lng, lat]),
  };
}

export function addLatLngsToLineString(
  lineString: GeometryLineString,
  addedLatLngs: L.LatLngLiteral[]
): GeometryLineString {
  const addedCoords: [number, number][] = addedLatLngs.map(
    (latLng: L.LatLngLiteral) => [latLng.lng, latLng.lat]
  );

  return {
    type: lineString.type,
    coordinates: [...lineString.coordinates, ...addedCoords],
  };
}

export function lineStringToLatLngs(line: GeometryLineString): L.LatLng[] {
  return line.coordinates.map(([lng, lat]) => L.latLng(lat, lng));
}

export function numberArrayToLatLng(
  numberArray: [number, number]
): L.LatLngLiteral {
  return {
    lat: numberArray[1],
    lng: numberArray[0],
  };
}

export function latLngToPoint(latLng: L.LatLngLiteral): GeometryPoint {
  return {
    type: "Point",
    coordinates: [latLng.lng, latLng.lat],
  };
}

export function pointToLatLng(point: GeometryPoint): L.LatLngLiteral {
  return {
    lat: point?.coordinates[1],
    lng: point?.coordinates[0],
  };
}
