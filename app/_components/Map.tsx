"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import L, { LatLngExpression } from "leaflet";
import { useEffect, useReducer, useRef } from "react";
import { MapAddressSearchControl } from "./MapAddressSearchControl";

export interface MapProps {
  position: LatLngExpression;
  zoom: number;
}

export default function Map({ position, zoom }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map("map", {
      center: position,
      zoom,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    forceUpdate();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div id="map" className="w-full h-full"></div>
      {!!mapRef.current && <MapAddressSearchControl map={mapRef.current} />}
    </>
  );
}
