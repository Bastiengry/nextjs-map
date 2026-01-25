import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMap, useMapEvents } from "react-leaflet";
import { MapRoutingMachineControl } from "./MapRoutingMachineControl";
import { MapContainer, __resetMocks } from "@/__mocks__/react-leaflet";
import MapModes from "../../types/MapMode";

const mockedUseMapEvents = jest.mocked(useMapEvents);

describe("MapRoutingMachineControl component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetMocks();

    mockedUseMapEvents.mockImplementation(() => {
      return useMap() as unknown as L.Map;
    });
  });

  test("should display on the map", async () => {
    render(
      <MapContainer>
        <MapRoutingMachineControl
          mapMode={MapModes.VIEW}
          onClickCreateRoute={() => {}}
        />
      </MapContainer>,
    );

    const control = await screen.findByLabelText("routing-machine-control");

    // Gets the button of the control.
    const button = within(control).getByLabelText(
      "routing-machine-control-button",
    );

    // Checks the icon.
    expect(button).toHaveClass("pi-map");
  });

  it("should call the good callback when clicking on the button to create the route of the selected polyline", async () => {
    let mapMode = MapModes.VIEW;
    const mockOnClickCreateRoute = jest.fn();

    render(
      <MapContainer>
        <MapRoutingMachineControl
          mapMode={MapModes.VIEW}
          onClickCreateRoute={mockOnClickCreateRoute}
        />
      </MapContainer>,
    );

    const control = await screen.findByLabelText("routing-machine-control");

    // Gets the button to create the route.
    const button = within(control).getByLabelText(
      "routing-machine-control-button",
    );

    // Clicks on the button to create the route.
    await userEvent.click(button);

    // Checks the call of the callback.
    expect(mockOnClickCreateRoute).toHaveBeenCalled();
  });

  it("should hide the control if the mode is different from VIEW", async () => {
    const { rerender } = render(
      <MapContainer>
        <MapRoutingMachineControl
          mapMode="UNKNOWN_1"
          onClickCreateRoute={() => {}}
        />
      </MapContainer>,
    );

    // Second render
    rerender(
      <MapContainer>
        <MapRoutingMachineControl
          mapMode="UNKNOWN_2"
          onClickCreateRoute={() => {}}
        />
      </MapContainer>,
    );

    // Gets the control.
    const container = await screen.findByLabelText("routing-machine-control");

    // Checks that the control is hidden.
    expect(container.style.visibility).toBe("hidden");
  });

  it("should display the control if the mode comes back to VIEW", async () => {
    const { rerender } = render(
      <MapContainer>
        <MapRoutingMachineControl
          mapMode="UNKNOWN_1"
          onClickCreateRoute={() => {}}
        />
      </MapContainer>,
    );

    // Second render
    rerender(
      <MapContainer>
        <MapRoutingMachineControl
          mapMode={MapModes.VIEW}
          onClickCreateRoute={() => {}}
        />
      </MapContainer>,
    );

    // Gets the control.
    const container = await screen.findByLabelText("routing-machine-control");

    // Checks that the control is hidden.
    expect(container.style.visibility).toBe("visible");
  });
});
