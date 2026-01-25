"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet-draw/dist/leaflet.draw-src.js";
import { useMapEvents } from "react-leaflet";
import MapModes from "../../types/MapMode";

/**
 * Component properties.
 *
 * mapMode : current map mode ("VIEW", ...)
 */
interface MapLocationControlProps {
  mapMode: string | undefined;
}

/**
 * Leaflet control to center on current user location.
 *
 * The control is only updated if the map changes.
 *
 * But the "map mode", coming from the parent component, can change.
 * References to this element is stored as the value of a "useRef" with "myRef.current".
 * When the elements change, the "myRef.current" is updated with the new value.
 *
 * @param param0 parameters needed for the "USER LOCATION" function.
 *
 * @returns null.
 */
export const MapLocationControl = ({ mapMode }: MapLocationControlProps) => {
  const containerRef = useRef<HTMLDivElement>(undefined);

  /**
   * Manages the map events.
   */
  const map = useMapEvents({
    locationfound(e) {
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  /**
   * Creates and manages the control.
   */
  useEffect(() => {
    const MapLocationControl = L.Control.extend({
      onAdd: function () {
        const container = L.DomUtil.create("div");
        container.ariaLabel = "location-control";
        containerRef.current = container;

        L.DomEvent.disableClickPropagation(container);

        const button = L.DomUtil.create(
          "button",
          "pi pi-map-marker bg-white border-gray-400 border-1 w-8 h-8 cursor-pointer",
          container,
        );
        button.ariaLabel = "location-control-button";
        button.title = "Center on your position";

        L.DomEvent.on(
          button,
          "click",
          (e) => {
            map.locate();
          },
          this,
        );

        return container;
      },
    });

    const control = new MapLocationControl();

    map.addControl(control);
    return () => {
      map.removeControl(control);
    };
  }, [map]);

  /**
   * Updates the "map mode" in the reference.
   */
  useEffect(() => {
    if (mapMode === MapModes.VIEW) {
      if (containerRef.current) {
        containerRef.current.style.visibility = "visible";
      }
    } else {
      if (containerRef.current) {
        containerRef.current.style.visibility = "hidden";
      }
    }
  }, [mapMode]);

  return null;
};
