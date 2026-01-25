import { render, screen, within } from "@testing-library/react";
import DlgEditProject from "./DlgEditProject";
import userEvent from "@testing-library/user-event";
import { Project } from "../../types/Project";

describe("DlgEditProject component", () => {
  test("should display well", async () => {
    const mockProject: Project = {
      id: 1,
      label: "PRJ1",
    };
    render(
      <DlgEditProject
        project={mockProject}
        onCancel={() => {}}
        onSaveProject={() => {}}
      />,
    );

    const dlgEditProject = await screen.findByLabelText("dlg-edit-project");

    // Gets the project label field.
    const projectLabelField = within(dlgEditProject).getByLabelText(
      "project-label-field",
    );

    // Checks the project label (label).
    within(projectLabelField).getByText("Project label");

    // Checks the presence of the input for the project label.
    within(projectLabelField).getByLabelText("project-label-field-input");

    // Checks the presence of the button to validate.
    const validateBtn =
      within(dlgEditProject).getByLabelText("validate-button");
    expect(validateBtn).toHaveTextContent("OK");

    // Checks the presence of the button to cancel.
    const cancelBtn = within(dlgEditProject).getByLabelText("cancel-button");
    expect(cancelBtn).toHaveTextContent("Cancel");
  });

  test("should call the good callback when clicking on the button to validate", async () => {
    const mockProject: Project = {
      id: 1,
      label: "PRJ1",
    };

    const mockOnSaveProject = jest.fn();

    render(
      <DlgEditProject
        project={mockProject}
        onCancel={() => {}}
        onSaveProject={mockOnSaveProject}
      />,
    );

    const dlgEditProject = await screen.findByLabelText("dlg-edit-project");

    // Gets the project label field.
    const projectLabelField = within(dlgEditProject).getByLabelText(
      "project-label-field",
    );

    // Gets the project label input.
    const projectLabelFieldInput = within(projectLabelField).getByLabelText(
      "project-label-field-input",
    );

    // Fills the project label input.
    await userEvent.clear(projectLabelFieldInput);
    await userEvent.type(projectLabelFieldInput, "PRJ 1 BIS");

    // Checks the presence of the button to validate.
    const validateBtn =
      within(dlgEditProject).getByLabelText("validate-button");

    // Clicks on the button to validate.
    await userEvent.click(validateBtn);

    // Checks the call of the callback.
    expect(mockOnSaveProject).toHaveBeenCalledWith({
      id: 1,
      label: "PRJ 1 BIS",
    });
  });

  test("should call the good callback when clicking on the button to cancel", async () => {
    const mockProject: Project = {
      id: 1,
      label: "PRJ1",
    };
    const mockOnCancel = jest.fn();

    render(
      <DlgEditProject
        project={mockProject}
        onCancel={mockOnCancel}
        onSaveProject={() => {}}
      />,
    );

    const dlgEditProject = await screen.findByLabelText("dlg-edit-project");

    // Checks the presence of the button to cancel.
    const cancelBtn = within(dlgEditProject).getByLabelText("cancel-button");

    // Clicks on the button to cancel.
    await userEvent.click(cancelBtn);

    // Checks the call of the callback.
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
