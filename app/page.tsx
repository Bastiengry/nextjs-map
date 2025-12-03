import { PrimeReactProvider } from "primereact/api";
import App from "./App";

export default function AppPage() {
  return (
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  );
}
