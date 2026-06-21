"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Reportes() {
  const router = useRouter();

  useEffect(() => {
    const autorizado = sessionStorage.getItem("reportes_ok");

    if (!autorizado) {
      const pass = prompt("Ingrese contraseña para acceder a Reportes");

      if (pass === "faraway2026") {
        sessionStorage.setItem("reportes_ok", "1");
      } else {
        alert("Acceso denegado");
        router.push("/");
      }
    }
  }, [router]);

 return (
  <div className="p-6">
    <h1 className="text-2xl font-semibold text-blue-950 mb-6">
      Reportes 📊
    </h1>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

      <div className="bg-blue-950 text-white p-4 rounded">
        <div className="text-sm">Total clientes</div>
        <div className="text-3xl font-bold">0</div>
      </div>

      <div className="bg-green-600 text-white p-4 rounded">
        <div className="text-sm">Personal</div>
        <div className="text-3xl font-bold">0</div>
      </div>

      <div className="bg-yellow-500 text-white p-4 rounded">
        <div className="text-sm">Empresarial</div>
        <div className="text-3xl font-bold">0</div>
      </div>

      <div className="bg-purple-700 text-white p-4 rounded">
        <div className="text-sm">VIP</div>
        <div className="text-3xl font-bold">0</div>
      </div>

    </div>

    <div className="bg-white p-4 rounded shadow">

      <h2 className="font-semibold text-lg mb-3">
        Actividad reciente
      </h2>

      <table className="w-full border">

        <thead>
          <tr className="bg-blue-950 text-white">
            <th className="p-2 text-left">Tipo</th>
            <th className="p-2 text-left">Detalle</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="p-2 border">
              Sistema
            </td>

            <td className="p-2 border">
              Reportes inicializados correctamente
            </td>
          </tr>
        </tbody>

      </table>

    </div>

  </div>
);
}