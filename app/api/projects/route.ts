"use server";

import { createProject, getAllProjects } from "./repository";

export async function GET() {
  return Response.json(await getAllProjects());
}

export async function POST(request: Request) {
  const body = await request.json();

  const project = await createProject(body);

  return Response.json(project);
}
