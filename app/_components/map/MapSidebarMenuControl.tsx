"use client";

import L, { Control, DomEvent, DomUtil, Map } from "leaflet";
import { useEffect } from "react";

interface MapSidebarMenuControlProps {
  map: L.Map | null;
  onClickOpenSideMenu: () => void;
}

export const MapSidebarMenuControl = ({
  map,
  onClickOpenSideMenu,
}: MapSidebarMenuControlProps) => {
  const MapSidebarMenuControl = Control.extend({
    options: {
      position: "topleft",
    },
    onAdd: function () {
      const el = DomUtil.create("div");
      const button = DomUtil.create(
        "button",
        "pi pi-bars bg-white p-1 border-gray-400 border-1 w-8 h-8 cursor-pointer",
        el
      );

      DomEvent.on(button, "click", onClickOpenSideMenu, this);

      el.className = "relative";

      el.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
      });

      return el;
    },
    onRemove: function (map: Map) {
      return;
    },
  });

  const control = new MapSidebarMenuControl();

  useEffect(() => {
    map?.addControl(control);

    return () => {
      map?.removeControl(control);
    };
  }, []);

  return null;
};
