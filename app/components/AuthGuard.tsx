"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const pass = localStorage.getItem("auth");

    if (pass !== "ok") {
      const input = prompt("Contraseña:");

      if (input === "1234") {
        localStorage.setItem("auth", "ok");
      } else {
        alert("Acceso denegado");
        router.push("/");
      }
    }
  }, []);

  return <>{children}</>;
}