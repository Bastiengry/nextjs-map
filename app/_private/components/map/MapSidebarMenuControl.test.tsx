import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
jest.mock("react-leaflet");
import { MapSidebarMenuControl } from "./MapSidebarMenuControl";
import { MapContainer, __resetMocks } from "@/__mocks__/react-leaflet";

describe("MapSidebarMenuControl component", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    __resetMocks();
  });

  test("should display on the map", async () => {
    render(
      <MapContainer>
        <MapSidebarMenuControl onClickOpenSideMenu={mockOnClick} />
      </MapContainer>,
    );

    const control = await screen.findByLabelText("sidebar-menu-control");

    // Gets the button of the control.
    const button = within(control).getByLabelText(
      "sidebar-menu-control-button",
    );

    // Checks the icon.
    expect(button).toHaveClass("pi-bars");
  });

  test("should call the good callback when clicking on the control", async () => {
    render(
      <MapContainer>
        <MapSidebarMenuControl onClickOpenSideMenu={mockOnClick} />
      </MapContainer>,
    );

    const control = await screen.findByLabelText("sidebar-menu-control");

    // Gets the button of the control.
    const button = within(control).getByLabelText(
      "sidebar-menu-control-button",
    );

    // Clicks on the button.
    await userEvent.click(button);

    // Cheks the call of the callback.
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("should update the callback but not the control itself when a refresh is triggered (thanks to useRef)", async () => {
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();

    const { rerender } = render(
      <MapContainer>
        <MapSidebarMenuControl onClickOpenSideMenu={firstCallback} />
      </MapContainer>,
    );

    // Second render
    rerender(
      <MapContainer>
        <MapSidebarMenuControl onClickOpenSideMenu={secondCallback} />
      </MapContainer>,
    );

    const control = await screen.findByLabelText("sidebar-menu-control");

    // Gets the button of the control.
    const button = within(control).getByLabelText(
      "sidebar-menu-control-button",
    );

    // Clicks on the button.
    await userEvent.click(button);

    // Checks that only the second callback has been called.
    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });
});
