"use client";

import L from "leaflet";
import { useCallback, useEffect, useRef } from "react";
import "leaflet-draw/dist/leaflet.draw-src.js";
import { useMapEvents } from "react-leaflet";
import MapModes from "../../types/MapMode";
import { latLngToPoint } from "../../util/geomUtils";
import { GeometryPoint } from "../../types/Geometry";

/**
 * Component properties.
 *
 * mapMode : current map mode ("ADD_MARKER", "VIEW"...)
 * onClickStartAddMarker : callback when the user clicks on the button to start to add markers.
 * onClickEndAddMarker : callback when the user clicks on the button to terminate to add markers.
 * onAddMarker : callback when the user clicks on the map to place a marker.
 */
interface MapAddMarkerControlProps {
  mapMode: string | undefined;
  onClickStartAddMarker: () => void;
  onClickEndAddMarker: () => void;
  onAddMarker: (coord: GeometryPoint) => void;
}

/**
 * Leaflet control to add markers on the map.
 *
 * The control is only updated if the map changes.
 *
 * But the "map mode" and the "callbacks", coming from the parent component, can change.
 * References to these elements are stored as the values of some "useRef" with "myRef.current".
 * When the elements change, the "myRef.current" is updated with the new value/callback pointer.
 *
 * @param param0 parameters needed for the "ADD MARKER" function.
 *
 * @returns null.
 */
export const MapAddMarkerControl = ({
  mapMode,
  onClickStartAddMarker,
  onClickEndAddMarker,
  onAddMarker,
}: MapAddMarkerControlProps) => {
  /**
   * Stabilizes the buttons of the control to be able to access to them out of the useEffect where they are created.
   */
  const containerRef = useRef<HTMLDivElement>(undefined);
  const buttonRef = useRef<HTMLButtonElement>(undefined);

  /**
   * Stabilizes the map mode.
   */
  const lastMapModeRef = useRef<string>(undefined);

  /**
   * Stabilizes the callbacks.
   *
   * Stores the callbacks as a VALUE in a reference.
   *
   * In the rest of the code, we will call "myRef.current", which is always at the same address, even
   * if the callbacks change (the callbacks are the "values" of the references).
   */
  const onClickStartAddMarkerRef = useRef<() => void>(undefined);
  const onClickEndAddMarkerRef = useRef<() => void>(undefined);
  const onAddMarkerRef = useRef<(coord: GeometryPoint) => void>(undefined);

  /**
   * Stabilizes the callback to start the "Add marker" process.
   */
  useEffect(() => {
    onClickStartAddMarkerRef.current = onClickStartAddMarker;
  }, [onClickStartAddMarker]);

  /**
   * Stabilizes the callback to terminate the "Add marker" process.
   */
  useEffect(() => {
    onClickEndAddMarkerRef.current = onClickEndAddMarker;
  }, [onClickStartAddMarker]);

  /**
   * Stabilizes the callback to add a marker on the map.
   */
  useEffect(() => {
    onAddMarkerRef.current = onAddMarker;
  }, [onAddMarker]);

  /**
   * Manages the map events.
   */
  const map = useMapEvents({
    click(e: L.LeafletMouseEvent) {
      if (mapMode === MapModes.ADD_MARKER) {
        if (onAddMarkerRef.current) {
          onAddMarkerRef.current(latLngToPoint(e.latlng));
        }
      }
    },
  });

  /**
   * Changes the buttons to their appearance when the drawing is started.
   */
  const switchBtnOnStartEdit = useCallback(() => {
    if (buttonRef.current) {
      buttonRef.current.style.background = "#777777";
      buttonRef.current.style.color = "#FFFFFF";
    }
  }, []);

  /**
   * Changes the buttons to their appearance when the drawing is terminated.
   */
  const switchBtnOnEndEdit = useCallback(() => {
    if (buttonRef.current) {
      buttonRef.current.style.background = "";
      buttonRef.current.style.color = "";
    }
  }, []);

  /**
   * Creates and manages the control.
   */
  useEffect(() => {
    const MapAddMarkerControl = L.Control.extend({
      onAdd: function () {
        const container = L.DomUtil.create("div");
        containerRef.current = container;

        L.DomEvent.disableClickPropagation(container);

        container.title = "Add marker";
        const button = L.DomUtil.create(
          "button",
          "pi pi-thumbtack bg-white p-1 border-gray-400 border-1 w-8 h-8 cursor-pointer",
          container
        );
        buttonRef.current = button;

        L.DomEvent.on(
          button,
          "click",
          (e) => {
            if (lastMapModeRef.current === MapModes.ADD_MARKER) {
              switchBtnOnEndEdit();
              if (onClickEndAddMarkerRef.current) {
                onClickEndAddMarkerRef.current();
              }
            } else {
              switchBtnOnStartEdit();
              if (onClickStartAddMarkerRef.current) {
                onClickStartAddMarkerRef.current();
              }
            }
          },
          this
        );

        return container;
      },
    });

    const control = new MapAddMarkerControl();
    map.addControl(control);
    return () => {
      map.removeControl(control);
    };
  }, [map]);

  /**
   * Updates the "map mode" in the reference.
   */
  useEffect(() => {
    /**
     * If the previous map mode was "ADD MARKER", and that is not the case anymore,
     * resets the state of the variables and buttons.
     */
    if (
      lastMapModeRef.current === MapModes.ADD_MARKER &&
      mapMode !== MapModes.ADD_MARKER
    ) {
      switchBtnOnEndEdit();
    }

    /**
     * Updates the visibility of the control depending on the map mode.
     */
    if (mapMode === MapModes.VIEW || mapMode === MapModes.ADD_MARKER) {
      if (containerRef.current) {
        containerRef.current.style.visibility = "visible";
      }
    } else {
      if (containerRef.current) {
        containerRef.current.style.visibility = "hidden";
      }
    }

    // Updates the reference of the last "map mode" encountered when running this "useEffect" code.
    lastMapModeRef.current = mapMode;
  }, [mapMode]);

  return null;
};
