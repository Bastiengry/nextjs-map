"use client";

import dynamic from "next/dynamic";
import { ProjectToolbarProps } from "./ProjectToolbar";

const ProjectToolbar = dynamic(() => import("./ProjectToolbar"), {
  ssr: false,
});

export default function ProjectToolbarWrapper(props: ProjectToolbarProps) {
  return <ProjectToolbar {...props} />;
}
