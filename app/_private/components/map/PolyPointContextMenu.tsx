import { useTranslation } from "react-i18next";

interface PolyPointContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
}

export const PolyPointContextMenu = ({
  x,
  y,
  onClose,
  onDelete,
}: PolyPointContextMenuProps) => {
  const { t } = useTranslation();

  return (
    <div
      aria-label="poly-point-context-menu"
      style={{ top: y, left: x, position: "fixed", zIndex: 1100 }}
      onMouseLeave={onClose}
    >
      <ul
        aria-label="poly-point-context-menu-ul"
        style={{
          listStyle: "none",
          margin: 0,
          padding: "4px",
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        <li
          aria-label="poly-point-context-menu-delete-point"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            onClose();
          }}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            color: "#d32f2f",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          🗑️ {t("circuit.deletePoint")}
        </li>
      </ul>
    </div>
  );
};
