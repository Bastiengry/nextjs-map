import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMap, useMapEvents } from "react-leaflet";
import { MapAddPolylineControl } from "./MapAddPolylineControl";
import { MapContainer, __resetMocks } from "@/__mocks__/react-leaflet";
import MapModes from "../../types/MapMode";
import { act, useState } from "react";

const mockedUseMapEvents = jest.mocked(useMapEvents);

describe("MapAddPolylineControl component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetMocks();

    mockedUseMapEvents.mockImplementation(() => {
      return useMap() as unknown as L.Map;
    });
  });

  it("should render the start button initially", async () => {
    render(
      <MapContainer>
        <MapAddPolylineControl
          mapMode={MapModes.VIEW}
          onClickStartAddPolyline={() => {}}
          onClickDrawPolyline={() => {}}
          onClickValidateAddPolyline={() => {}}
          onClickCancelAddPolyline={() => {}}
        />
      </MapContainer>,
    );

    // Gets the control button.
    const control = await screen.findByLabelText("add-polyline-control");

    // Gets the start button.
    const startBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-start",
    );

    // Checks the start button.
    expect(startBtn).toHaveClass("pi-pen-to-square");
    expect(startBtn.style.color).toBe("rgb(0, 0, 0)");
    expect(startBtn.title).toBe("map.control.addPolyline.drawPolyline");

    // Gets the validate button.
    const validateBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-validate",
    );

    // Checks the validate button.
    expect(validateBtn).toHaveClass("pi-check");
    expect(validateBtn.style.display).toBe("none");
    expect(validateBtn.title).toBe("map.control.addPolyline.btnValidate.title");

    // Gets the cancel button.
    const cancelBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-cancel",
    );

    // Checks the cancel button.
    expect(cancelBtn).toHaveClass("pi-times");
    expect(cancelBtn.style.display).toBe("none");
    expect(cancelBtn.title).toBe("map.control.addPolyline.btnCancel.title");
  });

  it("should call the good callback when clicking on the button to start to a polyline", async () => {
    let mapMode = MapModes.VIEW;
    const mockOnClickStartAddPolyline = jest
      .fn()
      .mockImplementation((rerender) => {
        mapMode = MapModes.ADD_POLYLINE;
        rerender(
          <MapContainer>
            <MapAddPolylineControl
              mapMode={mapMode}
              onClickStartAddPolyline={() =>
                mockOnClickStartAddPolyline(rerender)
              }
              onClickDrawPolyline={() => {}}
              onClickValidateAddPolyline={() => {}}
              onClickCancelAddPolyline={() => {}}
            />
          </MapContainer>,
        );
      });

    const { rerender } = render(
      <MapContainer>
        <MapAddPolylineControl
          mapMode={mapMode}
          onClickStartAddPolyline={() => mockOnClickStartAddPolyline(rerender)}
          onClickDrawPolyline={() => {}}
          onClickValidateAddPolyline={() => {}}
          onClickCancelAddPolyline={() => {}}
        />
      </MapContainer>,
    );

    // Gets the control button.
    const control = await screen.findByLabelText("add-polyline-control");

    // Checks that the control is in VIEW mode.
    expect(mapMode).toBe(MapModes.VIEW);

    // Gets the start button.
    const startBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-start",
    );

    // Clicks on the button to start the creation of a polyline.
    await userEvent.click(startBtn);

    // Checks the call of the onClickStartAddPolyline callback.
    expect(mockOnClickStartAddPolyline).toHaveBeenCalled();

    // Checks the style of the start button on the control.
    expect(startBtn.style.color).toBe("rgb(153, 153, 153)");
    expect(startBtn.disabled).toBe(true);

    // Gets the validate button.
    const validateBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-validate",
    );

    // Checks the validate button.
    expect(validateBtn.style.display).toBe("inline-block");

    // Gets the cancel button.
    const cancelBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-cancel",
    );

    // Checks the cancel button.
    expect(cancelBtn.style.display).toBe("inline-block");

    // Checks that the control is in ADD_POLYLINE mode.
    expect(mapMode).toBe(MapModes.ADD_POLYLINE);
  });

  it("should call the good callback when clicking on the map to create a polyline", async () => {
    const user = userEvent.setup();
    const mockOnDrawPolyline = jest.fn();

    const TestComp = () => {
      const [mode, setMode] = useState<string>(MapModes.VIEW);
      return (
        <MapContainer>
          <MapAddPolylineControl
            mapMode={mode}
            onClickStartAddPolyline={() => setMode(MapModes.ADD_POLYLINE)}
            onClickDrawPolyline={mockOnDrawPolyline}
            onClickValidateAddPolyline={jest.fn()}
            onClickCancelAddPolyline={jest.fn()}
          />
        </MapContainer>
      );
    };

    render(<TestComp />);

    let mapEvents: any = {};
    mockedUseMapEvents.mockImplementation((events) => {
      mapEvents = events;
      return {
        addControl: jest.fn(),
        removeControl: jest.fn(),
      } as unknown as L.Map;
    });

    // Gets the control button.
    const control = await screen.findByLabelText("add-polyline-control");

    // Gets the start button.
    const startBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-start",
    );

    // Clicks on the button to start the creation of a polyline.
    await user.click(startBtn);

    // Simuates a click on the map to add a first point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 45, lng: 5 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [[5, 45]],
    });

    // Simuates a click on the map to add a second point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 44.15, lng: 5.002 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [
        [5, 45],
        [5.002, 44.15],
      ],
    });
  });

  it("should well manage the validation of the creation of a polygone", async () => {
    const user = userEvent.setup();
    const mockOnDrawPolyline = jest.fn();
    const mockOnValidateAddPolyline = jest.fn();

    const TestComp = () => {
      const [mode, setMode] = useState<string>(MapModes.VIEW);
      return (
        <MapContainer>
          <MapAddPolylineControl
            mapMode={mode}
            onClickStartAddPolyline={() => setMode(MapModes.ADD_POLYLINE)}
            onClickDrawPolyline={mockOnDrawPolyline}
            onClickValidateAddPolyline={mockOnValidateAddPolyline}
            onClickCancelAddPolyline={() => {}}
          />
        </MapContainer>
      );
    };

    render(<TestComp />);

    let mapEvents: any = {};
    mockedUseMapEvents.mockImplementation((events) => {
      mapEvents = events;
      return {
        addControl: jest.fn(),
        removeControl: jest.fn(),
      } as unknown as L.Map;
    });

    // Gets the control button.
    const control = await screen.findByLabelText("add-polyline-control");

    // Gets the start button.
    const startBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-start",
    );

    // Clicks on the button to start the creation of a polyline.
    await user.click(startBtn);

    // Simuates a click on the map to add a first point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 45, lng: 5 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [[5, 45]],
    });

    // Simuates a click on the map to add a second point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 44.15, lng: 5.002 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [
        [5, 45],
        [5.002, 44.15],
      ],
    });

    // Gets the validate button.
    const validateBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-validate",
    );

    // Clicks on the button to validate the creation of a polyline.
    await user.click(validateBtn);

    // Checks the callback.
    expect(mockOnValidateAddPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [
        [5, 45],
        [5.002, 44.15],
      ],
    });

    // Checks that the start button is enabled.
    expect(startBtn.style.color).toBe("rgb(0, 0, 0)");
    expect(startBtn.disabled).toBe(false);

    // Checks that the validate button is disabled.
    expect(validateBtn.style.display).toBe("none");

    // Checks that the cancel button is disabled.
    const cancelBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-cancel",
    );
    expect(cancelBtn.style.display).toBe("none");
  });

  it("should well manage the cancellation of the creation of a polygone", async () => {
    const user = userEvent.setup();
    const mockOnDrawPolyline = jest.fn();
    const mockOnCancelAddPolyline = jest.fn();

    const TestComp = () => {
      const [mode, setMode] = useState<string>(MapModes.VIEW);
      return (
        <MapContainer>
          <MapAddPolylineControl
            mapMode={mode}
            onClickStartAddPolyline={() => setMode(MapModes.ADD_POLYLINE)}
            onClickDrawPolyline={mockOnDrawPolyline}
            onClickValidateAddPolyline={() => {}}
            onClickCancelAddPolyline={mockOnCancelAddPolyline}
          />
        </MapContainer>
      );
    };

    render(<TestComp />);

    let mapEvents: any = {};
    mockedUseMapEvents.mockImplementation((events) => {
      mapEvents = events;
      return {
        addControl: jest.fn(),
        removeControl: jest.fn(),
      } as unknown as L.Map;
    });

    // Gets the control button.
    const control = await screen.findByLabelText("add-polyline-control");

    // Gets the start button.
    const startBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-start",
    );

    // Clicks on the button to start the creation of a polyline.
    await user.click(startBtn);

    // Simuates a click on the map to add a first point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 45, lng: 5 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [[5, 45]],
    });

    // Simuates a click on the map to add a second point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 44.15, lng: 5.002 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [
        [5, 45],
        [5.002, 44.15],
      ],
    });

    // Gets the cancel button.
    const cancelBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-cancel",
    );

    // Clicks on the button to cancel the creation of a polyline.
    await user.click(cancelBtn);

    // Checks the callback.
    expect(mockOnCancelAddPolyline).toHaveBeenCalledWith();

    // Checks that the start button is enabled.
    expect(startBtn.style.color).toBe("rgb(0, 0, 0)");
    expect(startBtn.disabled).toBe(false);

    // Checks that the cancel button is disabled.
    expect(cancelBtn.style.display).toBe("none");

    // Checks that the validate button is disabled.
    const validateBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-validate",
    );
    expect(validateBtn.style.display).toBe("none");

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    // THE FOLLOWING CHECKS THAT THE INTERNAL STATE OF THE POLYLINE HAS BEEN RESETTED WHEN CLICKING ON CANCEL
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Clicks on the button to start the creation of a polyline.
    await user.click(startBtn);

    // Simuates a click on the map to add a first point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 10, lng: 3 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [[3, 10]],
    });
  });

  it("should succeed to start edit a polyline even after a refresh of the control", async () => {
    let mapMode = MapModes.VIEW;
    const mockOnClickStartAddPolyline = jest
      .fn()
      .mockImplementation((rerender) => {
        mapMode = MapModes.ADD_POLYLINE;
        rerender(
          <MapContainer>
            <MapAddPolylineControl
              mapMode={mapMode}
              onClickStartAddPolyline={() =>
                mockOnClickStartAddPolyline(rerender)
              }
              onClickDrawPolyline={() => {}}
              onClickValidateAddPolyline={() => {}}
              onClickCancelAddPolyline={() => {}}
            />
          </MapContainer>,
        );
      });

    // First rendering
    const { rerender } = render(
      <MapContainer>
        <MapAddPolylineControl
          mapMode={mapMode}
          onClickStartAddPolyline={() => mockOnClickStartAddPolyline(rerender)}
          onClickDrawPolyline={() => {}}
          onClickValidateAddPolyline={() => {}}
          onClickCancelAddPolyline={() => {}}
        />
      </MapContainer>,
    );

    // Second rendering
    rerender(
      <MapContainer>
        <MapAddPolylineControl
          mapMode={mapMode}
          onClickStartAddPolyline={() => mockOnClickStartAddPolyline(rerender)}
          onClickDrawPolyline={() => {}}
          onClickValidateAddPolyline={() => {}}
          onClickCancelAddPolyline={() => {}}
        />
      </MapContainer>,
    );

    // Gets the control button.
    const control = await screen.findByLabelText("add-polyline-control");

    // Checks that the control is in VIEW mode.
    expect(mapMode).toBe(MapModes.VIEW);

    // Gets the start button.
    const startBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-start",
    );

    // Clicks on the button to start the creation of a polyline.
    await userEvent.click(startBtn);

    // Checks the call of the onClickStartAddPolyline callback.
    expect(mockOnClickStartAddPolyline).toHaveBeenCalled();

    // Checks the style of the start button on the control.
    expect(startBtn.style.color).toBe("rgb(153, 153, 153)");
    expect(startBtn.disabled).toBe(true);

    // Gets the validate button.
    const validateBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-validate",
    );

    // Checks the validate button.
    expect(validateBtn.style.display).toBe("inline-block");

    // Gets the cancel button.
    const cancelBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-cancel",
    );

    // Checks the cancel button.
    expect(cancelBtn.style.display).toBe("inline-block");

    // Checks that the control is in ADD_POLYLINE mode.
    expect(mapMode).toBe(MapModes.ADD_POLYLINE);
  });

  it("should succeed to call the good callback when clicking on map to create a polyline even after a refresh of the control", async () => {
    const user = userEvent.setup();
    const mockOnDrawPolyline = jest.fn();

    const TestComp = () => {
      const [mode, setMode] = useState<string>(MapModes.VIEW);
      return (
        <MapContainer>
          <MapAddPolylineControl
            mapMode={mode}
            onClickStartAddPolyline={() => setMode(MapModes.ADD_POLYLINE)}
            onClickDrawPolyline={mockOnDrawPolyline}
            onClickValidateAddPolyline={jest.fn()}
            onClickCancelAddPolyline={jest.fn()}
          />
        </MapContainer>
      );
    };

    // First rendering.
    const { rerender } = render(<TestComp />);

    // Second rendering.
    rerender(<TestComp />);

    let mapEvents: any = {};
    mockedUseMapEvents.mockImplementation((events) => {
      mapEvents = events;
      return {
        addControl: jest.fn(),
        removeControl: jest.fn(),
      } as unknown as L.Map;
    });

    // Gets the control button.
    const control = await screen.findByLabelText("add-polyline-control");

    // Gets the start button.
    const startBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-start",
    );

    // Clicks on the button to start the creation of a polyline.
    await user.click(startBtn);

    // Simuates a click on the map to add a first point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 45, lng: 5 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [[5, 45]],
    });

    // Simuates a click on the map to add a second point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 44.15, lng: 5.002 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [
        [5, 45],
        [5.002, 44.15],
      ],
    });
  });

  it("should succeed to validate the creation of a polyline even after a refresh of the control", async () => {
    const user = userEvent.setup();
    const mockOnDrawPolyline = jest.fn();
    const mockOnValidateAddPolyline = jest.fn();

    const TestComp = () => {
      const [mode, setMode] = useState<string>(MapModes.VIEW);
      return (
        <MapContainer>
          <MapAddPolylineControl
            mapMode={mode}
            onClickStartAddPolyline={() => setMode(MapModes.ADD_POLYLINE)}
            onClickDrawPolyline={mockOnDrawPolyline}
            onClickValidateAddPolyline={mockOnValidateAddPolyline}
            onClickCancelAddPolyline={() => {}}
          />
        </MapContainer>
      );
    };

    // First rendering.
    const { rerender } = render(<TestComp />);

    // Second rendering.
    rerender(<TestComp />);

    let mapEvents: any = {};
    mockedUseMapEvents.mockImplementation((events) => {
      mapEvents = events;
      return {
        addControl: jest.fn(),
        removeControl: jest.fn(),
      } as unknown as L.Map;
    });

    // Gets the control button.
    const control = await screen.findByLabelText("add-polyline-control");

    // Gets the start button.
    const startBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-start",
    );

    // Clicks on the button to start the creation of a polyline.
    await user.click(startBtn);

    // Simuates a click on the map to add a first point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 45, lng: 5 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [[5, 45]],
    });

    // Simuates a click on the map to add a second point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 44.15, lng: 5.002 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [
        [5, 45],
        [5.002, 44.15],
      ],
    });

    // Gets the validate button.
    const validateBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-validate",
    );

    // Clicks on the button to validate the creation of a polyline.
    await user.click(validateBtn);

    // Checks the callback.
    expect(mockOnValidateAddPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [
        [5, 45],
        [5.002, 44.15],
      ],
    });

    // Checks that the start button is enabled.
    expect(startBtn.style.color).toBe("rgb(0, 0, 0)");
    expect(startBtn.disabled).toBe(false);

    // Checks that the validate button is disabled.
    expect(validateBtn.style.display).toBe("none");

    // Checks that the cancel button is disabled.
    const cancelBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-cancel",
    );
    expect(cancelBtn.style.display).toBe("none");
  });

  it("should succeed to cancel the creation of a polyline even after a refresh of the control", async () => {
    const user = userEvent.setup();
    const mockOnDrawPolyline = jest.fn();
    const mockOnCancelAddPolyline = jest.fn();

    const TestComp = () => {
      const [mode, setMode] = useState<string>(MapModes.VIEW);
      return (
        <MapContainer>
          <MapAddPolylineControl
            mapMode={mode}
            onClickStartAddPolyline={() => setMode(MapModes.ADD_POLYLINE)}
            onClickDrawPolyline={mockOnDrawPolyline}
            onClickValidateAddPolyline={() => {}}
            onClickCancelAddPolyline={mockOnCancelAddPolyline}
          />
        </MapContainer>
      );
    };

    // First rendering
    const { rerender } = render(<TestComp />);

    // Second rendering
    rerender(<TestComp />);

    let mapEvents: any = {};
    mockedUseMapEvents.mockImplementation((events) => {
      mapEvents = events;
      return {
        addControl: jest.fn(),
        removeControl: jest.fn(),
      } as unknown as L.Map;
    });

    // Gets the control button.
    const control = await screen.findByLabelText("add-polyline-control");

    // Gets the start button.
    const startBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-start",
    );

    // Clicks on the button to start the creation of a polyline.
    await user.click(startBtn);

    // Simuates a click on the map to add a first point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 45, lng: 5 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [[5, 45]],
    });

    // Simuates a click on the map to add a second point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 44.15, lng: 5.002 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [
        [5, 45],
        [5.002, 44.15],
      ],
    });

    // Gets the cancel button.
    const cancelBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-cancel",
    );

    // Clicks on the button to cancel the creation of a polyline.
    await user.click(cancelBtn);

    // Checks the callback.
    expect(mockOnCancelAddPolyline).toHaveBeenCalledWith();

    // Checks that the start button is enabled.
    expect(startBtn.style.color).toBe("rgb(0, 0, 0)");
    expect(startBtn.disabled).toBe(false);

    // Checks that the cancel button is disabled.
    expect(cancelBtn.style.display).toBe("none");

    // Checks that the validate button is disabled.
    const validateBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-validate",
    );
    expect(validateBtn.style.display).toBe("none");

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    // THE FOLLOWING CHECKS THAT THE INTERNAL STATE OF THE POLYLINE HAS BEEN RESETTED WHEN CLICKING ON CANCEL
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Clicks on the button to start the creation of a polyline.
    await user.click(startBtn);

    // Simuates a click on the map to add a first point
    await act(async () => {
      mapEvents.click({ latlng: { lat: 10, lng: 3 } });
    });

    // Checks the callback.
    expect(mockOnDrawPolyline).toHaveBeenCalledWith({
      type: "LineString",
      coordinates: [[3, 10]],
    });
  });

  it("should CANCEL a creation of a polyline if clicking on VALIDATE button WITHOUT CREATING a point on map", async () => {
    const user = userEvent.setup();
    const mockOnCancelAddPolyline = jest.fn();

    const TestComp = () => {
      const [mode, setMode] = useState<string>(MapModes.VIEW);
      return (
        <MapContainer>
          <MapAddPolylineControl
            mapMode={mode}
            onClickStartAddPolyline={() => setMode(MapModes.ADD_POLYLINE)}
            onClickDrawPolyline={() => {}}
            onClickValidateAddPolyline={() => {}}
            onClickCancelAddPolyline={mockOnCancelAddPolyline}
          />
        </MapContainer>
      );
    };

    render(<TestComp />);

    // Gets the control button.
    const control = await screen.findByLabelText("add-polyline-control");

    // Gets the start button.
    const startBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-start",
    );

    // Clicks on the button to start the creation of a polyline.
    await user.click(startBtn);

    // Gets the validate button.
    const validateBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-validate",
    );

    // Clicks on the button to VALIDATE the creation of a polyline.
    await user.click(validateBtn);

    // Checks the call of CANCEL callback.
    expect(mockOnCancelAddPolyline).toHaveBeenCalledWith();

    // Checks that the start button is enabled.
    expect(startBtn.style.color).toBe("rgb(0, 0, 0)");
    expect(startBtn.disabled).toBe(false);

    // Checks that the validate button is disabled.
    expect(validateBtn.style.display).toBe("none");

    // Checks that the cancel button is disabled.
    const cancelBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-cancel",
    );
    expect(cancelBtn.style.display).toBe("none");
  });

  it("should quit creation mode of a polyline if the map state changed from ADD_POLYLINE to VIEW in parent component", async () => {
    const mockOnCancelAddPolyline = jest.fn();

    const { rerender } = render(
      <MapContainer>
        <MapAddPolylineControl
          mapMode={MapModes.ADD_POLYLINE}
          onClickStartAddPolyline={() => {}}
          onClickDrawPolyline={() => {}}
          onClickValidateAddPolyline={() => {}}
          onClickCancelAddPolyline={mockOnCancelAddPolyline}
        />
      </MapContainer>,
    );

    rerender(
      <MapContainer>
        <MapAddPolylineControl
          mapMode={MapModes.VIEW}
          onClickStartAddPolyline={() => {}}
          onClickDrawPolyline={() => {}}
          onClickValidateAddPolyline={() => {}}
          onClickCancelAddPolyline={mockOnCancelAddPolyline}
        />
      </MapContainer>,
    );

    // Gets the control button.
    const control = await screen.findByLabelText("add-polyline-control");

    // Checks that the start button is enabled.
    const startBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-start",
    );
    expect(startBtn.style.color).toBe("rgb(0, 0, 0)");
    expect(startBtn.disabled).toBe(false);

    // Checks that the validate button is disabled.
    const validateBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-validate",
    );
    expect(validateBtn.style.display).toBe("none");

    // Checks that the cancel button is disabled.
    const cancelBtn: HTMLButtonElement = within(control).getByLabelText(
      "add-polyline-control-button-cancel",
    );
    expect(cancelBtn.style.display).toBe("none");
  });

  it("should hide the control if the mode is neither VIEW nor ADD_POLYLINE", async () => {
    const { rerender } = render(
      <MapContainer>
        <MapAddPolylineControl
          mapMode="UNKNOWN_1"
          onClickStartAddPolyline={() => {}}
          onClickDrawPolyline={() => {}}
          onClickValidateAddPolyline={() => {}}
          onClickCancelAddPolyline={() => {}}
        />
      </MapContainer>,
    );

    // Second render
    rerender(
      <MapContainer>
        <MapAddPolylineControl
          mapMode="UNKNOWN_2"
          onClickStartAddPolyline={() => {}}
          onClickDrawPolyline={() => {}}
          onClickValidateAddPolyline={() => {}}
          onClickCancelAddPolyline={() => {}}
        />
      </MapContainer>,
    );

    // Gets the control.
    const container = await screen.findByLabelText("add-polyline-control");

    // Checks that the control is hidden.
    expect(container.style.visibility).toBe("hidden");
  });
});
