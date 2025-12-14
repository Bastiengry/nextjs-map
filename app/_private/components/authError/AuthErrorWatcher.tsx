"use client";

import { useSearchParams } from "next/navigation";
import { Toast } from "primereact/toast";
import { useEffect, useRef } from "react";

export default function AuthErrorWatcher() {
  const searchParams = useSearchParams();
  const toast = useRef<Toast>(null);
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "AccessDenied") {
      toast.current?.show({
        severity: "error",
        summary: "Access denied",
        detail: "You are not allowed to access this app.",
        life: 5000,
      });
    }
  }, [error]);

  return <Toast ref={toast} position="top-center" />;
}
