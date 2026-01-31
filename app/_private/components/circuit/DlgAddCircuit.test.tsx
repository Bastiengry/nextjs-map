import { fireEvent, render, screen, within } from "@testing-library/react";
import DlgAddCircuit from "./DlgAddCircuit";
import userEvent from "@testing-library/user-event";

jest.mock("primereact/colorpicker", () => ({
  ColorPicker: ({ value, onChange, id, ["aria-label"]: ariaLabel }: any) => (
    <input
      id={id}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange({ target: { value: e.target.value } })}
    />
  ),
}));

describe("DlgAddCircuit component", () => {
  test("should display well", async () => {
    render(
      <DlgAddCircuit
        geometry={{
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        }}
        onCancel={() => {}}
        onCreateCircuit={() => {}}
      />,
    );

    // Gets the dialog.
    const dlgAddCircuit = await screen.findByLabelText("dlg-add-circuit");

    // Checks the dialog label .
    within(dlgAddCircuit).getByText("dlgAddCircuit.title");

    // Gets the circuit label field.
    const circuitLabelField = within(dlgAddCircuit).getByLabelText(
      "circuit-label-field",
    );

    //Gets the label for the input representing the circuit label.
    const circuitLabelFieldLabel = within(circuitLabelField).getByLabelText(
      "circuit-label-field-label",
    );

    // Checks the label of the input for the circuit label.
    expect(circuitLabelFieldLabel).toHaveTextContent(
      "dlgAddCircuit.circuitLabelField.label",
    );

    // Checks the presence of the input for the circuit label.
    within(circuitLabelField).getByLabelText("circuit-label-field-input");

    // Gets the field for the color.
    const circuitColorField = within(dlgAddCircuit).getByLabelText(
      "circuit-color-field",
    );

    // Checks the label of the color field.
    expect(circuitColorField).toHaveTextContent(
      "dlgAddCircuit.circuitColorField.label",
    );

    // Checks the presence of the color picker.
    within(circuitColorField).getByRole("textbox", {
      name: "circuit-color-field-picker",
    });

    // Checks the presence of the button to validate.
    const validateBtn = within(dlgAddCircuit).getByLabelText("validate-button");
    expect(validateBtn).toHaveTextContent("dlgAddCircuit.validateBtn.label");

    // Checks the presence of the button to cancel.
    const cancelBtn = within(dlgAddCircuit).getByLabelText("cancel-button");
    expect(cancelBtn).toHaveTextContent("dlgAddCircuit.cancelBtn.label");
  });

  test("should call the good callback when clicking on the button to validate", async () => {
    const mockOnCreateCircuit = jest.fn();
    render(
      <DlgAddCircuit
        geometry={{
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        }}
        onCancel={() => {}}
        onCreateCircuit={mockOnCreateCircuit}
      />,
    );

    const dlgAddCircuit = await screen.findByLabelText("dlg-add-circuit");

    // Gets the circuit label field.
    const circuitLabelField = within(dlgAddCircuit).getByLabelText(
      "circuit-label-field",
    );

    // Gets the circuit label input.
    const circuitLabelFieldInput = within(circuitLabelField).getByLabelText(
      "circuit-label-field-input",
    );

    // Fills the circuit label input.
    await userEvent.type(circuitLabelFieldInput, "Circuit 1");

    // Gets the field for the color.
    const circuitColorField = within(dlgAddCircuit).getByLabelText(
      "circuit-color-field",
    );

    // Checks the color picker.
    const circuitColorPicker = within(circuitColorField).getByRole("textbox", {
      name: "circuit-color-field-picker",
    });

    // Sets the color.
    fireEvent.change(circuitColorPicker, { target: { value: "FF0000" } });

    // Checks the presence of the button to validate.
    const validateBtn = within(dlgAddCircuit).getByLabelText("validate-button");

    // Clicks on the button to validate.
    await userEvent.click(validateBtn);

    // Checks the call of the callback.
    expect(mockOnCreateCircuit).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "Circuit 1",
        color: "#FF0000",
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        },
      }),
    );
  });

  test("should call the good callback when clicking on the button to cancel", async () => {
    const mockOnCancel = jest.fn();
    render(
      <DlgAddCircuit
        geometry={{
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        }}
        onCancel={mockOnCancel}
        onCreateCircuit={() => {}}
      />,
    );

    const dlgAddCircuit = await screen.findByLabelText("dlg-add-circuit");

    // Checks the presence of the button to cancel.
    const cancelBtn = within(dlgAddCircuit).getByLabelText("cancel-button");

    // Clicks on the button to cancel.
    await userEvent.click(cancelBtn);

    // Checks the call of the callback.
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
