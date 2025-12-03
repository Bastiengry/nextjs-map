"use client";

import dynamic from "next/dynamic";
import { MapProps } from "./Map";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

interface MapWrapperProps {
  mapProps: MapProps;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <Map {...props.mapProps} />;
}
