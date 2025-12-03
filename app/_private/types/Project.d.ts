import { Geometry } from "./Geometry";

export interface ProjectCircuit {
  id?: number;
  label: string;
  geometry: GeometryLineString;
}

export interface Project {
  id?: number;
  label: string;
  circuits?: ProjectCircuit[];
}

export interface ProjectIdLabel {
  id: number;
  label: string;
}
