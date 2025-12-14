"use server";

import { getProjectIdLabels } from "../repository";

export async function GET() {
  return Response.json(await getProjectIdLabels());
}
