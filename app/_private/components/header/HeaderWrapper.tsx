"use client";

import dynamic from "next/dynamic";
import { HeaderProps } from "./Header";

const Header = dynamic(() => import("./Header"), {
  ssr: false,
});

export default function HeaderWrapper(props: HeaderProps) {
  return <Header {...props} />;
}
