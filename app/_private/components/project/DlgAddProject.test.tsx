import { render, screen, within } from "@testing-library/react";
import DlgAddProject from "./DlgAddProject";
import userEvent from "@testing-library/user-event";

describe("DlgAddProject component", () => {
  test("should display well", async () => {
    render(<DlgAddProject onCancel={() => {}} onCreateProject={() => {}} />);

    // Gets the dialog.
    const dlgAddProject = await screen.findByLabelText("dlg-add-project");

    // Checks the dialog label .
    within(dlgAddProject).getByText("dlgAddProject.title");

    // Gets the project label field.
    const projectLabelField = within(dlgAddProject).getByLabelText(
      "project-label-field",
    );

    //Gets the label for the input representing the project label.
    const projectLabelFieldLabel = within(projectLabelField).getByLabelText(
      "project-label-field-label",
    );

    // Checks the label of the input for the project label.
    expect(projectLabelFieldLabel).toHaveTextContent(
      "dlgAddProject.projectLabelField.label",
    );

    // Checks the presence of the input for the project label.
    within(projectLabelField).getByLabelText("project-label-field-input");

    // Checks the presence of the button to validate.
    const validateBtn = within(dlgAddProject).getByLabelText("validate-button");
    expect(validateBtn).toHaveTextContent("dlgAddProject.validateBtn.label");

    // Checks the presence of the button to cancel.
    const cancelBtn = within(dlgAddProject).getByLabelText("cancel-button");
    expect(cancelBtn).toHaveTextContent("dlgAddProject.cancelBtn.label");
  });

  test("should call the good callback when clicking on the button to validate", async () => {
    const mockOnCreateProject = jest.fn();
    render(
      <DlgAddProject
        onCancel={() => {}}
        onCreateProject={mockOnCreateProject}
      />,
    );

    const dlgAddProject = await screen.findByLabelText("dlg-add-project");

    // Gets the project label field.
    const projectLabelField = within(dlgAddProject).getByLabelText(
      "project-label-field",
    );

    // Gets the project label input.
    const projectLabelFieldInput = within(projectLabelField).getByLabelText(
      "project-label-field-input",
    );

    // Fills the project label input.
    await userEvent.type(projectLabelFieldInput, "PRJ 1");

    // Checks the presence of the button to validate.
    const validateBtn = within(dlgAddProject).getByLabelText("validate-button");

    // Clicks on the button to validate.
    await userEvent.click(validateBtn);

    // Checks the call of the callback.
    expect(mockOnCreateProject).toHaveBeenCalledWith({
      label: "PRJ 1",
    });
  });

  test("should call the good callback when clicking on the button to cancel", async () => {
    const mockOnCancel = jest.fn();
    render(
      <DlgAddProject onCancel={mockOnCancel} onCreateProject={() => {}} />,
    );

    const dlgAddProject = await screen.findByLabelText("dlg-add-project");

    // Checks the presence of the button to cancel.
    const cancelBtn = within(dlgAddProject).getByLabelText("cancel-button");

    // Clicks on the button to cancel.
    await userEvent.click(cancelBtn);

    // Checks the call of the callback.
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
