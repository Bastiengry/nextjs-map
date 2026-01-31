import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import CircuitLayer from "./CircuitLayer";
import MapModes from "../../types/MapMode";
import { ProjectCircuit } from "../../types/Project";
import userEvent from "@testing-library/user-event";
import { MapContainer } from "@/__mocks__/react-leaflet";

describe("CircuitLayer component", () => {
  test("should display well", () => {
    const mockCircuits: ProjectCircuit[] = [
      {
        id: 1,
        color: "#990055",
        label: "Circuit 1",
        geometry: {
          type: "LineString",
          coordinates: [
            [2, 48],
            [3, 49],
          ],
        },
      },
      {
        id: 2,
        color: "#DDEEBB",
        label: "Circuit 2",
        geometry: {
          type: "LineString",
          coordinates: [
            [1, 44],
            [1.45, 45.3],
          ],
        },
      },
    ];

    render(
      <CircuitLayer
        mapMode={MapModes.VIEW}
        circuits={mockCircuits}
        selectedId={1}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onAddPointToCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onDeletePointFromCircuit={() => {}}
      />,
    );

    // Checks the presence of the REAL polyline of the circuit 1.
    screen.findByLabelText("real-polyline-circuit-1");

    // Checks the presence of the VIRTUAL polyline of the circuit 1.
    screen.getByLabelText("virtual-polyline-circuit-1");

    // Checks the presence of the points of the circuit 1 (BECAUSE SELECTED).
    screen.getAllByLabelText("points-circuit-1");

    // Checks the presence of the REAL polyline of the circuit 2.
    screen.getByLabelText("real-polyline-circuit-2");

    // Checks the presence of the VIRTUAL polyline of the circuit 2.
    screen.getByLabelText("virtual-polyline-circuit-2");

    // Checks the absence of the points of the circuit 2 (BECAUSE NOT SELECTED).
    expect(screen.queryAllByLabelText("points-circuit-2")).toStrictEqual([]);

    // Check the absence of the context menu for the selected circuit.
    expect(
      screen.queryByLabelText("circuit-selection-context-menu"),
    ).not.toBeInTheDocument();

    // Check the absence of the context menu for the hovered point of the selected circuit.
    expect(
      screen.queryByLabelText("poly-point-context-menu"),
    ).not.toBeInTheDocument();
  });

  test("should call the callback of selection of a circuit when a circuit is NOT selected", async () => {
    const user = userEvent.setup();

    const mockCircuits: ProjectCircuit[] = [
      {
        id: 1,
        color: "#990055",
        label: "Circuit 1",
        geometry: {
          type: "LineString",
          coordinates: [
            [2, 48],
            [3, 49],
          ],
        },
      },
    ];

    const mockOnSelect = jest.fn();

    render(
      <MapContainer>
        <CircuitLayer
          mapMode={MapModes.VIEW}
          circuits={mockCircuits}
          selectedId={null}
          onSelect={mockOnSelect}
          onEdit={() => {}}
          onDelete={() => {}}
          onAddPointToCircuit={() => {}}
          onUpdateCircuitGeometry={() => {}}
          onDeletePointFromCircuit={() => {}}
        />
      </MapContainer>,
    );

    // Checks the presence of the VIRTUAL polyline of the circuit 1.
    const virtualPoly = await screen.findByLabelText(
      "virtual-polyline-circuit-1",
    );

    // Clicks on the polyline to select it.
    await user.click(virtualPoly);

    // Checks the call of the callback.
    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });

  test("should call the callback of selection of a circuit when a circuit is ALRADY selected", async () => {
    const user = userEvent.setup();

    const mockCircuits: ProjectCircuit[] = [
      {
        id: 1,
        color: "#990055",
        label: "Circuit 1",
        geometry: {
          type: "LineString",
          coordinates: [
            [2, 48],
            [3, 49],
          ],
        },
      },
    ];

    const mockOnSelect = jest.fn();

    render(
      <MapContainer>
        <CircuitLayer
          mapMode={MapModes.VIEW}
          circuits={mockCircuits}
          selectedId={1}
          onSelect={mockOnSelect}
          onEdit={() => {}}
          onDelete={() => {}}
          onAddPointToCircuit={() => {}}
          onUpdateCircuitGeometry={() => {}}
          onDeletePointFromCircuit={() => {}}
        />
      </MapContainer>,
    );

    // Checks the presence of the VIRTUAL polyline of the circuit 1.
    const virtualPoly = await screen.findByLabelText(
      "virtual-polyline-circuit-1",
    );

    // Clicks on the polyline to select it.
    await user.click(virtualPoly);

    // Checks the call of the callback.
    expect(mockOnSelect).toHaveBeenCalledWith(null);
  });

  test("should call the callback to add point when the matching menu is selected", async () => {
    const user = userEvent.setup();

    const mockCircuits: ProjectCircuit[] = [
      {
        id: 1,
        color: "#990055",
        label: "Circuit 1",
        geometry: {
          type: "LineString",
          coordinates: [
            [2, 48],
            [3, 49],
          ],
        },
      },
    ];

    const mockOnAddPointToCircuit = jest.fn();

    render(
      <CircuitLayer
        mapMode={MapModes.VIEW}
        circuits={mockCircuits}
        selectedId={1}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onAddPointToCircuit={mockOnAddPointToCircuit}
        onUpdateCircuitGeometry={() => {}}
        onDeletePointFromCircuit={() => {}}
      />,
    );

    // Checks the presence of the VIRTUAL polyline of the circuit 1.
    const virtualPoly = await screen.findByLabelText(
      "virtual-polyline-circuit-1",
    );

    // Right click on the polyline.
    await user.pointer({ keys: "[MouseRight]", target: virtualPoly });

    // Gets the menu to add a point.
    const addPointMenu = await screen.findByLabelText(
      "circuit-selection-context-menu-li-add-point",
    );

    // Clicks on the menu to add a point.
    await user.click(addPointMenu);

    // Checks the call of the callback.
    expect(mockOnAddPointToCircuit).toHaveBeenCalledWith(1, { lat: 0, lng: 0 });
  });

  test("should call the callback to edit the configuration of the circuit when the matching menu is selected", async () => {
    const user = userEvent.setup();

    const mockCircuits: ProjectCircuit[] = [
      {
        id: 1,
        color: "#990055",
        label: "Circuit 1",
        geometry: {
          type: "LineString",
          coordinates: [
            [2, 48],
            [3, 49],
          ],
        },
      },
    ];

    const mockOnEdit = jest.fn();

    render(
      <CircuitLayer
        mapMode={MapModes.VIEW}
        circuits={mockCircuits}
        selectedId={1}
        onSelect={() => {}}
        onEdit={mockOnEdit}
        onDelete={() => {}}
        onAddPointToCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onDeletePointFromCircuit={() => {}}
      />,
    );

    // Checks the presence of the VIRTUAL polyline of the circuit 1.
    const virtualPoly = await screen.findByLabelText(
      "virtual-polyline-circuit-1",
    );

    // Right click on the polyline.
    await user.pointer({ keys: "[MouseRight]", target: virtualPoly });

    // Gets the menu to edit the configuration of the circuit.
    const editCircuitMenu = await screen.findByLabelText(
      "circuit-selection-context-menu-li-edit-circuit-conf",
    );

    // Clicks on the menu to edit the configuration of the circuit.
    await user.click(editCircuitMenu);

    // Checks the call of the callback.
    expect(mockOnEdit).toHaveBeenCalledWith(1);
  });

  test("should call the callback to delete the selected circuit when the matching menu is selected", async () => {
    const user = userEvent.setup();

    const mockCircuits: ProjectCircuit[] = [
      {
        id: 1,
        color: "#990055",
        label: "Circuit 1",
        geometry: {
          type: "LineString",
          coordinates: [
            [2, 48],
            [3, 49],
          ],
        },
      },
    ];

    const mockOnDelete = jest.fn();

    render(
      <CircuitLayer
        mapMode={MapModes.VIEW}
        circuits={mockCircuits}
        selectedId={1}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={mockOnDelete}
        onAddPointToCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onDeletePointFromCircuit={() => {}}
      />,
    );

    // Checks the presence of the VIRTUAL polyline of the circuit 1.
    const virtualPoly = await screen.findByLabelText(
      "virtual-polyline-circuit-1",
    );

    // Right click on the polyline.
    await user.pointer({ keys: "[MouseRight]", target: virtualPoly });

    // Gets the menu to delete the selected circuit.
    const deleteCircuitMenu = await screen.findByLabelText(
      "circuit-selection-context-menu-li-delete-circuit",
    );

    // Clicks on the menu to delete the circuit.
    await user.click(deleteCircuitMenu);

    // Checks the call of the callback.
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  test("should succeed to move the point of a circuit", async () => {
    const mockOnUpdateCircuitGeometry = jest.fn();
    const mockCircuits: ProjectCircuit[] = [
      {
        id: 1,
        color: "#990055",
        label: "Circuit 1",
        geometry: {
          type: "LineString",
          coordinates: [
            [2, 48],
            [3, 49],
          ],
        },
      },
    ];

    render(
      <CircuitLayer
        mapMode={MapModes.VIEW}
        circuits={mockCircuits}
        selectedId={1} // Markers are only visible if the circuit is selected
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onAddPointToCircuit={() => {}}
        onUpdateCircuitGeometry={mockOnUpdateCircuitGeometry}
        onDeletePointFromCircuit={() => {}}
      />,
    );

    // Gets the points of the selected circuit.
    const circuitPoints = await screen.findAllByLabelText("points-circuit-1");

    // Gets the first point.
    const firstCircPoint = circuitPoints[0];

    // Starts the dragging of the point.
    fireEvent.mouseDown(firstCircPoint);

    // Simulates new coordinates for the point.
    fireEvent.mouseMove(firstCircPoint, {
      target: {
        getLatLng: () => ({ lat: 50, lng: 5 }),
      },
    });

    // Terminates the drag.
    fireEvent.mouseUp(firstCircPoint);

    // Checks the call of the callback to update the coordinates of the circuit.
    expect(mockOnUpdateCircuitGeometry).toHaveBeenCalledWith(1, [
      { lat: 50, lng: 5 }, // Moved point
      { lat: 49, lng: 3 }, // Unchanged point
    ]);
  });

  test("should succeed to delete a point when clicking on the delete menu in the context menu of that point", async () => {
    const user = userEvent.setup();
    const mockOnDeletePointFromCircuit = jest.fn();

    const mockCircuits: ProjectCircuit[] = [
      {
        id: 1,
        color: "#990055",
        label: "Circuit 1",
        geometry: {
          type: "LineString",
          coordinates: [
            [2, 48], // Index 0
            [3, 49], // Index 1
            [4, 50], // Index 2
          ],
        },
      },
    ];

    render(
      <CircuitLayer
        mapMode={MapModes.VIEW}
        circuits={mockCircuits}
        selectedId={1}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onAddPointToCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onDeletePointFromCircuit={mockOnDeletePointFromCircuit}
      />,
    );

    // Gets the points of the circuit
    const circuitPoints = await screen.findAllByLabelText("points-circuit-1");

    // Right click on the second point (point at index 1)
    await user.pointer({ keys: "[MouseRight]", target: circuitPoints[1] });

    // Gets the menu on the selected point
    const menuSelectedPoint = await screen.findByLabelText(
      "poly-point-context-menu",
    );

    // Gets the delete menu
    const menuDeletePoint = within(menuSelectedPoint).getByLabelText(
      "poly-point-context-menu-delete-point",
    );

    // Clicks on the delete menu
    await user.click(menuDeletePoint);

    // Checks the callback
    await waitFor(() =>
      expect(mockOnDeletePointFromCircuit).toHaveBeenCalledWith(1, 1),
    );
  });
});
