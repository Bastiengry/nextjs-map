"use client";

import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete";
import { Control, DomUtil, Map } from "leaflet";
import { useEffect } from "react";

interface MapAddressSearchControlProps {
  map: L.Map | null;
}

export const MapAddressSearchControl = ({
  map,
}: MapAddressSearchControlProps) => {
  const SearchControl = Control.extend({
    options: {
      position: "topright",
    },
    onAdd: function () {
      const el = DomUtil.create("div");

      el.className = "relative";

      el.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
      });
      console.log("key", process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY);
      const autocomplete = new GeocoderAutocomplete(
        el,
        process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "",
        {
          placeholder: "Enter an address",
        }
      );

      autocomplete.on("select", (location) => {
        const { lat, lon } = location.properties;
        map?.setView({ lat, lng: lon }, map?.getZoom());
      });

      return el;
    },
    onRemove: function (map: Map) {
      return;
    },
  });

  const searchControl = new SearchControl();

  useEffect(() => {
    map?.addControl(searchControl);
  }, []);

  return null;
};
