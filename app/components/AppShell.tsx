"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Usuario = {
  nombre: string;
  email: string | null;
  rol: "admin" | "direccion" | "agente";
};

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("faraway_user");

    if (data) {
      try {
        setUsuario(JSON.parse(data));
      } catch (error) {
        console.error("Error al leer el usuario:", error);
        localStorage.removeItem("faraway_user");
        window.location.href = "/";
      }
    } else if (pathname !== "/") {
      window.location.href = "/";
    }
  }, [pathname]);

  const salir = () => {
    localStorage.removeItem("faraway_user");
    window.location.href = "/";
  };

  const puedeVerReportes =
    usuario?.rol === "admin" || usuario?.rol === "direccion";

  if (pathname === "/") {
    return <>{children}</>;
  }

  if (!usuario) {
    return null;
  }

  return (
    <>
      <nav className="flex flex-wrap items-center gap-5 bg-blue-950 px-6 py-2 text-white">
        <Link href="/clientes" className="flex items-center">
          <img
            src="/faraway-premium.png"
            alt="Viajes Far Away Premium Mobility"
            className="h-20 w-auto object-contain"
          />
        </Link>

        <span className="text-lg font-bold">
          Far Away Manager
        </span>

        <Link
          href="/clientes"
          className="transition hover:text-blue-200"
        >
          Clientes
        </Link>

        <Link
          href="/cotizador"
          className="transition hover:text-blue-200"
        >
          Cotizador
        </Link>

        <Link
          href="/tarifario"
          className="transition hover:text-blue-200"
        >
          Tarifario
        </Link>

        <Link
          href="/mobility"
          className="transition hover:text-blue-200"
        >
          Mobility
        </Link>

        {puedeVerReportes && (
          <Link
            href="/reportes"
            className="transition hover:text-blue-200"
          >
            Reportes
          </Link>
        )}

        {puedeVerReportes && (
          <Link
            href="/dashboard"
            className="transition hover:text-blue-200"
          >
            Dashboard
          </Link>
        )}

        <div className="ml-auto whitespace-nowrap text-sm">
          {usuario.nombre} / {usuario.rol}
        </div>

        <button
          type="button"
          onClick={salir}
          className="rounded bg-red-600 px-3 py-1 text-white transition hover:bg-red-700"
        >
          Salir
        </button>
      </nav>

      <main className="p-6">{children}</main>
    </>
  );
}