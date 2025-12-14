import { GeometryPoint, GeometryLineString } from "./Geometry";

export interface ProjectCircuit {
  id?: number;
  label: string;
  color: string;
  geometry: GeometryLineString;
}

export interface ProjectMarker {
  id?: number;
  label: string;
  point: GeometryPoint;
}

export interface Project {
  id?: number;
  label: string;
  circuits?: ProjectCircuit[];
  markers?: ProjectMarker[];
}

export interface ProjectIdLabel {
  id: number;
  label: string;
}
