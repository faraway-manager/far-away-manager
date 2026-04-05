"use client";

import { useEffect, useState } from "react";

export default function ReportesPage() {
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const pass = "admin123"; // 🔐 puedes cambiarlo

    const acceso = localStorage.getItem("auth_reportes");

    if (acceso === "ok") {
      setAutorizado(true);
      return;
    }

    const input = prompt("Ingresa contraseña para Reportes:");

    if (input === pass) {
      localStorage.setItem("auth_reportes", "ok");
      setAutorizado(true);
    } else {
      alert("Contraseña incorrecta");
      window.location.href = "/clientes";
    }
  }, []);

  if (!autorizado) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reportes 📊</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded">Cotizaciones $0</div>
        <div className="bg-green-100 p-4 rounded">Transporte $0</div>
        <div className="bg-gray-100 p-4 rounded">Total General $0</div>
      </div>

      <h2 className="font-semibold mb-2">Cotizaciones</h2>
      <table className="w-full border mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th>Cliente</th>
            <th>Destino</th>
            <th>Total</th>
          </tr>
        </thead>
      </table>

      <h2 className="font-semibold mb-2">Servicios de Transporte</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>Unidad</th>
            <th>Ruta</th>
            <th>Total</th>
          </tr>
        </thead>
      </table>
    </div>
  );
}