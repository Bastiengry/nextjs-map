import { useTranslation } from "react-i18next";

interface CircuitSelectionContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onClickEditCircuit: () => void;
  onClickDeleteCircuit: () => void;
  onClickAddPointToCircuit: () => void;
}

const CircuitSelectionContextMenu = ({
  x,
  y,
  onClose,
  onClickEditCircuit,
  onClickDeleteCircuit,
  onClickAddPointToCircuit,
}: CircuitSelectionContextMenuProps) => {
  const { t } = useTranslation();

  return (
    <div
      aria-label="circuit-selection-context-menu"
      className="custom-context-menu"
      style={{ top: y, left: x, position: "fixed", zIndex: 1000 }}
      onMouseLeave={onClose} // Closes the menu if the mouse gets out
    >
      <ul
        aria-label="circuit-selection-context-menu-ul"
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
          aria-label="circuit-selection-context-menu-li-add-point"
          onClick={(e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            onClickAddPointToCircuit();
            onClose();
          }}
          style={{
            padding: "4px 4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ➕ {t("circuit.addPoint")}
        </li>
        <li
          aria-label="circuit-selection-context-menu-li-edit-circuit-conf"
          onClick={(e) => {
            e.stopPropagation();
            onClickEditCircuit();
            onClose();
          }}
          style={{
            padding: "4px 4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ⚙️ {t("circuit.editCircuitConfiguration")}
        </li>
        <li
          aria-label="circuit-selection-context-menu-li-delete-circuit"
          onClick={(e) => {
            e.stopPropagation();
            onClickDeleteCircuit();
            onClose();
          }}
          style={{
            padding: "4px 4px",
            cursor: "pointer",
            color: "red",
            fontWeight: "bold",
          }}
        >
          🗑️ {t("circuit.deleteCircuit")}
        </li>
      </ul>
    </div>
  );
};

export default CircuitSelectionContextMenu;
