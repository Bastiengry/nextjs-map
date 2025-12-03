import { LatLngExpression } from "leaflet";

export interface ConfigurationPoint {
  id: number;
  label: string;
  position: LatLng;
}

export interface ConfigurationCircuit {
  id: number;
  label: string;
  pts: ConfigurationPoint[];
}

export interface Configuration {
  id: number;
  label: string;
  circuits: ConfigurationCircuit[];
}
