"use client";

import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import MapModes from "../../types/MapMode";
import { useTranslation } from "react-i18next";

/**
 * Component properties.
 *
 * mapMode : current map mode ("VIEW", ...)
 */
interface MapAddressSearchControlProps {
  mapMode: string | undefined;
}

/**
 * Leaflet control to search for an address.
 *
 * The control is only updated if the map changes.
 *
 * But the "map mode", coming from the parent component, can change.
 * References to this element is stored as the value of a "useRef" with "myRef.current".
 * When the elements change, the "myRef.current" is updated with the new value.
 *
 * @param param0 parameters needed for the "ADDRESS SEARCH" function.
 *
 * @returns null.
 */
export const MapAddressSearchControl = ({
  mapMode,
}: MapAddressSearchControlProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(undefined);

  /** Gets the map. */
  const map = useMap();

  /**
   * Creates and manages the control.
   */
  useEffect(() => {
    const SearchControl = L.Control.extend({
      options: {
        position: "topright",
      },
      onAdd: function () {
        const container = L.DomUtil.create("div");
        container.ariaLabel = "address-search-control";
        containerRef.current = container;

        L.DomEvent.disableClickPropagation(container);

        const autocomplete = new GeocoderAutocomplete(
          container,
          process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "",
          {
            placeholder: t("map.control.addressSearch.inputSearch.placeholder"),
          },
        );
        container.ariaLabel = "address-search-control-input";

        autocomplete.on("select", (location) => {
          const { lat, lon } = location.properties;
          map.flyTo({ lat: lat, lng: lon });
        });

        return container;
      },
    });

    const control = new SearchControl();
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
