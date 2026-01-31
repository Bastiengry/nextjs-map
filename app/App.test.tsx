import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { useSession } from "next-auth/react";
import * as projectQueries from "./_private/api/useProjectQuery";
jest.mock("./i18n", () => ({}));
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: { user: { name: "Test User" } },
    status: "authenticated",
  })),
}));
import App from "./App";
import userEvent from "@testing-library/user-event";

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
}));

jest.mock("./_private/api/useProjectQuery");

const mockSpyMapWrapper = jest.fn();
jest.mock("./_private/components/map/MapWrapper", () => (props: any) => {
  mockSpyMapWrapper(props);
  return (
    <div data-testid="map-wrapper">
      <button
        data-testid="simulate-start-map-edit"
        onClick={props.onStartMapEdit}
      >
        Start Edit
      </button>
      <button data-testid="simulate-end-map-edit" onClick={props.onEndMapEdit}>
        End Edit
      </button>
      <button
        data-testid="simulate-add-circuit-polyline-demanded"
        onClick={() =>
          props.onAddPolyline({ type: "LineString", coordinates: [] })
        }
      >
        Add Circuit Polyline demanded
      </button>
      <button
        data-testid="simulate-edit-circuit"
        onClick={() =>
          props.onEditCircuit({
            id: 1,
            label: "Circuit 1",
            color: "#000000",
            geometry: { type: "LineString", coordinates: [] },
          })
        }
      >
        Edit circuit
      </button>
      <button
        data-testid="simulate-update-circuit-geometry"
        onClick={() =>
          props.onUpdateCircuitGeometry({
            id: 1,
            label: "Circuit 1",
            color: "#000000",
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [1, 1],
                [2, 2],
              ],
            },
          })
        }
      >
        Update circuit geometry
      </button>
      <button
        data-testid="simulate-remove-circuit"
        onClick={() =>
          props.onRemoveCircuit({
            id: 1,
            label: "Circuit 1",
            color: "#000000",
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
          })
        }
      >
        Remove circuit
      </button>
      <button
        data-testid="simulate-add-marker"
        onClick={() =>
          props.onAddMarker({
            type: "Point",
            coordinates: [1, 1],
          })
        }
      >
        Add marker
      </button>
      <button
        data-testid="simulate-delete-marker"
        onClick={() => props.onDeleteMarker(1)}
      >
        Delete marker
      </button>
    </div>
  );
});

jest.mock("./_private/components/header/HeaderWrapper", () => () => (
  <div data-testid="header-wrapper" />
));

describe("App Component", () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Configuration by default of the session (user connected)
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Test User" } },
      status: "authenticated",
    });

    (projectQueries.useGetProject as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });
    (projectQueries.usePostProject as jest.Mock).mockReturnValue({
      mutate: mockMutate,
    });
    (projectQueries.usePutProject as jest.Mock).mockReturnValue({
      mutate: mockMutate,
    });
    (projectQueries.useDeleteProject as jest.Mock).mockReturnValue({
      mutate: mockMutate,
    });

    (projectQueries.useProjectIdLabelQuery as jest.Mock).mockReturnValue({
      data: [
        { id: 123, label: "Projet Existant" },
        { id: 456, label: "Autre Projet" },
      ],
      isLoading: false,
      error: null,
    });
  });

  test("should display nothing in <main> if user not connected", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<App />);

    // Checks the display of the <header> (header role = banner)
    const headerTag = await screen.findByRole("banner");
    expect(headerTag).not.toBeEmptyDOMElement();

    // Checks the display of the top header
    const headerWrapper = within(headerTag).queryByTestId("header-wrapper");
    expect(headerWrapper).toBeInTheDocument();

    // Checks the display of the <main>.
    const mainTag = screen.getByRole("main");
    expect(mainTag).toBeEmptyDOMElement();

    // Checks that the map is hidden.
    const mapWrapper = within(mainTag).queryByTestId("map-wrapper");
    expect(mapWrapper).not.toBeInTheDocument();
  });

  it("should display the toolbar and the map if the user is connected", async () => {
    render(<App />);

    // Checks the display of the <header> (header role = banner)
    const headerTag = await screen.findByRole("banner");
    expect(headerTag).not.toBeEmptyDOMElement();

    // Checks the display of the top header
    const headerWrapper = within(headerTag).queryByTestId("header-wrapper");
    expect(headerWrapper).toBeInTheDocument();

    // Checks the display of the project toolbar
    const projectToolbar = within(headerTag).getByLabelText("project-toolbar");
    expect(projectToolbar).toBeInTheDocument();

    // Checks the display of the <main>.
    const mainTag = screen.getByRole("main");
    expect(mainTag).not.toBeEmptyDOMElement();

    // Checks that the map is hidden.
    const mapWrapper = within(mainTag).queryByTestId("map-wrapper");
    expect(mapWrapper).toBeInTheDocument();
  });

  it("can open the dialog to create a new project when clicking on the button to do it", async () => {
    const user = userEvent.setup();

    render(<App />);

    // Gets the <header> (header role = banner)
    const headerTag = await screen.findByRole("banner");

    // Gets the project toolbar
    const projectToolbar = within(headerTag).getByLabelText("project-toolbar");

    // Gets the button to create a new project.
    const btnCreateProject = within(projectToolbar).getByLabelText(
      "create-project-button",
    );

    // Clicks on the button to create a project.
    await user.click(btnCreateProject);

    // Check that the dialog to create the project is displayed
    const dlgAddProject = screen.getByLabelText("dlg-add-project");
    expect(dlgAddProject).toBeInTheDocument();
  });

  it("should create a new project when validating it in the dialog to create a new project", async () => {
    const user = userEvent.setup();

    render(<App />);

    // Gets the <header> (header role = banner)
    const headerTag = await screen.findByRole("banner");

    // Gets the project toolbar
    const projectToolbar = within(headerTag).getByLabelText("project-toolbar");

    // Gets the button to create a new project.
    const btnCreateProject = within(projectToolbar).getByLabelText(
      "create-project-button",
    );

    // Clicks on the button to create a project.
    await user.click(btnCreateProject);

    // Check that the dialog to create the project is displayed
    const dlgAddProject = screen.getByLabelText("dlg-add-project");

    // Gets the field to type the project label.
    const projectLabelField = within(dlgAddProject).getByLabelText(
      "project-label-field-input",
    );

    // Sets the project label.
    await user.type(projectLabelField, "PRJ1");

    // Gets the button to validate.
    const btnValidateAddProject =
      within(dlgAddProject).getByLabelText("validate-button");

    // Clicks on the button to validate the creation of the project.
    await user.click(btnValidateAddProject);

    // Checks the call of the method to crete the project.
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "PRJ1",
      }),
    );

    // Checks that the dialog for the creation of the project is closed.
    expect(screen.queryByLabelText("dlg-add-project")).not.toBeInTheDocument();
  });

  it("should open an existing project when selected from the open dialog", async () => {
    const user = userEvent.setup();
    const projectIdToOpen = 123;

    render(<App />);

    // Gets the <header> tag.
    const headerTag = await screen.findByRole("banner");

    // Gets the project toolbar.
    const projectToolbar = within(headerTag).getByLabelText("project-toolbar");

    // Gets the button to open a project.
    const btnOpenProject = within(projectToolbar).getByLabelText(
      "open-project-button",
    );

    // Clicks on the button to open a project.
    await user.click(btnOpenProject);

    // Gets the dialog to select the project to open.
    const dlgOpenProject = screen.getByLabelText("dlg-open-project");
    expect(dlgOpenProject).toBeInTheDocument();

    // Opens the drop down.
    const dropdownTrigger = screen.getByRole("button", {
      name: /dlgOpenProject.projectSelector.dropdown.placeholder/i,
    });
    await user.click(dropdownTrigger);

    // Gets the good option.
    const option = await screen.findByText("Projet Existant");
    await user.click(option);

    // Clicks on the button to validate.
    const btnValidate = screen.getByLabelText("validate-button");
    await waitFor(() => expect(btnValidate).not.toBeDisabled());
    await user.click(btnValidate);

    // Checks the call of the REST API to get the data of the project to open.
    await waitFor(() => {
      expect(projectQueries.useGetProject).toHaveBeenCalledWith(
        undefined,
        projectIdToOpen, // ID of the selected project
      );
    });

    // Checks that the dialog to open a project is closed.
    expect(screen.queryByLabelText("dlg-open-project")).not.toBeInTheDocument();
  });

  it("should edit an existing project name when using the edit dialog", async () => {
    const user = userEvent.setup();
    const existingProjectId = 123;
    const newProjectLabel = "Projet Modifié";

    // Initializes the state with an already selected project
    (projectQueries.useGetProject as jest.Mock).mockReturnValue({
      data: { id: existingProjectId, label: "Ancien Nom" },
      isLoading: false,
    });

    render(<App />);

    // Gets the <header> tag.
    const headerTag = await screen.findByRole("banner");

    // Gets the project toolbar.
    const projectToolbar = within(headerTag).getByLabelText("project-toolbar");

    // Gets the edit button.
    const btnEdit = within(projectToolbar).getByLabelText(
      "projectToolbar.editBtn.label",
    );

    // Checks that the edit button is enabled.
    expect(btnEdit).not.toBeDisabled();

    // Clicks on the edit button.
    await user.click(btnEdit);

    // Gets the dialog to edit the project.
    const dlgEdit = await screen.findByLabelText("dlg-edit-project");
    expect(dlgEdit).toBeInTheDocument();

    // Gets the input to set the project label.
    const projectLabelInput = within(dlgEdit).getByLabelText(
      "project-label-field-input",
    );

    // Clears the input.
    await user.clear(projectLabelInput);

    // Sets a new project label.
    await user.type(projectLabelInput, newProjectLabel);

    // Validates the modification.
    const btnSave = within(dlgEdit).getByLabelText("validate-button");
    await user.click(btnSave);

    // Checks the call of the callback to save the change.
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingProjectId,
          label: newProjectLabel,
        }),
      );
    });

    // Checks that the dialog to edit a project is closed.
    await waitFor(() => {
      expect(
        screen.queryByLabelText("dlg-edit-project"),
      ).not.toBeInTheDocument();
    });
  });

  it("should delete the current project when selecting delete from the edit menu", async () => {
    const user = userEvent.setup();
    const projectIdToDelete = 123;

    // Initialization with a project loaded.
    (projectQueries.useGetProject as jest.Mock).mockReturnValue({
      data: { id: projectIdToDelete, label: "Projet à supprimer" },
      isLoading: false,
    });

    render(<App />);

    // Gets the expand menu of the split button where the Delete menu is located.
    const btnExpand = screen.getByLabelText("expand-edit-menu");
    await user.click(btnExpand);

    // Clicks on the Delete menu.
    const optionDelete = await screen.findByText(
      "projectToolbar.deleteBtn.label",
    );
    await user.click(optionDelete);

    // Checks the call of the callback to delete the project.
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(projectIdToDelete);
    });
  });

  it("should start map editing mode when the edit action is triggered", async () => {
    const user = userEvent.setup();

    // Initializes a project.
    (projectQueries.useGetProject as jest.Mock).mockReturnValue({
      data: { id: 123, label: "Test Project" },
      isLoading: false,
    });

    render(<App />);

    // Gets the map wrapper.
    const mapWrapper = screen.getByTestId("map-wrapper");

    // Clicks on the button to enter in the map edition.
    const btnSimulateStartMapEdit = within(mapWrapper).getByTestId(
      "simulate-start-map-edit",
    );
    await user.click(btnSimulateStartMapEdit);

    // Checks that the map entered in edit mode.
    expect(mockSpyMapWrapper).toHaveBeenCalledWith(
      expect.objectContaining({
        editMode: "EDIT_MAP",
      }),
    );
  });

  it("should end map editing mode when the edit action is triggered", async () => {
    const user = userEvent.setup();

    // Initializes a project.
    (projectQueries.useGetProject as jest.Mock).mockReturnValue({
      data: { id: 123, label: "Test Project" },
      isLoading: false,
    });

    render(<App />);

    // Gets the map wrapper.
    const mapWrapper = screen.getByTestId("map-wrapper");

    // Clicks on the button to leave the map edition.
    const btnSimulateEndMapEdit = within(mapWrapper).getByTestId(
      "simulate-end-map-edit",
    );
    await user.click(btnSimulateEndMapEdit);

    // Checks that the map entered in view mode.
    expect(mockSpyMapWrapper).toHaveBeenCalledWith(
      expect.objectContaining({
        editMode: "VIEW",
      }),
    );
  });

  it("should succeed to add a polyline to a circuit", async () => {
    const user = userEvent.setup();

    // Initializes a project.
    (projectQueries.useGetProject as jest.Mock).mockReturnValue({
      data: { id: 123, label: "Test Project" },
      isLoading: false,
    });

    render(<App />);

    // Gets the map wrapper.
    const mapWrapper = screen.getByTestId("map-wrapper");

    // Clicks on the button to add a polyline to a circuit.
    const btnSimulateAddCircuitPolylineDemanded = within(
      mapWrapper,
    ).getByTestId("simulate-add-circuit-polyline-demanded");
    await user.click(btnSimulateAddCircuitPolylineDemanded);

    // Checks that the map entered in CREATE_CIRCUIT mode.
    expect(mockSpyMapWrapper).toHaveBeenCalledWith(
      expect.objectContaining({
        editMode: "CREATE_CIRCUIT",
      }),
    );

    const dlgAddCircuit = await screen.findByLabelText("dlg-add-circuit");
    expect(dlgAddCircuit).toBeInTheDocument();

    // Gets the field to type the circuit label.
    const circuitLabelField = within(dlgAddCircuit).getByLabelText(
      "circuit-label-field-input",
    );

    // Sets the circuit label.
    await user.type(circuitLabelField, "Circuit 1");

    // Gets the button to validate.
    const btnValidateAddCircuit =
      within(dlgAddCircuit).getByLabelText("validate-button");

    // Clicks on the button to validate the creation of the circuit.
    await user.click(btnValidateAddCircuit);

    // Checks the call of the method to crete the circuit.
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 123,
        label: "Test Project",
        circuits: [
          {
            label: "Circuit 1",
            color: "#000000",
            geometry: { coordinates: [], type: "LineString" },
          },
        ],
      }),
    );

    // Checks that the dialog for the creation of the circuit is closed.
    expect(screen.queryByLabelText("dlg-add-circuit")).not.toBeInTheDocument();
  });

  it("should succeed to edit a circuit", async () => {
    const user = userEvent.setup();

    // Initializes a project.
    (projectQueries.useGetProject as jest.Mock).mockReturnValue({
      data: {
        id: 123,
        label: "Test Project",
        circuits: [
          {
            id: 1,
            label: "Circuit 1",
            color: "#000000",
            geometry: { coordinates: [], type: "LineString" },
          },
        ],
      },
      isLoading: false,
    });

    render(<App />);

    // Gets the map wrapper.
    const mapWrapper = screen.getByTestId("map-wrapper");

    // Clicks on the button to edit a circuit.
    const btnEditCircuit = within(mapWrapper).getByTestId(
      "simulate-edit-circuit",
    );
    await user.click(btnEditCircuit);

    // Checks that the map entered in EDIT_CIRCUIT mode.
    expect(mockSpyMapWrapper).toHaveBeenCalledWith(
      expect.objectContaining({
        editMode: "EDIT_CIRCUIT",
      }),
    );

    // Gets the dialog to edit a circuit.
    const dlgEditCircuit = await screen.findByLabelText("dlg-edit-circuit");

    // Gets the field to type the circuit label.
    const circuitLabelField = within(dlgEditCircuit).getByLabelText(
      "circuit-label-field-input",
    );

    // Sets the circuit label.
    await user.clear(circuitLabelField);
    await user.type(circuitLabelField, "Circuit 1 bis");

    // Gets the button to validate.
    const btnValidateEditCircuit =
      within(dlgEditCircuit).getByLabelText("validate-button");

    // Clicks on the button to validate the edition of the circuit.
    await user.click(btnValidateEditCircuit);

    // Checks the call of the method to crete the circuit.
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 123,
        label: "Test Project",
        circuits: [
          {
            id: 1,
            label: "Circuit 1 bis",
            color: "#000000",
            geometry: { coordinates: [], type: "LineString" },
          },
        ],
      }),
    );

    // Checks that the dialog for the edition of the circuit is closed.
    expect(screen.queryByLabelText("dlg-edit-circuit")).not.toBeInTheDocument();
  });

  it("should update circuit geometry when the map sends a geometry update", async () => {
    const user = userEvent.setup();
    const existingProjectId = 123;

    // Initializes a project with a circuit.
    const initialProject = {
      id: existingProjectId,
      label: "Projet Test",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#000000",
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        },
      ],
    };

    (projectQueries.useGetProject as jest.Mock).mockReturnValue({
      data: initialProject,
      isLoading: false,
    });

    render(<App />);

    // Gets the map wrapper.
    const mapWrapper = screen.getByTestId("map-wrapper");

    // Clicks on the button to update the circuit geometry.
    const btnUpdatedCircuitGeometry = within(mapWrapper).getByTestId(
      "simulate-update-circuit-geometry",
    );
    await user.click(btnUpdatedCircuitGeometry);

    // Checks the call of the API to save the modification.
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingProjectId,
          circuits: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              geometry: expect.objectContaining({
                coordinates: [
                  [0, 0],
                  [1, 1],
                  [2, 2],
                ],
              }),
            }),
          ]),
        }),
      );
    });

    // Checks that the app goes back to VIEW mode.
    expect(mockSpyMapWrapper).toHaveBeenLastCalledWith(
      expect.objectContaining({ editMode: "VIEW" }),
    );
  });

  it("should succeed to remove a circuit", async () => {
    const user = userEvent.setup();
    const existingProjectId = 123;

    // Initializes a project with a circuit.
    const initialProject = {
      id: existingProjectId,
      label: "Projet Test",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#000000",
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        },
      ],
    };

    (projectQueries.useGetProject as jest.Mock).mockReturnValue({
      data: initialProject,
      isLoading: false,
    });

    render(<App />);

    // Gets the map wrapper.
    const mapWrapper = screen.getByTestId("map-wrapper");

    // Clicks on the button to remove a circuit.
    const btnRemoveCircuit = within(mapWrapper).getByTestId(
      "simulate-remove-circuit",
    );
    await user.click(btnRemoveCircuit);

    // Checks the call of the API to save the deletion.
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingProjectId,
          circuits: [],
        }),
      );
    });

    // Checks that the app goes back to VIEW mode.
    expect(mockSpyMapWrapper).toHaveBeenLastCalledWith(
      expect.objectContaining({ editMode: "VIEW" }),
    );
  });

  it("should succeed to add a marker", async () => {
    const user = userEvent.setup();
    const existingProjectId = 123;

    // Initializes a project with a circuit.
    const initialProject = {
      id: existingProjectId,
      label: "Projet Test",
      markers: undefined,
    };

    (projectQueries.useGetProject as jest.Mock).mockReturnValue({
      data: initialProject,
      isLoading: false,
    });

    render(<App />);

    // Gets the map wrapper.
    const mapWrapper = screen.getByTestId("map-wrapper");

    // Clicks on the button to add a marker.
    const btnAddMarker = within(mapWrapper).getByTestId("simulate-add-marker");
    await user.click(btnAddMarker);

    // Checks the call of the API to save the add of the marker.
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 123,
          label: "Projet Test",
          markers: [
            {
              point: {
                type: "Point",
                coordinates: [1, 1],
              },
            },
          ],
        }),
      );
    });

    // Checks that the app goes back to VIEW mode.
    expect(mockSpyMapWrapper).toHaveBeenLastCalledWith(
      expect.objectContaining({ editMode: "VIEW" }),
    );
  });

  it("should succeed to delete a marker", async () => {
    const user = userEvent.setup();
    const existingProjectId = 123;

    // Initializes a project with a circuit.
    const initialProject = {
      id: existingProjectId,
      label: "Projet Test",
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

    (projectQueries.useGetProject as jest.Mock).mockReturnValue({
      data: initialProject,
      isLoading: false,
    });

    render(<App />);

    // Gets the map wrapper.
    const mapWrapper = screen.getByTestId("map-wrapper");

    // Clicks on the button to delete a marker.
    const btnDeleteMarker = within(mapWrapper).getByTestId(
      "simulate-delete-marker",
    );
    await user.click(btnDeleteMarker);

    // Checks the call of the API to save the deletion.
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 123,
          label: "Projet Test",
          markers: [],
        }),
      );
    });
  });
});
