export interface GeometryPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface GeometryLineString {
  type: "LineString";
  coordinates: [number, number][];
}

export interface GeometryPolygon {
  type: "Polygon";
  coordinates: [number, number][][];
}

export type Geometry = GeometryPoint | GeometryLineString | GeometryPolygon;
