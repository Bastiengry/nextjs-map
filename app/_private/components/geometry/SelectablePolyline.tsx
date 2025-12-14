import { useMemo } from "react";
import { Polyline } from "react-leaflet";

// Types pour la clarté
interface PathProps {
  id: string;
  positions: [number, number][];
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const SelectablePolyline = ({
  id,
  positions,
  isSelected,
  onSelect,
}: PathProps) => {
  // 1. Stabiliser l'événement de clic
  const eventHandlers = useMemo(
    () => ({
      click: () => onSelect(id),
    }),
    [id, onSelect]
  );

  // 2. Définir le style dynamiquement
  const pathOptions = useMemo(
    () => ({
      color: isSelected ? "#ff4757" : "#3742fa", // Rouge si sélectionné, bleu sinon
      weight: isSelected ? 6 : 3, // Plus épais si sélectionné
      opacity: isSelected ? 1 : 0.6,
    }),
    [isSelected]
  );

  return (
    <>
      {/* Ligne invisible large pour faciliter le clic */}
      <Polyline
        positions={positions}
        pathOptions={{ color: "transparent", weight: 20 }}
        eventHandlers={eventHandlers}
      />
      {/* Ligne visible réelle */}
      <Polyline
        positions={positions}
        pathOptions={pathOptions}
        interactive={false} // Le clic passe à travers vers la ligne invisible
      />
    </>
  );
};

export { SelectablePolyline };
