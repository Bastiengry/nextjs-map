"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import L, { LatLng, LatLngExpression } from "leaflet";
import { useEffect, useReducer, useRef, useState } from "react";
import { MapAddressSearchControl } from "./MapAddressSearchControl";
import MapSidebar from "./MapSidebar";
import { MapSidebarMenuControl } from "./MapSidebarMenuControl";

export interface MapProps {
  position: LatLngExpression;
  zoom: number;
}

export default function Map({ position, zoom }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [, forceUpdateMap] = useReducer((x) => x + 1, 0);
  const [visibleSidebar, setVisibleSidebar] = useState<boolean>(true);

  const onSideBarVisibilityChanged = (newVisibility: boolean) => {
    setVisibleSidebar(newVisibility);
    setTimeout(function () {
      mapRef.current?.invalidateSize(false);
    }, 200);
  };

  const onMapPanTo = (coord: LatLng) => {
    mapRef.current?.panTo(coord);
  };

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

    forceUpdateMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
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
      <div className={`grow ${visibleSidebar ? "display-map" : ""}`}>
        <div id="map" className="w-full h-full" style={{ zIndex: 0 }}></div>
        {!!mapRef.current && <MapAddressSearchControl map={mapRef.current} />}
        {!!mapRef.current && !visibleSidebar && (
          <MapSidebarMenuControl
            map={mapRef.current}
            onClickOpenSideMenu={() => onSideBarVisibilityChanged(true)}
          />
        )}
      </div>
    </div>
  );
}
