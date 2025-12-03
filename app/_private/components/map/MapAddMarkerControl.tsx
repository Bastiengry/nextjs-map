"use client";

import L, { LatLng, LeafletMouseEvent } from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet-draw/dist/leaflet.draw-src.js";
import EditModeTypes from "../../types/EditModeTypes";
import { useMap, useMapEvents } from "react-leaflet";

interface MapAddMarkerControlProps {
  editMode: string | undefined;
  setEditMode: (mode: string) => void;
  onAddMarker: (coord: LatLng) => void;
}

export const MapAddMarkerControl = ({
  editMode,
  setEditMode,
  onAddMarker,
}: MapAddMarkerControlProps) => {
  const controlRef = useRef<L.Control>(undefined);
  const buttonRef = useRef<HTMLButtonElement>(undefined);
  const lastEditModeRef = useRef<string>(undefined);

  const map = useMap();

  useMapEvents({
    click(e: LeafletMouseEvent) {
      if (editMode === EditModeTypes.EDIT_MAP_MARKER) {
        onAddMarker(e.latlng);
      }
    },
  });

  useEffect(() => {
    const MapAddMarkerControl = L.Control.extend({
      onAdd: function () {
        const el = L.DomUtil.create("div");
        el.title = "Add marker";
        buttonRef.current = L.DomUtil.create(
          "button",
          "pi pi-thumbtack bg-white p-1 border-gray-400 border-1 w-8 h-8 cursor-pointer",
          el
        );

        L.DomEvent.on(
          buttonRef.current,
          "click",
          (e) => {
            if (lastEditModeRef.current === EditModeTypes.EDIT_MAP_MARKER) {
              setEditMode(EditModeTypes.VIEW);
              if (buttonRef.current) {
                buttonRef.current.style.background = "";
              }
            } else {
              setEditMode(EditModeTypes.EDIT_MAP_MARKER);
              if (buttonRef.current) {
                buttonRef.current.style.background = "red";
              }
            }
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
    });

    controlRef.current = new MapAddMarkerControl();
    map.addControl(controlRef.current);
    return () => {
      !!controlRef.current && map.removeControl(controlRef.current);
    };
  }, [map, setEditMode]);

  useEffect(() => {
    lastEditModeRef.current = editMode;
  }, [editMode]);

  return null;
};
