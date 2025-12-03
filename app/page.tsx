import MapWrapper from "./_components/MapWrapper";

export default function Home() {
  return (
    <>
      <header>NextJS MAP</header>
      <main>
        <MapWrapper position={{ lat: 47.75, lng: 7.33333 }} zoom={100} />
      </main>
    </>
  );
}
