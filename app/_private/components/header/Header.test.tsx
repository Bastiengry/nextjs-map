import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./Header";
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));
import { useSession, signOut } from "next-auth/react";
import { loginWithGoogle } from "../../actions/auth";

jest.mock("next-auth/react");
jest.mock("../../actions/auth", () => ({
  loginWithGoogle: jest.fn(),
}));

describe("Header component", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should display login menu when user is NOT authenticated", async () => {
    // Simulates an empty session
    (useSession as jest.Mock).mockReturnValue({ data: null });

    render(<Header />);

    // Checks the title.
    expect(screen.getByText("NextJS Map")).toBeInTheDocument();

    // Clicks on the user button.
    const userBtn = screen.getByLabelText("header-user-btn");
    await user.click(userBtn);

    // Checks the menu opened by the click on the user button.
    expect(screen.getByText("header.connectWithGoogle")).toBeInTheDocument();

    // Clicks on the option to log in with google.
    const loginGoogleOption = screen.getByText("header.connectWithGoogle");
    fireEvent.click(loginGoogleOption);

    // Checks the call of the API to log in with google.
    expect(loginWithGoogle).toHaveBeenCalled();
  });

  test("should display account info when user IS authenticated", async () => {
    // Simulates an active session
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "John Doe" } },
    });

    render(<Header />);

    // Clicks on the user button.
    const userBtn = screen.getByLabelText("header-user-btn");
    await user.click(userBtn);

    // Checks the menu opened by the click on the user button.
    expect(screen.getByText("Hi, John Doe")).toBeInTheDocument();
    expect(screen.getByText("header.disconnect")).toBeInTheDocument();

    // Clicks on the menu to disconnect the current user.
    const logoutOption = screen.getByText("header.disconnect");
    fireEvent.click(logoutOption);

    // Checks the call of the method to disconnect the current user.
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
