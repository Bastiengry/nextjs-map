jest.mock("../prisma", () => ({
  __esModule: true,
  default: {
    allowedUser: {
      findFirst: jest.fn(),
    },
  },
}));

import prisma from "../prisma";
import { isAllowedUser } from "./repository";

describe("AllowedUsers Backend API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return true is the user is allowed", async () => {
    // Mocks the query to get the first allowed user matching an email.
    (prisma.allowedUser.findFirst as jest.Mock).mockResolvedValue({
      email: "test@email.com",
    });

    // Launches the test.
    const result = await isAllowedUser("test@email.com");

    // Checks.
    expect(result).toBe(true);
  });

  it("should return false is the user is NOT allowed", async () => {
    (prisma.allowedUser.findFirst as jest.Mock).mockResolvedValue(null);

    // Launches the test.
    const result = await isAllowedUser("test@email.com");

    // Checks.
    expect(result).toBe(false);
  });
});
