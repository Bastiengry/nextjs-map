export async function GET() {
  const data = [
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

  return Response.json(data);
}
