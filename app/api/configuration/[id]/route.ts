import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<Response> {
  const { id } = await context.params;
  const parsedId = Number(id);

  const confs = [
    {
      id: 1,
      label: "Conf1",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          pts: [
            { label: "Point 1", id: 1, position: { lat: 47.75, lng: 7.33333 } },
            { label: "Point 2", id: 2, position: { lat: 47.79, lng: 7.374 } },
          ],
        },
      ],
    },
  ];

  const conf = confs.find((conf) => conf.id === Number(parsedId));
  return conf
    ? Response.json(conf)
    : Response.json(
        { error: "Not found configuration" + parsedId },
        { status: 404 }
      );
}
