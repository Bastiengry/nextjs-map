import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PolyPointContextMenu } from "./PolyPointContextMenu";
import { MapContainer, __resetMocks } from "@/__mocks__/react-leaflet";

describe("PolyPointContextMenu component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetMocks();
  });

  test("should display well", async () => {
    render(
      <MapContainer>
        <PolyPointContextMenu
          x={100}
          y={100}
          onClose={() => {}}
          onDelete={() => {}}
        />
      </MapContainer>,
    );

    // Gets the context menu.
    const menuPolyPoint = await screen.findByLabelText(
      "poly-point-context-menu",
    );

    // Gets the menu item to delete a point.
    const liDeletePoint = within(menuPolyPoint).getByLabelText(
      "poly-point-context-menu-delete-point",
    );

    // Checks the label of the menu item to delete a point.
    expect(liDeletePoint).toHaveTextContent("circuit.deletePoint");
  });

  test("should succeed to call the callback to delete a point from the circuit", async () => {
    const mockOnClose = jest.fn();
    const mockOnDelete = jest.fn();
    const user = userEvent.setup();

    render(
      <MapContainer>
        <PolyPointContextMenu
          x={100}
          y={100}
          onClose={mockOnClose}
          onDelete={mockOnDelete}
        />
      </MapContainer>,
    );

    // Gets the context menu.
    const menuPolyPoint = await screen.findByLabelText(
      "poly-point-context-menu",
    );

    // Gets the menu item to delete a point.
    const liDeletePoint = within(menuPolyPoint).getByLabelText(
      "poly-point-context-menu-delete-point",
    );

    // Clicks on the menu to delete a point from the circuit.
    await user.click(liDeletePoint);

    // Checks the callbacks.
    expect(mockOnDelete).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
