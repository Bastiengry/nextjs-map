"use server";

import { isAllowedUser } from "../repository";

export async function POST(request: Request) {
  const { ...email } = await request.json();

  let isAllowed = false;
  if (email) {
    isAllowed = await isAllowedUser(email);
  }

  return Response.json({ isAllowed: isAllowed });
}
