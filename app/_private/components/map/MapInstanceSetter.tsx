import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * Properties for MapInstanceSetter component.
 */
interface MapInstanceSetterProps {
  onReady: (map: L.Map) => void;
}
/**
 * Component to be able to capture the map instance in "Map" component.
 * @param param0 properties.
 * @returns null.
 */
export default function MapInstanceSetter({ onReady }: MapInstanceSetterProps) {
  // Gets the map.
  const map = useMap();

  // Calls the "onReady" callback when the map instance is loaded or changes.
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  return null;
}
