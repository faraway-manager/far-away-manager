"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");

  useEffect(() => {
    const c = localStorage.getItem("cotizaciones");
    const s = localStorage.getItem("servicios");

    if (c) setCotizaciones(JSON.parse(c));
    if (s) setServicios(JSON.parse(s));
  }, []);

  // FILTRO FECHAS
  function enRango(fecha: string) {
    if (!inicio || !fin) return true;
    return fecha >= inicio && fecha <= fin;
  }

  const cotFiltradas = cotizaciones.filter((c) =>
    enRango(c.fechaInicio || "")
  );

  const servFiltrados = servicios.filter((s) =>
    enRango(s.fecha || "")
  );

  // KPIs
  const totalCotizaciones = cotFiltradas.reduce(
    (acc, c) => acc + (c.total || 0),
    0
  );

  const totalServicios = servFiltrados.reduce(
    (acc, s) => acc + (s.costo || 0),
    0
  );

  const totalGeneral = totalCotizaciones + totalServicios;

  const totalOperaciones =
    cotFiltradas.length + servFiltrados.length;

  // INGRESOS POR UNIDAD
  const ingresosPorUnidad: any = {};
  servFiltrados.forEach((s) => {
    if (!ingresosPorUnidad[s.unidad]) {
      ingresosPorUnidad[s.unidad] = 0;
    }
    ingresosPorUnidad[s.unidad] += s.costo;
  });

  return (
    <main className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">
        Dashboard 📊
      </h1>

      {/* FILTROS */}
      <div className="flex gap-2 mb-6">
        <input
          type="date"
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={fin}
          onChange={(e) => setFin(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-blue-950 text-white p-4 rounded">
          <p>Total General</p>
          <h2 className="text-xl">${totalGeneral}</h2>
        </div>

        <div className="bg-green-600 text-white p-4 rounded">
          <p>Cotizaciones</p>
          <h2 className="text-xl">${totalCotizaciones}</h2>
        </div>

        <div className="bg-purple-600 text-white p-4 rounded">
          <p>Transporte</p>
          <h2 className="text-xl">${totalServicios}</h2>
        </div>

        <div className="bg-gray-800 text-white p-4 rounded">
          <p>Operaciones</p>
          <h2 className="text-xl">{totalOperaciones}</h2>
        </div>

      </div>

      {/* INGRESOS POR UNIDAD */}
      <h2 className="text-lg font-semibold mb-2">
        Ingresos por Unidad 🚐
      </h2>

      <table className="w-full border mb-8">
        <thead className="bg-gray-200">
          <tr>
            <th>Unidad</th>
            <th>Ingresos</th>
          </tr>
        </thead>

        <tbody>
          {Object.keys(ingresosPorUnidad).map((u) => (
            <tr key={u} className="text-center border-t">
              <td>{u}</td>
              <td>${ingresosPorUnidad[u]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* LISTADO DETALLADO */}
      <h2 className="text-lg font-semibold mb-2">
        Actividad reciente
      </h2>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th>Tipo</th>
            <th>Detalle</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>

          {cotFiltradas.map((c, i) => (
            <tr key={"c" + i} className="text-center border-t">
              <td>Cotización</td>
              <td>{c.cliente} - {c.destino}</td>
              <td>${c.total}</td>
            </tr>
          ))}

          {servFiltrados.map((s, i) => (
            <tr key={"s" + i} className="text-center border-t">
              <td>Transporte</td>
              <td>{s.unidad} - {s.destino}</td>
              <td>${s.costo}</td>
            </tr>
          ))}

        </tbody>
      </table>

    </main>
  );
}