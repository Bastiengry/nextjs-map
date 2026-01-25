import { render, screen, within } from "@testing-library/react";
import DlgOpenProject from "./DlgOpenProject";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as projectQuery from "../../api/useProjectQuery";

jest.mock("../../api/useProjectQuery");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

(projectQuery.useProjectIdLabelQuery as jest.Mock).mockReturnValue({});

describe("DlgOpenProject component", () => {
  test("should display well", async () => {
    render(<DlgOpenProject onCancel={() => {}} onOpenProject={() => {}} />);

    const dlgOpenProject = await screen.findByLabelText("dlg-open-project");

    // Gets the project selector field.
    const projectLabelField = within(dlgOpenProject).getByLabelText(
      "project-selector-field",
    );

    // Checks the project selector label.
    within(projectLabelField).getByText("Project label");

    // Checks the presence of the selector for the project.
    within(projectLabelField).getByLabelText("project-selector-field-select");

    // Checks the presence of the button to validate.
    const validateBtn =
      within(dlgOpenProject).getByLabelText("validate-button");
    expect(validateBtn).toHaveTextContent("OK");

    // Checks that the validate button is disabled when no selection is done.
    expect(validateBtn).toBeDisabled();

    // Checks the presence of the button to cancel.
    const cancelBtn = within(dlgOpenProject).getByLabelText("cancel-button");
    expect(cancelBtn).toHaveTextContent("Cancel");
  });

  test("should call the good callback when clicking on the button to validate", async () => {
    const mockOnOpenProject = jest.fn();

    const mockData = [{ id: 101, label: "PRJ 1" }];
    (projectQuery.useProjectIdLabelQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DlgOpenProject onCancel={() => {}} onOpenProject={mockOnOpenProject} />
      </QueryClientProvider>,
    );

    const dlgOpenProject = await screen.findByLabelText("dlg-open-project");

    // Gets the project selector field.
    const projectSelectorField = within(dlgOpenProject).getByLabelText(
      "project-selector-field",
    );

    // Gets the drop down of the project selector field.
    const projectSelectorFieldDropDown = within(
      projectSelectorField,
    ).getByLabelText("project-selector-field-select");

    // Opens the drop down to select a project.
    const projectSelectorFieldDropDownRoot =
      projectSelectorFieldDropDown.closest(".p-dropdown");
    await userEvent.click(projectSelectorFieldDropDownRoot!, {
      pointerEventsCheck: 0,
    });

    // Selects the project in the list.
    const option = await screen.findByText("PRJ 1");
    await userEvent.click(option);

    // Checks the presence of the button to validate.
    const validateBtn =
      within(dlgOpenProject).getByLabelText("validate-button");

    // Clicks on the button to validate.
    await userEvent.click(validateBtn);

    // Checks the call of the callback.
    expect(mockOnOpenProject).toHaveBeenCalledWith(101);
  });

  test("should call the good callback when clicking on the button to cancel", async () => {
    const mockOnCancel = jest.fn();
    render(<DlgOpenProject onCancel={mockOnCancel} onOpenProject={() => {}} />);

    const dlgOpenProject = await screen.findByLabelText("dlg-open-project");

    // Checks the presence of the button to cancel.
    const cancelBtn = within(dlgOpenProject).getByLabelText("cancel-button");

    // Clicks on the button to cancel.
    await userEvent.click(cancelBtn);

    // Checks the call of the callback.
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
