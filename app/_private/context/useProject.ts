import { useContext } from "react";
import { Project } from "@/app/_private/types/Project";
import { ProjectContext } from "./ProjectContext";

export default function useProjectContext() {
  return useContext<Project | undefined>(ProjectContext);
}
