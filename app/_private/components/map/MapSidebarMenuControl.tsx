"use client";

import L from "leaflet";
import { useLeafletContext } from "@react-leaflet/core";
import { useEffect } from "react";

interface MapSidebarMenuControlProps {
  onClickOpenSideMenu: () => void;
}

export const MapSidebarMenuControl = ({
  onClickOpenSideMenu,
}: MapSidebarMenuControlProps) => {
  const context = useLeafletContext();

  const MapSidebarMenuControl = L.Control.extend({
    options: {
      position: "topleft",
    },
    onAdd: function () {
      const el = L.DomUtil.create("div");
      const button = L.DomUtil.create(
        "button",
        "pi pi-bars bg-white p-1 border-gray-400 border-1 w-8 h-8 cursor-pointer",
        el
      );

      L.DomEvent.on(button, "click", onClickOpenSideMenu, this);

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
    const control = new MapSidebarMenuControl();
    container.addControl(control);
    return () => {
      container.removeControl(control);
    };
  }, []);

  return null;
};
