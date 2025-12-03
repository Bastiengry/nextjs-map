import { createContext } from "react";
import { Project } from "../types/Project";

export const ProjectContext = createContext<Project | undefined>(undefined);
