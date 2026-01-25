"use client";

import L from "leaflet";
import { useCallback, useEffect, useRef } from "react";
import "leaflet-draw/dist/leaflet.draw-src.js";
import { useMapEvents } from "react-leaflet";
import { GeometryLineString } from "../../types/Geometry";
import {
  addLatLngsToLineString,
  latLngsToLineString,
} from "../../util/geomUtils";
import MapModes from "../../types/MapMode";

/**
 * Component properties.
 *
 * mapMode : current map mode ("ADD_POLYLINE", "VIEW"...)
 * onClickStartAddPolyline : callback when the user clicks on the button to start to add a polyline.
 * onClickDrawPolyline : callback when the user clicks on the map to draw a polyline.
 * onClickValidateAddPolyline : callback when the user clicks on the button to validate at the end of the drawing of the polyline.
 * onClickCancelAddPolyline : callback when the user clicks on the button to cancel at the end of the drawing of the polyline.
 */
interface MapAddPolylineControlProps {
  mapMode: string | undefined;
  onClickStartAddPolyline: () => void;
  onClickDrawPolyline: (polyline: GeometryLineString) => void;
  onClickValidateAddPolyline: (polyline: GeometryLineString) => void;
  onClickCancelAddPolyline: () => void;
}

/**
 * Leaflet control to add polylines on the map.
 *
 * The control is only updated if the map changes.
 *
 * But the "map mode" and the "callbacks", coming from the parent component, can change.
 * References to these elements are stored as the values of some "useRef" with "myRef.current".
 * When the elements change, the "myRef.current" is updated with the new value/callback pointer.
 *
 * @param param0 parameters needed for the "ADD POLYLINE" function.
 *
 * @returns null.
 */
export const MapAddPolylineControl = ({
  mapMode,
  onClickStartAddPolyline,
  onClickDrawPolyline,
  onClickValidateAddPolyline,
  onClickCancelAddPolyline,
}: MapAddPolylineControlProps) => {
  /**
   * Stabilizes the map mode.
   */
  const lastMapModeRef = useRef<string>(undefined);

  /**
   * Stabilizes the polyline which is currently drawn.
   */
  const polyline = useRef<GeometryLineString>(undefined);

  /**
   * Stabilizes the buttons of the control to be able to access to them out of the useEffect where they are created.
   */
  const containerRef = useRef<HTMLDivElement>(undefined);
  const buttonStartRef = useRef<HTMLButtonElement>(undefined);
  const buttonValidateRef = useRef<HTMLButtonElement>(undefined);
  const buttonCancelRef = useRef<HTMLButtonElement>(undefined);

  /**
   * Stabilizes the callbacks.
   *
   * Stores the callbacks as a VALUE in a reference.
   *
   * In the rest of the code, we will call "myRef.current", which is always at the same address, even
   * if the callbacks change (the callbacks are the "values" of the references).
   */
  const onClickStartAddPolylineRef = useRef<() => void>(undefined);
  const onClickDrawPolylineRef =
    useRef<(polyline: GeometryLineString) => void>(undefined);
  const onClickValidateAddPolylineRef =
    useRef<(polyline: GeometryLineString) => void>(undefined);
  const onClickCancelAddPolylineRef = useRef<() => void>(undefined);

  /**
   * Stabilizes the callback to start the "Add polyline" process.
   */
  useEffect(() => {
    onClickStartAddPolylineRef.current = onClickStartAddPolyline;
  }, [onClickStartAddPolyline]);

  /**
   * Stabilizes the callback to draw the polyline on the map.
   */
  useEffect(() => {
    onClickDrawPolylineRef.current = onClickDrawPolyline;
  }, [onClickDrawPolyline]);

  /**
   * Stabilizes the callback to validate the drawing of the polyline on the map.
   */
  useEffect(() => {
    onClickValidateAddPolylineRef.current = onClickValidateAddPolyline;
  }, [onClickValidateAddPolyline]);

  /**
   * Stabilizes the callback to cancel the drawing of the polyline on the map.
   */
  useEffect(() => {
    onClickCancelAddPolylineRef.current = onClickCancelAddPolyline;
  }, [onClickCancelAddPolyline]);

  /**
   * Manages the map events.
   */
  const map = useMapEvents({
    click(e: L.LeafletMouseEvent) {
      if (lastMapModeRef.current === MapModes.ADD_POLYLINE) {
        if (!polyline.current) {
          polyline.current = latLngsToLineString([e.latlng]);
        } else {
          polyline.current = addLatLngsToLineString(polyline.current, [
            e.latlng,
          ]);
        }
        if (onClickDrawPolylineRef.current) {
          onClickDrawPolylineRef.current(polyline.current);
        }
      }
    },
  });

  /**
   * Changes the buttons to their appearance when the drawing is started.
   */
  const switchBtnOnStartEdit = useCallback(() => {
    if (buttonStartRef.current) {
      buttonStartRef.current.disabled = true;
      buttonStartRef.current.style.color = "#999999";
    }
    if (buttonValidateRef.current) {
      buttonValidateRef.current.style.display = "inline-block";
    }
    if (buttonCancelRef.current) {
      buttonCancelRef.current.style.display = "inline-block";
    }
  }, []);

  /**
   * Changes the buttons to their appearance when the drawing is terminated.
   */
  const switchBtnOnEndEdit = useCallback(() => {
    if (buttonStartRef.current) {
      buttonStartRef.current.disabled = false;
      buttonStartRef.current.style.color = "#000000";
    }
    if (buttonValidateRef.current) {
      buttonValidateRef.current.style.display = "none";
    }
    if (buttonCancelRef.current) {
      buttonCancelRef.current.style.display = "none";
    }
  }, []);

  /**
   * Creates and manages the control.
   */
  useEffect(() => {
    const MapAddPolylineControl = L.Control.extend({
      onAdd: function () {
        const container = L.DomUtil.create("div", "bg-green flex flex-row");
        container.ariaLabel = "add-polyline-control";
        containerRef.current = container;

        L.DomEvent.disableClickPropagation(container);

        const buttonStart = L.DomUtil.create(
          "button",
          "pi pi-pen-to-square bg-white border-gray-400 border-1 w-8 h-8 cursor-pointer",
          container,
        );
        buttonStart.ariaLabel = "add-polyline-control-button-start";
        buttonStartRef.current = buttonStart;
        buttonStart.title = "Draw shape";
        buttonStart.style.display = "inline-block";
        buttonStart.style.color = "#000000";

        const buttonValidate = L.DomUtil.create(
          "button",
          "pi pi-check bg-white text-green-600 border-gray-400 border-1 w-8 h-8 cursor-pointer",
          container,
        );
        buttonValidate.ariaLabel = "add-polyline-control-button-validate";
        buttonValidateRef.current = buttonValidate;
        buttonValidate.title = "Validate shape";
        buttonValidate.style.display = "none";

        const buttonCancel = L.DomUtil.create(
          "button",
          "pi pi-times bg-white text-red-600 border-gray-400 border-1 w-8 h-8 cursor-pointer",
          container,
        );
        buttonCancel.ariaLabel = "add-polyline-control-button-cancel";
        buttonCancelRef.current = buttonCancel;
        buttonCancel.title = "Cancel shape";
        buttonCancel.style.display = "none";

        L.DomEvent.on(
          buttonStart,
          "click",
          (e) => {
            if (lastMapModeRef.current !== MapModes.ADD_POLYLINE) {
              switchBtnOnStartEdit();
              if (onClickStartAddPolylineRef.current) {
                onClickStartAddPolyline();
              }
            }
          },
          this,
        );

        L.DomEvent.on(
          buttonValidate,
          "click",
          (e) => {
            if (lastMapModeRef.current === MapModes.ADD_POLYLINE) {
              const newPolyline = polyline.current;
              polyline.current = undefined;
              switchBtnOnEndEdit();
              if (newPolyline) {
                if (onClickValidateAddPolylineRef.current) {
                  onClickValidateAddPolylineRef.current(newPolyline);
                }
              } else {
                if (onClickCancelAddPolylineRef.current) {
                  onClickCancelAddPolylineRef.current();
                }
              }
            }
          },
          this,
        );

        L.DomEvent.on(
          buttonCancel,
          "click",
          (e) => {
            if (lastMapModeRef.current === MapModes.ADD_POLYLINE) {
              polyline.current = undefined;
              switchBtnOnEndEdit();
              if (onClickCancelAddPolylineRef.current) {
                onClickCancelAddPolylineRef.current();
              }
            }
          },
          this,
        );

        return container;
      },
    });

    const control = new MapAddPolylineControl();
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
     * If the previous map mode was "ADD POLYLINE", and that is not the case anymore,
     * resets the state of the variables and buttons.
     */
    if (
      lastMapModeRef.current === MapModes.ADD_POLYLINE &&
      mapMode !== MapModes.ADD_POLYLINE
    ) {
      polyline.current = undefined;
      switchBtnOnEndEdit();
    }

    /**
     * Updates the visibility of the control depending on the map mode.
     */
    if (mapMode === MapModes.VIEW || mapMode === MapModes.ADD_POLYLINE) {
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
