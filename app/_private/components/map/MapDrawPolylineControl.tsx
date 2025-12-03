"use client";

import L, { DomEvent, DomUtil, LatLng, LeafletMouseEvent } from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet-draw/dist/leaflet.draw-src.js";
import { useMapEvents } from "react-leaflet";
import EditModeTypes from "../../types/EditModeTypes";
import { GeometryLineString } from "../../types/Geometry";
import {
  addLatLngsToLineString,
  latLngsToLineString,
} from "../../util/geomUtils";

interface MapDrawPolylineControlProps {
  editMode: string | undefined;
  setEditMode: (mode: string) => void;
  onDrawPolyline: (polyline: GeometryLineString) => void;
  onValidateAddPolyline: (polyline: GeometryLineString) => void;
  onCancelAddPolyline: (polyline: GeometryLineString) => void;
}

export const MapDrawPolylineControl = ({
  editMode,
  setEditMode,
  onDrawPolyline,
  onValidateAddPolyline,
  onCancelAddPolyline,
}: MapDrawPolylineControlProps) => {
  const controlRef = useRef<L.Control>(undefined);
  const buttonStartEditRef = useRef<HTMLButtonElement>(undefined);
  const buttonValidateEditRef = useRef<HTMLButtonElement>(undefined);
  const buttonCancelEditRef = useRef<HTMLButtonElement>(undefined);
  const lastEditModeRef = useRef<string>(undefined);
  const polyline = useRef<GeometryLineString>(undefined);

  const map = useMapEvents({
    click(e: LeafletMouseEvent) {
      if (editMode === EditModeTypes.EDIT_MAP_DRAW_POLYLINE) {
        if (!polyline.current) {
          polyline.current = latLngsToLineString([e.latlng]);
        } else {
          polyline.current = addLatLngsToLineString(polyline.current, [
            e.latlng,
          ]);
        }
        onDrawPolyline(polyline.current);
      }
    },
  });

  useEffect(() => {
    const MapDrawPolylineControl = L.Control.extend({
      onAdd: function () {
        const el = DomUtil.create("div", "bg-green flex flex-row");
        buttonStartEditRef.current = DomUtil.create(
          "button",
          "pi pi-pen-to-square bg-white border-gray-400 border-1 w-8 h-8 cursor-pointer",
          el
        );
        buttonStartEditRef.current.title = "Draw circuit";
        buttonStartEditRef.current.style.display = "inline-block";
        buttonStartEditRef.current.style.color = "#000000";

        buttonValidateEditRef.current = DomUtil.create(
          "button",
          "pi pi-check bg-white text-green-600 border-gray-400 border-1 w-8 h-8 cursor-pointer",
          el
        );
        buttonValidateEditRef.current.title = "Validate edition";
        buttonValidateEditRef.current.style.display = "none";

        buttonCancelEditRef.current = DomUtil.create(
          "button",
          "pi pi-times bg-white text-red-600 border-gray-400 border-1 w-8 h-8 cursor-pointer",
          el
        );
        buttonCancelEditRef.current.title = "Cancel edition";
        buttonCancelEditRef.current.style.display = "none";

        DomEvent.on(
          buttonStartEditRef.current,
          "click",
          (e) => {
            if (
              lastEditModeRef.current !== EditModeTypes.EDIT_MAP_DRAW_POLYLINE
            ) {
              if (buttonStartEditRef.current) {
                buttonStartEditRef.current.disabled = true;
                buttonStartEditRef.current.style.color = "#999999";
              }
              if (buttonValidateEditRef.current)
                buttonValidateEditRef.current.style.display = "inline-block";
              if (buttonCancelEditRef.current)
                buttonCancelEditRef.current.style.display = "inline-block";
              setEditMode(EditModeTypes.EDIT_MAP_DRAW_POLYLINE);
            }
          },
          this
        );

        DomEvent.on(
          buttonValidateEditRef.current,
          "click",
          (e) => {
            if (
              lastEditModeRef.current === EditModeTypes.EDIT_MAP_DRAW_POLYLINE
            ) {
              if (polyline.current) {
                onValidateAddPolyline(polyline.current);
              }
              polyline.current = undefined;
              if (buttonStartEditRef.current) {
                buttonStartEditRef.current.disabled = false;
                buttonStartEditRef.current.style.color = "#000000";
              }
              if (buttonValidateEditRef.current)
                buttonValidateEditRef.current.style.display = "none";
              if (buttonCancelEditRef.current)
                buttonCancelEditRef.current.style.display = "none";
              setEditMode(EditModeTypes.VIEW);
            }
          },
          this
        );

        DomEvent.on(
          buttonCancelEditRef.current,
          "click",
          (e) => {
            if (
              lastEditModeRef.current === EditModeTypes.EDIT_MAP_DRAW_POLYLINE
            ) {
              if (polyline.current) {
                onCancelAddPolyline(polyline.current);
              }
              polyline.current = undefined;
              if (buttonStartEditRef.current) {
                buttonStartEditRef.current.disabled = false;
                buttonStartEditRef.current.style.color = "#000000";
              }
              if (buttonValidateEditRef.current)
                buttonValidateEditRef.current.style.display = "none";
              if (buttonCancelEditRef.current)
                buttonCancelEditRef.current.style.display = "none";
              setEditMode(EditModeTypes.VIEW);
            }
          },
          this
        );

        el.addEventListener("click", (e) => {
          e.stopPropagation();
        });

        el.addEventListener("dblclick", (e) => {
          e.stopPropagation();
        });

        return el;
      },
    });

    controlRef.current = new MapDrawPolylineControl();
    map.addControl(controlRef.current);

    return () => {
      !!controlRef.current && map.removeControl(controlRef.current);
    };
  }, [
    map,
    setEditMode,
    onDrawPolyline,
    onValidateAddPolyline,
    onCancelAddPolyline,
  ]);

  useEffect(() => {
    lastEditModeRef.current = editMode;
  }, [editMode]);

  return null;
};
