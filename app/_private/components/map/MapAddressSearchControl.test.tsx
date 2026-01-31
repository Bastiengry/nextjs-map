import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MapAddressSearchControl } from "./MapAddressSearchControl";
import {
  MapContainer,
  useMapEvents,
  __resetMocks,
} from "@/__mocks__/react-leaflet";
import MapModes from "../../types/MapMode";
import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete";

jest.mock("@geoapify/geocoder-autocomplete", () => ({
  GeocoderAutocomplete: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  })),
}));

describe("MapAddressSearchControl component", () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    jest.clearAllMocks();
    __resetMocks();
  });

  test("should display on the map", async () => {
    process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY = "test-api-key";

    render(
      <MapContainer>
        <MapAddressSearchControl mapMode={MapModes.VIEW} />
      </MapContainer>,
    );

    // Checks the input of the control.
    await screen.findByLabelText("address-search-control-input");

    expect(GeocoderAutocomplete).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      "test-api-key",
      expect.objectContaining({
        placeholder: "map.control.addressSearch.inputSearch.placeholder",
      }),
    );
  });

  test("should fly to location when an address is selected", () => {
    render(
      <MapContainer>
        <MapAddressSearchControl mapMode={MapModes.VIEW} />
      </MapContainer>,
    );

    // Gets the Geoapify mock
    const autocompleteInstance = (GeocoderAutocomplete as jest.Mock).mock
      .results[0].value;

    // Gets the callback registered with autocomplete.on('select', ...)
    const selectCallback = autocompleteInstance.on.mock.calls.find(
      (call: any) => call[0] === "select",
    )[1];

    // Simulates the event sent by Geoapify
    const mockLocation = {
      properties: { lat: 48.8566, lon: 2.3522 },
    };
    selectCallback(mockLocation);

    // Checks.
    expect(useMapEvents().flyTo).toHaveBeenCalledWith({
      lat: 48.8566,
      lng: 2.3522,
    });
  });

  it("should hide the control if the mode is different from VIEW", async () => {
    const { rerender } = render(
      <MapContainer>
        <MapAddressSearchControl mapMode="UNKNOWN_1" />
      </MapContainer>,
    );

    // Second render
    rerender(
      <MapContainer>
        <MapAddressSearchControl mapMode="UNKNOWN_2" />
      </MapContainer>,
    );

    // Gets the input of the control.
    const input = await screen.findByLabelText("address-search-control-input");

    // Checks that the control is hidden.
    expect(input.style.visibility).toBe("hidden");
  });

  it("should display the control if the mode comes back to VIEW", async () => {
    const { rerender } = render(
      <MapContainer>
        <MapAddressSearchControl mapMode="UNKNOWN_1" />
      </MapContainer>,
    );

    // Second render
    rerender(
      <MapContainer>
        <MapAddressSearchControl mapMode={MapModes.VIEW} />
      </MapContainer>,
    );

    // Gets the input of the control.
    const input = await screen.findByLabelText("address-search-control-input");

    // Checks that the control is visble.
    expect(input.style.visibility).toBe("visible");
  });
});
