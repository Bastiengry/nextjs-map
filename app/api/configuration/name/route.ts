export async function GET() {
  const confNames = [
    { id: 1, label: "Conf1" },
    { id: 2, label: "Conf2" },
  ];

  return Response.json(confNames);
}
