import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMapEvents } from "react-leaflet";
import { MapLocationControl } from "./MapLocationControl";
import { MapContainer, __resetMocks } from "@/__mocks__/react-leaflet";
import MapModes from "../../types/MapMode";

const mockedUseMapEvents = useMapEvents as jest.Mock & { _lastHandlers: any };

describe("MapLocationControl component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetMocks();
  });

  test("should display on the map", async () => {
    render(
      <MapContainer>
        <MapLocationControl mapMode={MapModes.VIEW} />
      </MapContainer>,
    );

    // Gets the control.
    const control = await screen.findByLabelText("location-control");

    // Gets the button of the control.
    const button = within(control).getByLabelText("location-control-button");

    // Checks the button.
    expect(button).toHaveClass("pi-map-marker");
    expect(button.title).toBe("map.control.location.title");
  });

  test("should react to the click on the button of the control to go to the current location", async () => {
    const user = userEvent.setup();

    render(
      <MapContainer>
        <MapLocationControl mapMode={MapModes.VIEW} />
      </MapContainer>,
    );

    // Gets the control.
    const control = await screen.findByLabelText("location-control");

    // Gets the button of the control.
    const button = within(control).getByLabelText("location-control-button");

    await user.click(button);

    // Checks the call of the method to go to the current location on the map
    const mapInstance = mockedUseMapEvents.mock.results[0].value;
    expect(mapInstance.locate).toHaveBeenCalledTimes(1);
  });

  test("should effectively fly to the location when 'locationfound' event is triggered", async () => {
    render(
      <MapContainer>
        <MapLocationControl mapMode={MapModes.VIEW} />
      </MapContainer>,
    );

    // Gets the map instance
    const mapInstance = mockedUseMapEvents.mock.results[0].value;

    // Gets the captured handlers
    const capturedHandlers = mockedUseMapEvents._lastHandlers;

    // Simulates the locationFound event
    const mockEvent = {
      latlng: { lat: 48.8566, lng: 2.3522 },
    };

    act(() => {
      capturedHandlers.locationfound(mockEvent);
    });

    // Checks the call of the "fly" method on the map
    expect(mapInstance.flyTo).toHaveBeenCalledWith(
      mockEvent.latlng,
      expect.anything(), // Zoom
    );
  });

  test("should still work after refresh of the control component", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <MapContainer>
        <MapLocationControl mapMode={MapModes.VIEW} />
      </MapContainer>,
    );

    rerender(
      <MapContainer>
        <MapLocationControl mapMode={MapModes.VIEW} />
      </MapContainer>,
    );

    // Gets the control.
    const control = await screen.findByLabelText("location-control");

    // Gets the button of the control.
    const button = within(control).getByLabelText("location-control-button");

    await user.click(button);

    // Checks the call of the method to go to the current location on the map
    const mapInstance = mockedUseMapEvents.mock.results[0].value;
    expect(mapInstance.locate).toHaveBeenCalledTimes(1);
  });

  it("should hide the control if the mode is different from VIEW", async () => {
    const { rerender } = render(
      <MapContainer>
        <MapLocationControl mapMode="UNKNOWN_1" />
      </MapContainer>,
    );

    // Second render
    rerender(
      <MapContainer>
        <MapLocationControl mapMode="UNKNOWN_2" />
      </MapContainer>,
    );

    // Gets the control.
    const container = await screen.findByLabelText("location-control");

    // Checks that the control is hidden.
    expect(container.style.visibility).toBe("hidden");
  });

  it("should display the control if the mode was different from VIEW but is now VIEW", async () => {
    const { rerender } = render(
      <MapContainer>
        <MapLocationControl mapMode="UNKNOWN_1" />
      </MapContainer>,
    );

    // Second render
    rerender(
      <MapContainer>
        <MapLocationControl mapMode={MapModes.VIEW} />
      </MapContainer>,
    );

    // Gets the control.
    const container = await screen.findByLabelText("location-control");

    // Checks that the control is hidden.
    expect(container.style.visibility).toBe("visible");
  });
});
