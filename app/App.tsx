"use client";

import { useState } from "react";
import Header from "./_components/header/Header";
import MapWrapper from "./_components/map/MapWrapper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function App() {
  const [currentEditAction, setCurrentEditAction] = useState<
    string | undefined
  >();

  const [queryClient] = useState(() => new QueryClient());
  console.log("currentEditAction", currentEditAction);

  return (
    <QueryClientProvider client={queryClient}>
      <header className="card">
        <Header setCurrentEditAction={setCurrentEditAction} />
      </header>
      <main>
        <div className="w-full h-full flex">
          <MapWrapper
            mapProps={{
              position: { lat: 47.75, lng: 7.33333 },
              zoom: 100,
            }}
          />
        </div>
      </main>
    </QueryClientProvider>
  );
}
