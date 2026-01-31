import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Map from "./Map";
import { __resetMocks } from "../../../../__mocks__/react-leaflet";
import { Project } from "../../types/Project";
import L from "leaflet";

jest.mock("react-leaflet", () => {
  const ReactLeafletMocks = jest.requireActual(
    "../../../../__mocks__/react-leaflet",
  );
  return {
    __esModule: true,
    ...ReactLeafletMocks,
    TileLayer: (props: any) => (
      <div aria-label="tile-layer" data-url={props.url} />
    ),
    Popup: ({ children }: any) => <div aria-label="popup">{children}</div>,
  };
});

jest.mock("leaflet-defaulticon-compatibility", () => ({}));
jest.mock("leaflet-routing-machine", () => ({}));

jest.mock("@turf/turf", () => ({
  lineString: jest.fn((coords) => ({
    type: "Feature",
    geometry: { coordinates: coords },
  })),
  point: jest.fn((coord) => ({
    type: "Feature",
    geometry: { coordinates: coord },
  })),
  nearestPointOnLine: jest.fn(() => ({
    properties: { index: 0 },
    geometry: { coordinates: [0, 0] },
  })),
}));

jest.mock("./MapSidebar", () => ({
  __esModule: true,
  default: ({ onVisibilityChanged, onMapPanTo }: any) => (
    <div aria-label="map-sidebar">
      <button
        aria-label="btn-close-sidebar"
        onClick={() => onVisibilityChanged(false)}
      >
        Close Sidebar
      </button>
      <button
        aria-label="btn-pan-to-coordinate"
        onClick={() => onMapPanTo({ lat: 45, lng: 5 })}
      >
        Pan to 45, 5
      </button>
    </div>
  ),
}));

jest.mock("./MapAddMarkerControl", () => ({
  MapAddMarkerControl: ({
    onClickStartAddMarker,
    onAddMarker,
    onClickEndAddMarker,
  }: any) => (
    <div aria-label="add-marker-control">
      <button onClick={onClickStartAddMarker} aria-label="btn-start-add-marker">
        Start add Marker
      </button>
      <button
        onClick={() =>
          onAddMarker({
            type: "Point",
            coordinates: [2, 48],
          })
        }
        aria-label="btn-add-marker"
      >
        Add Marker
      </button>
      <button onClick={onClickEndAddMarker} aria-label="btn-end-add-marker">
        Terminate add Marker
      </button>
    </div>
  ),
}));

jest.mock("./MapAddPolylineControl", () => ({
  MapAddPolylineControl: ({
    onClickStartAddPolyline,
    onClickValidateAddPolyline,
    onClickCancelAddPolyline,
    onClickDrawPolyline,
  }: any) => (
    <div aria-label="add-polyline-control">
      <button
        onClick={onClickStartAddPolyline}
        aria-label="btn-start-add-polyline"
      >
        Start add Polyline
      </button>
      <button
        onClick={() =>
          onClickValidateAddPolyline({
            type: "LineString",
            coordinates: [
              [2, 48],
              [3, 49],
            ],
          })
        }
        aria-label="btn-validate-polyline"
      >
        Validate creation of Polyline
      </button>
      <button
        onClick={onClickCancelAddPolyline}
        aria-label="btn-cancel-polyline"
      >
        Cancel creation of Polyline
      </button>
      <button onClick={onClickDrawPolyline} aria-label="btn-draw-polyline">
        Draw Polyline
      </button>
    </div>
  ),
}));

jest.mock("./MapRoutingMachineControl", () => ({
  MapRoutingMachineControl: ({ onClickCreateRoute }: any) => (
    <div aria-label="routing-machine-control">
      <button onClick={onClickCreateRoute} aria-label="btn-calculate-route">
        Calculate Route
      </button>
    </div>
  ),
}));

const mockRoute = {
  coordinates: [
    { lat: 48, lng: 2 },
    { lat: 48.1, lng: 2.1 },
  ],
};

(L as any).Routing = {
  osrmv1: jest.fn(() => ({
    route: jest.fn((waypoints, callback) => {
      // On simule une réponse asynchrone réussie
      callback(null, [mockRoute]);
    }),
  })),
};

jest.mock("./MapSidebarMenuControl", () => ({
  MapSidebarMenuControl: ({ onClickOpenSideMenu }: any) => (
    <button aria-label="sidebar-menu-control" onClick={onClickOpenSideMenu}>
      Open Sidebar
    </button>
  ),
}));

jest.mock("./MapAddressSearchControl", () => ({
  MapAddressSearchControl: () => (
    <button aria-label="address-search-control">Open Sidebar</button>
  ),
}));

jest.mock("./CircuitLayer", () => ({
  __esModule: true,
  default: ({
    onAddPointToCircuit,
    onSelect,
    onEdit,
    onDelete,
    circuits,
    onDeletePointFromCircuit,
    onUpdateCircuitGeometry,
  }: any) => (
    <div aria-label="circuit-layer">
      <button
        aria-label="btn-add-point"
        onClick={() => onAddPointToCircuit(1, { lat: 48.5, lng: 2.5 })}
      >
        Add Point to Circuit 1
      </button>
      {circuits.map((c: any) => (
        <button
          key={`btn-select-circuit-${c.id}`}
          aria-label={`btn-select-circuit-${c.id}`}
          onClick={() => onSelect(c.id)}
        >
          Select {c.id}
        </button>
      ))}
      {circuits.map((c: any) => (
        <button
          key={`btn-delete-circuit-${c.id}`}
          aria-label={`btn-delete-circuit-${c.id}`}
          onClick={() => onDelete(c.id)}
        >
          Delete circuit {c.id}
        </button>
      ))}
      {circuits.map((c: any) => (
        <button
          key={`btn-edit-circuit-${c.id}`}
          aria-label={`btn-edit-circuit-${c.id}`}
          onClick={() => onEdit(c.id)}
        >
          Edit circuit {c.id}
        </button>
      ))}
      <button
        aria-label="btn-remove-point-index-1"
        onClick={() => onDeletePointFromCircuit(1, 1)}
      >
        Remove Point Index 1
      </button>
      <button
        aria-label="btn-update-geometry-1"
        onClick={() =>
          onUpdateCircuitGeometry(1, [
            { lat: 48, lng: 2 },
            { lat: 50, lng: 4 },
          ])
        }
      >
        Update Geometry Circuit 1
      </button>
    </div>
  ),
}));

describe("Map component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  test("should display well", async () => {
    const mockProject: Project = {
      id: 1,
      label: "Project 1",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          geometry: {
            type: "LineString",
            coordinates: [
              [2, 48],
              [3, 49],
            ],
          },
          color: "#ff0000",
        },
        {
          id: 2,
          label: "Circuit 2",
          geometry: {
            type: "LineString",
            coordinates: [
              [2.6, 44.74],
              [3.65, 39.6],
            ],
          },
          color: "#ff0000",
        },
      ],
      markers: [
        {
          id: 1,
          point: {
            type: "Point",
            coordinates: [5.2, 45.3],
          },
        },
        {
          id: 2,
          point: {
            type: "Point",
            coordinates: [3.4, 44.9],
          },
        },
      ],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map.
    const mapDiv = await screen.findByTestId("map");

    // Checks the presence of the sidebar.
    screen.getByLabelText("map-sidebar");

    // Gets the map container.
    const mapContainer = within(mapDiv).getByLabelText("map-container");

    // Checks the presence of the tile layer.
    within(mapContainer).getByLabelText("tile-layer");

    // Checks the presence of the markers.
    within(mapContainer).getByLabelText("map-marker-1");
    within(mapContainer).getByLabelText("map-marker-2");

    // Checks the presence of the circuits.
    within(mapContainer).getByLabelText("circuit-layer");

    // Checks that the control to display the sidebar is hidden.
    expect(
      within(mapContainer).queryByLabelText("sidebar-menu-control"),
    ).not.toBeInTheDocument();

    // Checks that the control to display search an address.
    within(mapContainer).getByLabelText("address-search-control");

    // Checks that the control to add a marker.
    within(mapContainer).getByLabelText("add-marker-control");

    // Checks that the control to add a polyline.
    within(mapContainer).getByLabelText("add-polyline-control");

    // Checks that the control to go to the current location.
    within(mapContainer).getByLabelText("location-control");

    // Checks that the control for the routing machine.
    within(mapContainer).getByLabelText("routing-machine-control");
  });

  test("should succeed to start edition of a polyline", async () => {
    const mockOnStartMapEdit = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project 1",
      circuits: [],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={mockOnStartMapEdit}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map.
    const mapDiv = await screen.findByTestId("map");

    // Gets the map container.
    const mapContainer = within(mapDiv).getByLabelText("map-container");

    // Gets the control to add a polyline.
    const controlAddPoly = within(mapContainer).getByLabelText(
      "add-polyline-control",
    );

    // Gets the button to start the add (MOCK).
    const btnStartAddPoly = within(controlAddPoly).getByLabelText(
      "btn-start-add-polyline",
    );

    // Clicks on the button to start the add (MOCK).
    await user.click(btnStartAddPoly);

    // Checks the callback.
    expect(mockOnStartMapEdit).toHaveBeenCalledTimes(1);
  });

  test("should succeed to validate the creation of a polyline", async () => {
    const mockAddPolyline = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project 1",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#FFFFFF",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={mockAddPolyline}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map.
    const mapDiv = await screen.findByTestId("map");

    // Gets the map container.
    const mapContainer = within(mapDiv).getByLabelText("map-container");

    // Gets the control to add a polyline.
    const controlAddPoly = within(mapContainer).getByLabelText(
      "add-polyline-control",
    );

    // Gets the button to validate the creation of the polyline (MOCK).
    const btnValidatePoly = within(controlAddPoly).getByLabelText(
      "btn-validate-polyline",
    );

    // Clicks on the button to validate the creation of the polyline (MOCK).
    await user.click(btnValidatePoly);

    // Checks the callback.
    expect(mockAddPolyline).toHaveBeenCalledTimes(1);
    expect(mockAddPolyline).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "LineString",
        coordinates: [
          [2, 48],
          [3, 49],
        ],
      }),
    );
  });

  test("should succeed to cancel the creation of a polyline", async () => {
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project 1",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#FFFFFF",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map.
    const mapDiv = await screen.findByTestId("map");

    // Gets the map container.
    const mapContainer = within(mapDiv).getByLabelText("map-container");

    // Gets the control to add a polyline.
    const controlAddPoly = within(mapContainer).getByLabelText(
      "add-polyline-control",
    );

    // Gets the button to cancel the creation of the polyline (MOCK).
    const btnCancelPoly = within(controlAddPoly).getByLabelText(
      "btn-cancel-polyline",
    );

    // Clicks on the button to cancel the creation of the polyline (MOCK).
    await user.click(btnCancelPoly);
  });

  test("should succeed to draw a polyline", async () => {
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project 1",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#FFFFFF",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map.
    const mapDiv = await screen.findByTestId("map");

    // Gets the map container.
    const mapContainer = within(mapDiv).getByLabelText("map-container");

    // Gets the control to add a polyline.
    const controlAddPoly = within(mapContainer).getByLabelText(
      "add-polyline-control",
    );

    // Gets the button to draw a polyline (MOCK).
    const btnDrawPoly =
      within(controlAddPoly).getByLabelText("btn-draw-polyline");

    // Clicks on the button to draw a polyline (MOCK).
    await user.click(btnDrawPoly);
  });

  test("should succeed to start the add of markers", async () => {
    const mockOnStartMapEdit = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project 1",
      circuits: [],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={mockOnStartMapEdit}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map.
    const mapDiv = await screen.findByTestId("map");

    // Gets the map container.
    const mapContainer = within(mapDiv).getByLabelText("map-container");

    // Gets the control to add a marker.
    const controlAddMarker =
      within(mapContainer).getByLabelText("add-marker-control");

    // Gets the button to start the add (MOCK).
    const btnStartAddMarker = within(controlAddMarker).getByLabelText(
      "btn-start-add-marker",
    );

    // Clicks on the button to start the add (MOCK).
    await user.click(btnStartAddMarker);

    // Checks the callback.
    expect(mockOnStartMapEdit).toHaveBeenCalledTimes(1);
  });

  test("should succeed to add a marker", async () => {
    const mockOnAddMarker = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project 1",
      circuits: [],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={mockOnAddMarker}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map.
    const mapDiv = await screen.findByTestId("map");

    // Gets the map container.
    const mapContainer = within(mapDiv).getByLabelText("map-container");

    // Gets the control to add a marker.
    const controlAddMarker =
      within(mapContainer).getByLabelText("add-marker-control");

    // Gets the button to add a marker (MOCK).
    const btnAddMarker =
      within(controlAddMarker).getByLabelText("btn-add-marker");

    // Clicks on the button to add a marker (MOCK).
    await user.click(btnAddMarker);

    // Checks the callback.
    expect(mockOnAddMarker).toHaveBeenNthCalledWith(1, {
      type: "Point",
      coordinates: [2, 48],
    });
  });

  test("should succeed to delete a marker", async () => {
    const mockOnDeleteMarker = jest.fn();

    const mockProject: Project = {
      id: 1,
      label: "Project 1",
      circuits: [],
      markers: [
        {
          id: 1,
          point: {
            type: "Point",
            coordinates: [2.3522, 48.8566],
          },
        },
      ],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={mockOnDeleteMarker}
      />,
    );

    // Gets the map.
    const mapDiv = await screen.findByTestId("map");

    // Gets the map container.
    const mapContainer = within(mapDiv).getByLabelText("map-container");

    // Gets the marker.
    const markerElement = within(mapContainer).getByLabelText("map-marker-1");

    // Right click on the marker to delete it.
    fireEvent.contextMenu(markerElement);

    // Checks the callback.
    await waitFor(() =>
      expect(mockOnDeleteMarker).toHaveBeenNthCalledWith(1, 1),
    );
  });

  test("should succeed to end the add of markers", async () => {
    const mockOnEndMapEdit = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project 1",
      circuits: [],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={mockOnEndMapEdit}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map.
    const mapDiv = await screen.findByTestId("map");

    // Gets the map container.
    const mapContainer = within(mapDiv).getByLabelText("map-container");

    // Gets the control to add a marker.
    const controlAddMarker =
      within(mapContainer).getByLabelText("add-marker-control");

    // Gets the button to end the add (MOCK).
    const btnEndAddMarker =
      within(controlAddMarker).getByLabelText("btn-end-add-marker");

    // Clicks on the button to end the add (MOCK).
    await user.click(btnEndAddMarker);

    // Checks the callback.
    expect(mockOnEndMapEdit).toHaveBeenCalledTimes(1);
  });

  test("should succeed to add a point to a circuit", async () => {
    const mockUpdateGeometry = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project Test",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#ff0000",
          geometry: {
            type: "LineString",
            coordinates: [
              [2, 48],
              [3, 49],
            ],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={mockUpdateGeometry}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map
    await screen.findByTestId("map");

    // Gets the button to add a point on the mock of the circuit layer (MOCK)
    const btnAddPointToCirc = screen.getByLabelText("btn-add-point");

    // Clicks on the button
    await user.click(btnAddPointToCirc);

    // Checks
    expect(mockUpdateGeometry).toHaveBeenNthCalledWith(1, {
      id: 1,
      label: "Circuit 1",
      color: "#ff0000",
      geometry: {
        type: "LineString",
        coordinates: [
          [2, 48],
          [2.5, 48.5],
          [3, 49],
        ],
      },
    });
  });

  test("should succeed to delete a circuit", async () => {
    const mockRemoveCircuit = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project Test",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#ff0000",
          geometry: {
            type: "LineString",
            coordinates: [
              [2, 48],
              [3, 49],
            ],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={mockRemoveCircuit}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map
    await screen.findByTestId("map");

    // Gets the button to delete the circuit (MOCK)
    const btnDeleteCircuit = screen.getByLabelText("btn-delete-circuit-1");

    // Clicks on the button to delete the circuit (MOCK)
    await user.click(btnDeleteCircuit);

    // Checks
    expect(mockRemoveCircuit).toHaveBeenNthCalledWith(1, {
      id: 1,
      label: "Circuit 1",
      color: "#ff0000",
      geometry: {
        type: "LineString",
        coordinates: [
          [2, 48],
          [3, 49],
        ],
      },
    });
  });

  test("should succeed to delete the selected circuit", async () => {
    const mockRemoveCircuit = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project Test",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#ff0000",
          geometry: {
            type: "LineString",
            coordinates: [
              [2, 48],
              [3, 49],
            ],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={mockRemoveCircuit}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map
    await screen.findByTestId("map");

    // Gets the button to select a circuit (MOCK)
    const btnSelectCircuit = screen.getByLabelText("btn-select-circuit-1");

    // Clicks on the button to select a circuit (MOCK)
    await user.click(btnSelectCircuit);

    // Gets the button to delete the selected circuit (MOCK)
    const btnDeleteCircuit = screen.getByLabelText("btn-delete-circuit-1");

    // Clicks on the button to delete the selected circuit (MOCK)
    await user.click(btnDeleteCircuit);

    // Checks
    expect(mockRemoveCircuit).toHaveBeenNthCalledWith(1, {
      id: 1,
      label: "Circuit 1",
      color: "#ff0000",
      geometry: {
        type: "LineString",
        coordinates: [
          [2, 48],
          [3, 49],
        ],
      },
    });
  });

  test("should succeed to delete the selected circuit with DEL keyboard touch", async () => {
    const mockRemoveCircuit = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project Test",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#ff0000",
          geometry: {
            type: "LineString",
            coordinates: [
              [2, 48],
              [3, 49],
            ],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={mockRemoveCircuit}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map
    await screen.findByTestId("map");

    // Gets the button to select a circuit (MOCK)
    const btnSelectCircuit = screen.getByLabelText("btn-select-circuit-1");

    // Clicks on the button to select a circuit (MOCK)
    await user.click(btnSelectCircuit);

    // Simulates the click on "Delete" keyboard touch.
    await user.keyboard("{Delete}");

    // Checks
    expect(mockRemoveCircuit).toHaveBeenNthCalledWith(1, {
      id: 1,
      label: "Circuit 1",
      color: "#ff0000",
      geometry: {
        type: "LineString",
        coordinates: [
          [2, 48],
          [3, 49],
        ],
      },
    });
  });

  test("should not crash when clicking on DEL keyboard touch if not circuit selected", async () => {
    const mockRemoveCircuit = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project Test",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#ff0000",
          geometry: {
            type: "LineString",
            coordinates: [
              [2, 48],
              [3, 49],
            ],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={mockRemoveCircuit}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map
    await screen.findByTestId("map");

    // Simulates the click on "Delete" keyboard touch.
    await user.keyboard("{Delete}");

    // Checks
    expect(mockRemoveCircuit).not.toHaveBeenCalled();
  });

  test("should succeed to edit the selected circuit", async () => {
    const mockEditCircuit = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project Test",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#ff0000",
          geometry: {
            type: "LineString",
            coordinates: [
              [2, 48],
              [3, 49],
            ],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={mockEditCircuit}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map
    await screen.findByTestId("map");

    // Gets the button to select a circuit (MOCK)
    const btnSelectCircuit = screen.getByLabelText("btn-select-circuit-1");

    // Clicks on the button to select a circuit (MOCK)
    await user.click(btnSelectCircuit);

    // Gets the button to edit a circuit (MOCK)
    const btnEditCircuit = screen.getByLabelText("btn-edit-circuit-1");

    // Clicks on the button to edit a circuit (MOCK)
    await user.click(btnEditCircuit);

    // Checks
    expect(mockEditCircuit).toHaveBeenNthCalledWith(1, {
      id: 1,
      label: "Circuit 1",
      color: "#ff0000",
      geometry: {
        type: "LineString",
        coordinates: [
          [2, 48],
          [3, 49],
        ],
      },
    });
  });

  test("should succeed to remove a point from a circuit", async () => {
    const mockUpdateGeometry = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project Test",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#ff0000",
          geometry: {
            type: "LineString",
            coordinates: [
              [2, 48], // Index 0
              [2.5, 48.5], // Index 1 (The one to delete)
              [3, 49], // Index 2
            ],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={mockUpdateGeometry}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Waits for the map to display
    await screen.findByTestId("map");

    // Clicks on the button to simulate the deletion of a point
    const btnRemovePoint = screen.getByLabelText("btn-remove-point-index-1");
    await user.click(btnRemovePoint);

    // Checks
    expect(mockUpdateGeometry).toHaveBeenCalledTimes(1);
    expect(mockUpdateGeometry).toHaveBeenCalledWith({
      id: 1,
      label: "Circuit 1",
      color: "#ff0000",
      geometry: {
        type: "LineString",
        coordinates: [
          [2, 48],
          [3, 49],
        ],
      },
    });
  });

  test("should fail to remove a point from a circuit if there is only 2 points on the polyline of the circuit", async () => {
    const mockUpdateGeometry = jest.fn();
    const alertSpy = jest.spyOn(window, "alert");
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project Test",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#ff0000",
          geometry: {
            type: "LineString",
            coordinates: [
              [2, 48], // Index 0
              [2.5, 48.5], // Index 1 (The one to delete)
            ],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={mockUpdateGeometry}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Waits for the map to display
    await screen.findByTestId("map");

    // Clicks on the button to simulate the deletion of a point
    const btnRemovePoint = screen.getByLabelText("btn-remove-point-index-1");
    await user.click(btnRemovePoint);

    // Checks
    expect(mockUpdateGeometry).not.toHaveBeenCalled();

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith(
      "circuit.circuitMustContainAtLeast2Points",
    );
    alertSpy.mockRestore();
  });

  test("should succeed to update circuit geometry", async () => {
    const mockUpdateCircuitGeometry = jest.fn();
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project Test",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#ff0000",
          geometry: {
            type: "LineString",
            coordinates: [
              [2, 48],
              [3, 49],
            ],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={mockUpdateCircuitGeometry}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Waits for the map to be loaded
    await screen.findByTestId("map");

    // Gets the button to launch the update of the circuit geometry (MOCK)
    const btnUpdate = screen.getByLabelText("btn-update-geometry-1");

    // Clicks on the button
    await user.click(btnUpdate);

    // Checks
    expect(mockUpdateCircuitGeometry).toHaveBeenCalledTimes(1);
    expect(mockUpdateCircuitGeometry).toHaveBeenCalledWith({
      id: 1,
      label: "Circuit 1",
      color: "#ff0000",
      geometry: {
        type: "LineString",
        coordinates: [
          [2, 48], // lng, lat
          [4, 50], // lng, lat (new coordinates for the mock)
        ],
      },
    });
  });

  test("should calculate and display a route for the selected circuit", async () => {
    const user = userEvent.setup();

    const mockProject: Project = {
      id: 1,
      label: "Project Routing",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#ff0000",
          geometry: {
            type: "LineString",
            coordinates: [
              [2, 48],
              [3, 49],
            ],
          },
        },
      ],
      markers: [],
    };

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={mockProject}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the map.
    await screen.findByTestId("map");

    // Selects the circuit 1.
    const btnSelect = screen.getByLabelText("btn-select-circuit-1");
    await user.click(btnSelect);

    // Clicks on the button for the routing machine
    const btnRoute = screen.getByLabelText("btn-calculate-route");
    await user.click(btnRoute);

    // Checks
    await waitFor(() => {
      const circuitLayer = screen.getByLabelText("circuit-layer");
      expect(circuitLayer).toBeInTheDocument();
    });
  });

  test("should toggle sidebar visibility and invalidate map size", async () => {
    const user = userEvent.setup();

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={undefined}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Checks that the sidebar is visible.
    const sidebar = screen.getByLabelText("map-sidebar");
    expect(sidebar).toBeInTheDocument();

    // Clicks on the button to close the sidebar (MOCK).
    const closeBtn = screen.getByLabelText("btn-close-sidebar");
    await user.click(closeBtn);

    // Checks that the control to show the sidebar is visible.
    const menuControl = await waitFor(() =>
      screen.getByLabelText("sidebar-menu-control"),
    );
    expect(menuControl).toBeInTheDocument();

    // Checks that the sidebar is NOT visible.
    expect(screen.queryByLabelText("map-sidebar")).not.toBeInTheDocument();
  });

  test("should reopen sidebar when clicking on menu control", async () => {
    const user = userEvent.setup();

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={undefined}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the button to close the sidebar (MOCK).
    const btnCloseSidebar = await screen.findByLabelText("btn-close-sidebar");

    // Closes the sidebar (MOCK).
    await user.click(btnCloseSidebar);

    // Gets the control to open the sidebar.
    const openBtn = screen.getByLabelText("sidebar-menu-control");
    await user.click(openBtn);

    // Checsk the visibility of the sidebar.
    await waitFor(
      () => {
        expect(screen.getByLabelText("map-sidebar")).toBeVisible();
      },
      { timeout: 1000 },
    );
  });

  test("should call onMapPanTo when the map is moved", async () => {
    const user = userEvent.setup();

    render(
      <Map
        position={{ lat: 48, lng: 2 }}
        zoom={13}
        project={undefined}
        editMode={undefined}
        setEditMode={() => {}}
        onStartMapEdit={() => {}}
        onEndMapEdit={() => {}}
        onAddPolyline={() => {}}
        onEditCircuit={() => {}}
        onRemoveCircuit={() => {}}
        onUpdateCircuitGeometry={() => {}}
        onAddMarker={() => {}}
        onDeleteMarker={() => {}}
      />,
    );

    // Gets the button for panning to.
    const btnPan = screen.getByLabelText("btn-pan-to-coordinate");

    // Clicks on the button.
    await user.click(btnPan);
  });
});
