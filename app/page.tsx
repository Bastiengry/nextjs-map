import { PrimeReactProvider } from "primereact/api";
import AppWithQueryClient from "./AppWithQueryClient";

export default function AppPage() {
  return (
    <PrimeReactProvider>
      <AppWithQueryClient />
    </PrimeReactProvider>
  );
}
