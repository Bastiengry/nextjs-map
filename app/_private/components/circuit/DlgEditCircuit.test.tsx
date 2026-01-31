import { fireEvent, render, screen, within } from "@testing-library/react";
import DlgEditCircuit from "./DlgEditCircuit";
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

describe("DlgEditCircuit component", () => {
  test("should display well", async () => {
    render(
      <DlgEditCircuit
        circuit={{
          id: 1,
          label: "Circuit 1",
          color: "#123456",
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        }}
        onCancel={() => {}}
        onSaveCircuit={() => {}}
      />,
    );

    // Gets the dialog.
    const dlgEditCircuit = await screen.findByLabelText("dlg-edit-circuit");

    // Checks the dialog label .
    within(dlgEditCircuit).getByText("dlgEditCircuit.title");

    // Gets the circuit label field.
    const circuitLabelField = within(dlgEditCircuit).getByLabelText(
      "circuit-label-field",
    );

    //Gets the label for the input representing the circuit label.
    const circuitLabelFieldLabel = within(circuitLabelField).getByLabelText(
      "circuit-label-field-label",
    );

    // Checks the label of the input for the circuit label.
    expect(circuitLabelFieldLabel).toHaveTextContent(
      "dlgEditCircuit.circuitLabelField.label",
    );

    // Checks the presence of the input for the circuit label.
    within(circuitLabelField).getByLabelText("circuit-label-field-input");

    // Gets the field for the color.
    const circuitColorField = within(dlgEditCircuit).getByLabelText(
      "circuit-color-field",
    );

    // Checks the label of the color field.
    expect(circuitColorField).toHaveTextContent(
      "dlgEditCircuit.circuitColorField.label",
    );

    // Checks the presence of the color picker.
    within(circuitColorField).getByRole("textbox", {
      name: "circuit-color-field-picker",
    });

    // Checks the presence of the button to validate.
    const validateBtn =
      within(dlgEditCircuit).getByLabelText("validate-button");
    expect(validateBtn).toHaveTextContent("dlgEditCircuit.validateBtn.label");

    // Checks the presence of the button to cancel.
    const cancelBtn = within(dlgEditCircuit).getByLabelText("cancel-button");
    expect(cancelBtn).toHaveTextContent("dlgEditCircuit.cancelBtn.label");
  });

  test("should call the good callback when clicking on the button to save the modification", async () => {
    const mockOnSaveCircuit = jest.fn();
    render(
      <DlgEditCircuit
        circuit={{
          id: 1,
          label: "Circuit 1",
          color: "#123456",
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        }}
        onCancel={() => {}}
        onSaveCircuit={mockOnSaveCircuit}
      />,
    );

    const dlgEditCircuit = await screen.findByLabelText("dlg-edit-circuit");

    // Gets the circuit label field.
    const circuitLabelField = within(dlgEditCircuit).getByLabelText(
      "circuit-label-field",
    );

    // Gets the circuit label input.
    const circuitLabelFieldInput = within(circuitLabelField).getByLabelText(
      "circuit-label-field-input",
    );

    // Fills the circuit label input.
    await userEvent.clear(circuitLabelFieldInput);
    await userEvent.type(circuitLabelFieldInput, "Circuit 1 MODIFIED");

    // Gets the field for the color.
    const circuitColorField = within(dlgEditCircuit).getByLabelText(
      "circuit-color-field",
    );

    // Checks the color picker.
    const circuitColorPicker = within(circuitColorField).getByRole("textbox", {
      name: "circuit-color-field-picker",
    });

    // Sets the color.
    fireEvent.change(circuitColorPicker, { target: { value: "FF00FF" } });

    // Checks the presence of the button to validate.
    const validateBtn =
      within(dlgEditCircuit).getByLabelText("validate-button");

    // Clicks on the button to validate.
    await userEvent.click(validateBtn);

    // Checks the call of the callback.
    expect(mockOnSaveCircuit).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "Circuit 1 MODIFIED",
        color: "#FF00FF",
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

  test("should call the good callback when clicking on the button to cancel the modification", async () => {
    const mockOnCancel = jest.fn();
    render(
      <DlgEditCircuit
        circuit={{
          id: 1,
          label: "Circuit 1",
          color: "#123456",
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        }}
        onCancel={mockOnCancel}
        onSaveCircuit={() => {}}
      />,
    );

    const dlgEditCircuit = await screen.findByLabelText("dlg-edit-circuit");

    // Checks the presence of the button to cancel.
    const cancelBtn = within(dlgEditCircuit).getByLabelText("cancel-button");

    // Clicks on the button to cancel.
    await userEvent.click(cancelBtn);

    // Checks the call of the callback.
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
