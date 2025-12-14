"use client";

import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete";
import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapAddressSearchControlProps {}

export const MapAddressSearchControl = ({}: MapAddressSearchControlProps) => {
  const map = useMap();

  const SearchControl = L.Control.extend({
    options: {
      position: "topright",
    },
    onAdd: function () {
      const el = L.DomUtil.create("div");

      el.className = "relative";

      el.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
      });

      const autocomplete = new GeocoderAutocomplete(
        el,
        process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "",
        {
          placeholder: "Enter an address",
        }
      );

      autocomplete.on("select", (location) => {
        const { lat, lon } = location.properties;
        map.flyTo({ lat: lat, lng: lon });
      });

      return el;
    },
    onRemove: function (map: L.Map) {
      return;
    },
  });

  useEffect(() => {
    const control = new SearchControl();
    map.addControl(control);
    return () => {
      map.removeControl(control);
    };
  }, []);

  return null;
};
