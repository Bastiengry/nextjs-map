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
  const project = await getProjectById(Number(id));
  return Response.json(project);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  const { id } = await context.params;

  await deleteProjectById(Number(id));

  return Response.json({
    id: id,
  });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json();

  const project = await updateProjectById(Number(id), body);

  return Response.json(project);
}
