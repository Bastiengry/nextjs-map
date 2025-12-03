"use client";

import { useQuery } from "@tanstack/react-query";
import { Configuration } from "./Configuration";

export function useConfiguration(id: number | null | undefined) {
  return useQuery<Configuration>({
    queryKey: ["configuration", id],
    queryFn: async () => {
      const res = await fetch(`/api/configuration/${id}`);
      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
    enabled: !!id,
  });
}
