"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet-draw/dist/leaflet.draw-src.js";
import { useMap } from "react-leaflet";
import MapModes from "../../types/MapMode";
import { useTranslation } from "react-i18next";

/**
 * Component properties.
 *
 * mapMode : current map mode ("VIEW", ...)
 */
interface MapRoutingMachineControlProps {
  mapMode: string | undefined;
  onClickCreateRoute: () => void;
}

/**
 * Leaflet control to draw the circuit following the roads/paths.
 *
 * The control is only updated if the map changes.
 *
 * But the "map mode", coming from the parent component, can change.
 * References to this element is stored as the value of a "useRef" with "myRef.current".
 * When the elements change, the "myRef.current" is updated with the new value.
 *
 * @param param0 parameters needed for the "ROOTING MACHINE" function.
 *
 * @returns null.
 */
export const MapRoutingMachineControl = ({
  mapMode,
  onClickCreateRoute,
}: MapRoutingMachineControlProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(undefined);
  /**
   * Stabilizes the callbacks.
   *
   * Stores the callbacks as a VALUE in a reference.
   *
   * In the rest of the code, we will call "myRef.current", which is always at the same address, even
   * if the callbacks change (the callbacks are the "values" of the references).
   */
  const onClickCreateRouteRef = useRef<() => void>(undefined);

  /**
   * Stabilizes the callback to start the "Create route" process.
   */
  useEffect(() => {
    onClickCreateRouteRef.current = onClickCreateRoute;
  }, [onClickCreateRoute]);

  /**
   * Manages the map events.
   */
  const map = useMap();

  /**
   * Creates and manages the control.
   */
  useEffect(() => {
    const MapRoutingMachineControl = L.Control.extend({
      onAdd: function () {
        const container = L.DomUtil.create("div");
        container.ariaLabel = "routing-machine-control";
        containerRef.current = container;

        L.DomEvent.disableClickPropagation(container);

        const button = L.DomUtil.create(
          "button",
          "pi pi-map bg-white border-gray-400 border-1 w-8 h-8 cursor-pointer",
          container,
        );
        button.ariaLabel = "routing-machine-control-button";
        button.title = t("map.control.routingMachine.title");

        L.DomEvent.on(
          button,
          "click",
          (e) => {
            if (onClickCreateRouteRef.current) {
              onClickCreateRouteRef.current();
            }
          },
          this,
        );

        return container;
      },
    });

    const control = new MapRoutingMachineControl();

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
