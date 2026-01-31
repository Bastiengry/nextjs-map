import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CircuitSelectionContextMenu from "./CircuitSelectionContextMenu";
import { MapContainer, __resetMocks } from "@/__mocks__/react-leaflet";

describe("CircuitSelectionContextMenu component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetMocks();
  });

  test("should display well", async () => {
    render(
      <MapContainer>
        <CircuitSelectionContextMenu
          x={100}
          y={100}
          onClose={() => {}}
          onClickEditCircuit={() => {}}
          onClickDeleteCircuit={() => {}}
          onClickAddPointToCircuit={() => {}}
        />
      </MapContainer>,
    );

    // Gets the contextual menu.
    const contextMenu = await screen.findByLabelText(
      "circuit-selection-context-menu",
    );

    // Checks the presence of the menu to add a point to the circuit.
    const liAddPoint = within(contextMenu).getByLabelText(
      "circuit-selection-context-menu-li-add-point",
    );
    expect(liAddPoint).toHaveTextContent("circuit.addPoint");

    // Checks the presence of the menu to edit the circuit configuration.
    const liEditCircuitConf = within(contextMenu).getByLabelText(
      "circuit-selection-context-menu-li-edit-circuit-conf",
    );
    expect(liEditCircuitConf).toHaveTextContent(
      "circuit.editCircuitConfiguration",
    );

    // Checks the presence of the menu to delete a circuit.
    const liDeleteCircuit = within(contextMenu).getByLabelText(
      "circuit-selection-context-menu-li-delete-circuit",
    );
    expect(liDeleteCircuit).toHaveTextContent("circuit.deleteCircuit");
  });

  test("should succeed to call the callback to add a point to the circuit", async () => {
    const mockOnClickAddPointToCircuit = jest.fn();
    const mockOnClose = jest.fn();
    const user = userEvent.setup();

    render(
      <MapContainer>
        <CircuitSelectionContextMenu
          x={100}
          y={100}
          onClose={mockOnClose}
          onClickEditCircuit={() => {}}
          onClickDeleteCircuit={() => {}}
          onClickAddPointToCircuit={mockOnClickAddPointToCircuit}
        />
      </MapContainer>,
    );

    // Gets the contextual menu.
    const contextMenu = await screen.findByLabelText(
      "circuit-selection-context-menu",
    );

    // Gets the menu to add a point to the circuit.
    const liAddPoint = within(contextMenu).getByLabelText(
      "circuit-selection-context-menu-li-add-point",
    );
    expect(liAddPoint).toHaveTextContent("circuit.addPoint");

    // Clicks on the menu to add a point to the circuit.
    await user.click(liAddPoint);

    // Checks the callbacks.
    expect(mockOnClickAddPointToCircuit).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("should succeed to call the callback to edit the circuit", async () => {
    const mockOnEditCircuit = jest.fn();
    const mockOnClose = jest.fn();
    const user = userEvent.setup();

    render(
      <MapContainer>
        <CircuitSelectionContextMenu
          x={100}
          y={100}
          onClose={mockOnClose}
          onClickEditCircuit={mockOnEditCircuit}
          onClickDeleteCircuit={() => {}}
          onClickAddPointToCircuit={() => {}}
        />
      </MapContainer>,
    );

    // Gets the contextual menu.
    const contextMenu = await screen.findByLabelText(
      "circuit-selection-context-menu",
    );

    // Gets the menu to edit the circuit.
    const liEditCircuit = within(contextMenu).getByLabelText(
      "circuit-selection-context-menu-li-edit-circuit-conf",
    );
    expect(liEditCircuit).toHaveTextContent("circuit.editCircuitConfiguration");

    // Clicks on the menu to edit the circuit.
    await user.click(liEditCircuit);

    // Checks the callbacks.
    expect(mockOnEditCircuit).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("should succeed to call the callback to edit the circuit", async () => {
    const mockOnDeleteCircuit = jest.fn();
    const mockOnClose = jest.fn();
    const user = userEvent.setup();

    render(
      <MapContainer>
        <CircuitSelectionContextMenu
          x={100}
          y={100}
          onClose={mockOnClose}
          onClickEditCircuit={() => {}}
          onClickDeleteCircuit={mockOnDeleteCircuit}
          onClickAddPointToCircuit={() => {}}
        />
      </MapContainer>,
    );

    // Gets the contextual menu.
    const contextMenu = await screen.findByLabelText(
      "circuit-selection-context-menu",
    );

    // Gets the menu to delete the circuit.
    const liDeleteCircuit = within(contextMenu).getByLabelText(
      "circuit-selection-context-menu-li-delete-circuit",
    );
    expect(liDeleteCircuit).toHaveTextContent("circuit.deleteCircuit");

    // Clicks on the menu to delete the circuit.
    await user.click(liDeleteCircuit);

    // Checks the callbacks.
    expect(mockOnDeleteCircuit).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
