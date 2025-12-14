import { NextRequest } from "next/server";
import {
  deleteProjectById,
  getProjectById,
  updateProjectById,
} from "../repository";

export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<Response> {
  const { id } = await context.params;

  let project = undefined;
  if (id) {
    project = await getProjectById(Number(id));
  }

  return Response.json(project);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  const { id } = await context.params;

  if (id) {
    await deleteProjectById(Number(id));
  }

  return Response.json({
    id,
  });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json();

  let project = undefined;

  if (id && body) {
    project = await updateProjectById(Number(id), body);
  }

  return Response.json(project);
}
