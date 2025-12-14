interface CircuitSelectionContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onClickEditCircuit: () => void;
  onClickDeleteCircuit: () => void;
}

const CircuitSelectionContextMenu = ({
  x,
  y,
  onClose,
  onClickEditCircuit,
  onClickDeleteCircuit,
}: CircuitSelectionContextMenuProps) => {
  return (
    <div
      className="custom-context-menu"
      style={{ top: y, left: x, position: "fixed", zIndex: 1000 }}
      onMouseLeave={onClose} // Ferme le menu si la souris sort
    >
      <ul
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
          Modifier la configuration du circuit
        </li>
        <li
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
          🗑️ Supprimer le circuit
        </li>
      </ul>
    </div>
  );
};

export default CircuitSelectionContextMenu;
