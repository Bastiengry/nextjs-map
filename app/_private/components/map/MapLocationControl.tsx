"use client";

import L from "leaflet";
import { useLeafletContext } from "@react-leaflet/core";
import { useEffect } from "react";
import "leaflet-draw/dist/leaflet.draw-src.js";
import { useMapEvents } from "react-leaflet";

interface MapLocationControlProps {}

export const MapLocationControl = ({}: MapLocationControlProps) => {
  const context = useLeafletContext();

  const map = useMapEvents({
    locationfound(e) {
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const MapLocationControl = L.Control.extend({
    onAdd: function () {
      const el = L.DomUtil.create("div");
      el.title = "Center on your position";
      const button = L.DomUtil.create(
        "button",
        "pi pi-map-marker bg-white p-1 border-gray-400 border-1 w-8 h-8 cursor-pointer",
        el
      );

      L.DomEvent.on(
        button,
        "click",
        (e) => {
          map.locate();
        },
        this
      );

      el.className = "relative";

      el.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
      });

      return el;
    },
    onRemove: function (map: L.Map) {
      return;
    },
  });

  useEffect(() => {
    const container = context.map;
    const control = new MapLocationControl();
    container.addControl(control);
    return () => {
      container.removeControl(control);
    };
  }, []);

  return null;
};
