import * as L from "leaflet";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function plan(waypoints: any, options: any): any;
  }
}

export interface RouteSummary {
  totalDistance: number; // en mètres
  totalTime: number; // en secondes
}

export interface RouteResult {
  name?: string;
  summary: RouteSummary;
  coordinates: L.LatLng[];
  instructions: any[];
  waypoints: L.any[];
}
