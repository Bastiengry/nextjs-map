import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMap, useMapEvents } from "react-leaflet";
import { MapAddMarkerControl } from "./MapAddMarkerControl";
import { MapContainer, __resetMocks } from "@/__mocks__/react-leaflet";
import MapModes from "../../types/MapMode";

const mockedUseMapEvents = jest.mocked(useMapEvents);

describe("MapAddMarkerControl component", () => {
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
        <MapAddMarkerControl
          mapMode={MapModes.VIEW}
          onClickStartAddMarker={() => {}}
          onClickEndAddMarker={() => {}}
          onAddMarker={() => {}}
        />
      </MapContainer>,
    );

    const control = await screen.findByLabelText("add-marker-control");

    // Gets the button of the control.
    const button = within(control).getByLabelText("add-marker-control-button");

    // Checks the button.
    expect(button).toHaveClass("pi-thumbtack");
    expect(button.title).toBe("map.control.addMarker.title");
  });

  test("should call the good callback when clicking on the button to start to add markers", async () => {
    const mockOnClickStartAddMarker = jest.fn();

    render(
      <MapContainer>
        <MapAddMarkerControl
          mapMode={MapModes.VIEW}
          onClickStartAddMarker={mockOnClickStartAddMarker}
          onClickEndAddMarker={() => {}}
          onAddMarker={() => {}}
        />
      </MapContainer>,
    );

    const control = await screen.findByLabelText("add-marker-control");

    // Gets the button of the control.
    const button = within(control).getByLabelText("add-marker-control-button");

    // Clicks on the button.
    await userEvent.click(button);

    // Cheks the call of the callback to start to add markers.
    expect(mockOnClickStartAddMarker).toHaveBeenCalledTimes(1);

    // Checks the style of the button on the control.
    expect(button.style.background).toBe("rgb(119, 119, 119)");
    expect(button.style.color).toBe("rgb(255, 255, 255)");
  });

  test("should call the good callback when clicking on the button to stop to add markers", async () => {
    const mockOnClickEndAddMarker = jest.fn();
    render(
      <MapContainer>
        <MapAddMarkerControl
          mapMode={MapModes.ADD_MARKER}
          onClickStartAddMarker={() => {}}
          onClickEndAddMarker={mockOnClickEndAddMarker}
          onAddMarker={() => {}}
        />
      </MapContainer>,
    );

    const control = await screen.findByLabelText("add-marker-control");

    // Gets the button of the control.
    const button = within(control).getByLabelText("add-marker-control-button");

    // Clicks on the button.
    await userEvent.click(button);

    // Cheks the call of the callback to stop to add markers.
    expect(mockOnClickEndAddMarker).toHaveBeenCalledTimes(1);

    // Checks the style of the button on the control.
    expect(button.style.background).toBe("");
    expect(button.style.color).toBe("");
  });

  it("should trigger the onAddMarker callback when the user clicks on the map in ADD_MARKER mode", () => {
    const mockOnAddMarker = jest.fn();

    let mapEvents: any = {};
    mockedUseMapEvents.mockImplementation((events) => {
      mapEvents = events;
      return {
        addControl: jest.fn(),
        removeControl: jest.fn(),
      } as unknown as L.Map;
    });

    render(
      <MapContainer>
        <MapAddMarkerControl
          mapMode={MapModes.ADD_MARKER}
          onClickStartAddMarker={() => {}}
          onClickEndAddMarker={() => {}}
          onAddMarker={mockOnAddMarker}
        />
      </MapContainer>,
    );

    // Simuates a click on the map
    const fakeEvent = { latlng: { lat: 45, lng: 5 } };
    mapEvents.click(fakeEvent);

    // Checks the call of the callback when adding a marker on the map
    expect(mockOnAddMarker).toHaveBeenCalledWith({
      coordinates: [5, 45],
      type: "Point",
    });
  });

  it("should not trigger the onAddMarker callback if the user clicks on the map and mode is different from ADD_MARKER", () => {
    const mockOnAddMarker = jest.fn();

    let mapEvents: any = {};
    mockedUseMapEvents.mockImplementation((events) => {
      mapEvents = events;
      return {
        addControl: jest.fn(),
        removeControl: jest.fn(),
      } as unknown as L.Map;
    });

    render(
      <MapContainer>
        <MapAddMarkerControl
          mapMode={MapModes.VIEW}
          onClickStartAddMarker={() => {}}
          onClickEndAddMarker={() => {}}
          onAddMarker={mockOnAddMarker}
        />
      </MapContainer>,
    );

    // Simuates a click on the map
    const fakeEvent = { latlng: { lat: 45, lng: 5 } };
    mapEvents.click(fakeEvent);

    // Checks the call of the callback when adding a marker on the map
    expect(mockOnAddMarker).not.toHaveBeenCalledWith({
      type: "Point",
      coordinates: [5, 45],
    });
  });

  it("should hide the control if the mode is neither VIEW nor ADD_MARKER", async () => {
    const { rerender } = render(
      <MapContainer>
        <MapAddMarkerControl
          mapMode="UNKNOWN_1"
          onClickStartAddMarker={() => {}}
          onClickEndAddMarker={() => {}}
          onAddMarker={() => {}}
        />
      </MapContainer>,
    );

    // Second render
    rerender(
      <MapContainer>
        <MapAddMarkerControl
          mapMode="UNKNOWN_2"
          onClickStartAddMarker={() => {}}
          onClickEndAddMarker={() => {}}
          onAddMarker={() => {}}
        />
      </MapContainer>,
    );

    const container = await screen.findByLabelText("add-marker-control");
    expect(container.style.visibility).toBe("hidden");
  });

  test("should update the callback but not the control itself when a refresh is triggered (thanks to useRef) and mode is VIEW", async () => {
    const firstCallbackOnClickStartAddMarker = jest.fn();
    const secondCallbackOnClickStartAddMarker = jest.fn();

    const { rerender } = render(
      <MapContainer>
        <MapAddMarkerControl
          mapMode={MapModes.VIEW}
          onClickStartAddMarker={firstCallbackOnClickStartAddMarker}
          onClickEndAddMarker={() => {}}
          onAddMarker={() => {}}
        />
      </MapContainer>,
    );

    // Second render
    rerender(
      <MapContainer>
        <MapAddMarkerControl
          mapMode={MapModes.VIEW}
          onClickStartAddMarker={secondCallbackOnClickStartAddMarker}
          onClickEndAddMarker={() => {}}
          onAddMarker={() => {}}
        />
      </MapContainer>,
    );

    const control = await screen.findByLabelText("add-marker-control");

    // Gets the button of the control.
    const button = within(control).getByLabelText("add-marker-control-button");

    // Clicks on the button.
    await userEvent.click(button); // START
    await userEvent.click(button); // STOP

    // Checks that only the second callback has been called.
    expect(firstCallbackOnClickStartAddMarker).not.toHaveBeenCalled();
    expect(secondCallbackOnClickStartAddMarker).toHaveBeenCalled();
  });

  test("should update the callback but not the control itself when a refresh is triggered (thanks to useRef) and mode is ADD_MARKER", async () => {
    const firstCallbackOnClickEndAddMarker = jest.fn();
    const secondCallbackOnClickEndAddMarker = jest.fn();

    const { rerender } = render(
      <MapContainer>
        <MapAddMarkerControl
          mapMode={MapModes.VIEW}
          onClickStartAddMarker={() => {}}
          onClickEndAddMarker={firstCallbackOnClickEndAddMarker}
          onAddMarker={() => {}}
        />
      </MapContainer>,
    );

    // Second render
    rerender(
      <MapContainer>
        <MapAddMarkerControl
          mapMode={MapModes.ADD_MARKER}
          onClickStartAddMarker={() => {}}
          onClickEndAddMarker={secondCallbackOnClickEndAddMarker}
          onAddMarker={() => {}}
        />
      </MapContainer>,
    );

    const control = await screen.findByLabelText("add-marker-control");

    // Gets the button of the control.
    const button = within(control).getByLabelText("add-marker-control-button");

    // Clicks on the button.
    await userEvent.click(button); // START
    await userEvent.click(button); // STOP

    // Checks that only the second callback has been called.
    expect(firstCallbackOnClickEndAddMarker).not.toHaveBeenCalled();
    expect(secondCallbackOnClickEndAddMarker).toHaveBeenCalled();
  });

  it("should leave ADD_MARKER mode in mode is changed by parent component", async () => {
    const mockOnClickStartAddMarker = jest.fn().mockImplementation((reRend) => {
      reRend(
        <MapContainer>
          <MapAddMarkerControl
            mapMode={MapModes.ADD_MARKER}
            onClickStartAddMarker={() => {}}
            onClickEndAddMarker={() => {}}
            onAddMarker={() => {}}
          />
        </MapContainer>,
      );
    });

    const { rerender } = render(
      <MapContainer>
        <MapAddMarkerControl
          mapMode={MapModes.VIEW}
          onClickStartAddMarker={() => mockOnClickStartAddMarker(rerender)}
          onClickEndAddMarker={() => {}}
          onAddMarker={() => {}}
        />
      </MapContainer>,
    );

    let control = await screen.findByLabelText("add-marker-control");

    // Gets the button of the control.
    let button = within(control).getByLabelText("add-marker-control-button");

    // Clicks on the button : ENTERS IN ADD_MARKER MODE.
    await userEvent.click(button);

    // Checks the style of the button on the control.
    expect(button.style.background).toBe("rgb(119, 119, 119)");
    expect(button.style.color).toBe("rgb(255, 255, 255)");

    // Second render
    rerender(
      <MapContainer>
        <MapAddMarkerControl
          mapMode={MapModes.VIEW}
          onClickStartAddMarker={() => {}}
          onClickEndAddMarker={() => {}}
          onAddMarker={() => {}}
        />
      </MapContainer>,
    );

    control = await screen.findByLabelText("add-marker-control");

    // Gets the button of the control.
    button = within(control).getByLabelText("add-marker-control-button");

    // Checks the style of the button on the control.
    expect(button.style.background).toBe("");
    expect(button.style.color).toBe("");
  });
});
