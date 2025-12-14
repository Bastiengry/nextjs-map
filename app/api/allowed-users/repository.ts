import prisma from "../prisma";

export const isAllowedUser = async (email: string): Promise<boolean> => {
  const allowedUser = await prisma.allowedUser.findFirst({
    where: { email },
  });
  return !!allowedUser;
};
