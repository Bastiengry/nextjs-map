import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MapSidebar from "./MapSidebar";
import { Project } from "../../types/Project";

describe("The MapSidebar component ", () => {
  it("should display well", async () => {
    // Creates the dummy project.
    const dummyProject: Project = {
      id: 1,
      label: "Project 1",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#101010",
          geometry: {
            type: "LineString",
            coordinates: [
              [10.2, 20.3],
              [5, 10.3],
            ],
          },
        },
      ],
    };

    render(
      <MapSidebar
        project={dummyProject}
        onVisibilityChanged={() => {}}
        onMapPanTo={() => {}}
      />,
    );

    const mapSideBarElem = await screen.findByLabelText("map-sidebar");

    // Check the presence of the title.
    const titleElem = within(mapSideBarElem).getByLabelText("title");
    expect(titleElem).toHaveTextContent("Project details");

    // Check the presence of the close button.
    within(mapSideBarElem).getByLabelText("close-button");

    // Check the "circuits" menu.
    const circuitsMenu = within(mapSideBarElem).getByLabelText("circuits-menu");

    // Gets the expand menu icon in the header of the circuits menu.
    const circuitsExpandMenuIcon =
      within(circuitsMenu).getByLabelText("expand-menu");

    // Click to develop circuit menu.
    await waitFor(() => userEvent.click(circuitsExpandMenuIcon));

    // Checks that the menu item linked to the circuit is displayed.
    const circuit1MenuItem = within(circuitsMenu).getByLabelText(
      "circuit-menu-item-renderer-1",
    );

    // Checks the presence of the label of the circuit.
    const circuit1MenuItemLabelElem =
      within(circuit1MenuItem).getByLabelText("circuit-label");
    expect(circuit1MenuItemLabelElem).toHaveTextContent("Circuit 1");

    // Checks the presence of the color of the circuit.
    const circuit1MenuItemColorElem =
      within(circuit1MenuItem).getByLabelText("circuit-color");
    expect(circuit1MenuItemColorElem).toHaveStyle({
      "background-color": "#101010",
    });

    // Checks the presence of the locate button.
    within(circuit1MenuItem).getByLabelText("locate-button");
  });

  it("reacts to a click on close button", async () => {
    // Creates the dummy project.
    const dummyProject: Project = {
      id: 1,
      label: "Project 1",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#101010",
          geometry: {
            type: "LineString",
            coordinates: [
              [10.2, 20.3],
              [5, 10.3],
            ],
          },
        },
      ],
    };

    // Intercepts the "close" button callback.
    const mockCloseBtnCallback = jest.fn();

    render(
      <MapSidebar
        project={dummyProject}
        onVisibilityChanged={mockCloseBtnCallback}
        onMapPanTo={() => {}}
      />,
    );

    // Get the sidebar.
    const mapSideBarElem = await screen.findByLabelText("map-sidebar");

    // Check the presence of the close button.
    const closeBtn = within(mapSideBarElem).getByLabelText("close-button");

    // Click on the "close" button.
    await waitFor(() => userEvent.click(closeBtn));

    // Check that the "close" callback has been called.
    expect(mockCloseBtnCallback).toHaveBeenLastCalledWith(false);
  });

  it("reacts to a click on locate button", async () => {
    // Creates the dummy project.
    const dummyProject: Project = {
      id: 1,
      label: "Project 1",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#101010",
          geometry: {
            type: "LineString",
            coordinates: [
              [10.2, 20.3],
              [5, 10.3],
            ],
          },
        },
      ],
    };

    // Intercepts the "locate" button callback.
    const mockLocateBtnCallback = jest.fn();

    render(
      <MapSidebar
        project={dummyProject}
        onVisibilityChanged={() => {}}
        onMapPanTo={mockLocateBtnCallback}
      />,
    );

    // Get the sidebar.
    const mapSideBarElem = await screen.findByLabelText("map-sidebar");

    // Check the "circuits" menu.
    const circuitsMenu = within(mapSideBarElem).getByLabelText("circuits-menu");

    // Gets the expand menu icon in the header of the circuits menu.
    const circuitsExpandMenuIcon =
      within(circuitsMenu).getByLabelText("expand-menu");

    // Click to develop circuit menu.
    await waitFor(() => userEvent.click(circuitsExpandMenuIcon));

    // Check the presence of the locate button.
    const locateBtn = within(mapSideBarElem).getByLabelText("locate-button");

    // Click on the "locate" button.
    await waitFor(() => userEvent.click(locateBtn));

    // Check that the "locate" callback has been called.
    expect(mockLocateBtnCallback).toHaveBeenLastCalledWith({
      lat: 20.3,
      lng: 10.2,
    });
  });
});
