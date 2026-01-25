"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

/**
 * Component properties.
 *
 * onClickOpenSideMenu : callback to open the sidebar.
 */
interface MapSidebarMenuControlProps {
  onClickOpenSideMenu: () => void;
}

/**
 * Leaflet control to open the sidebar.
 *
 * The control is only updated if the map changes.
 *
 * But the callback, coming from the parent component, can change.
 * References to this element is stored as the value of a "useRef" with "myRef.current".
 * When the elements change, the "myRef.current" is updated with the new function pointer.
 *
 * @param param0 parameters needed for the "SIDEBAR" function.
 *
 * @returns null.
 */
export const MapSidebarMenuControl = ({
  onClickOpenSideMenu,
}: MapSidebarMenuControlProps) => {
  /**
   * Stabilizes the callback.
   *
   * Stores the callback as a VALUE in a reference.
   *
   * In the rest of the code, we will call "myRef.current", which is always at the same address, even
   * if the callbacks change (the callbacks are the "values" of the references).
   */
  const onClickOpenSideMenuRef = useRef<() => void>(undefined);

  /**
   * Stabilizes the callback to open the sidebar.
   */
  useEffect(() => {
    onClickOpenSideMenuRef.current = onClickOpenSideMenu;
  }, [onClickOpenSideMenu]);

  /**
   * Gets the map.
   */
  const map = useMap();

  /**
   * Creates and manages the control.
   */
  useEffect(() => {
    const MapSidebarMenuControl = L.Control.extend({
      options: {
        position: "topleft",
      },
      onAdd: function () {
        const container = L.DomUtil.create("div");
        container.ariaLabel = "sidebar-menu-control";

        const button = L.DomUtil.create(
          "button",
          "pi pi-bars bg-white p-1 border-gray-400 border-1 w-8 h-8 cursor-pointer",
          container,
        );
        button.ariaLabel = "sidebar-menu-control-button";

        L.DomEvent.disableClickPropagation(container);

        if (onClickOpenSideMenuRef.current) {
          L.DomEvent.on(
            button,
            "click",
            () => {
              onClickOpenSideMenuRef.current?.();
            },
            this,
          );
        }

        return container;
      },
    });

    const control = new MapSidebarMenuControl();

    map.addControl(control);
    return () => {
      map.removeControl(control);
    };
  }, [map]);

  return null;
};
