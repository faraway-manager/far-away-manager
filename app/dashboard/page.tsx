"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type CotizacionRaw = {
  id: string;
  cliente_id: string | null;
  tipo_servicio: string | null;
  descripcion_viaje: string | null;
  tarifa_publica: number | string | null;
  iva_publica: number | string | null;
  total_publica: number | string | null;
  utilidad: number | string | null;
  comision: number | string | null;
  anticipos: number | string | null;
  pago_total: number | string | null;
  estado: string | null;
  observaciones: string | null;
  created_at: string | null;
  clientes?: {
    nombre_cliente: string | null;
    empresa: string | null;
    destino: string | null;
  } | null;
};

type MobilityRaw = {
  id: string;
  cliente_id: string | null;
  servicio: string | null;
  subtipo: string | null;
  origen: string | null;
  destino: string | null;
  fecha_servicio: string | null;
  unidad: string | null;
  tarifa_publica: number | string | null;
  iva_publica: number | string | null;
  total_publico: number | string | null;
  utilidad: number | string | null;
  comision: number | string | null;
  anticipo: number | string | null;
  saldo_pendiente: number | string | null;
  estado: string | null;
  agente: string | null;
  created_at: string | null;
  clientes?: {
    nombre_cliente: string | null;
    empresa: string | null;
  } | null;
};

type Actividad = {
  id: string;
  tipo: "Cotización" | "Mobility";
  fecha: string;
  cliente: string;
  detalle: string;
  total: number;
  utilidad: number;
  estado: string;
};

export default function DashboardPage() {
  const [cotizaciones, setCotizaciones] = useState<CotizacionRaw[]>([]);
  const [servicios, setServicios] = useState<MobilityRaw[]>([]);
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [cargando, setCargando] = useState(true);

  const formatoMoneda = (valor: number) => {
    return "$" + Number(valor || 0).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const numero = (valor: number | string | null | undefined) => {
    return Number(valor || 0);
  };

  const safeJson = (texto: string | null) => {
    if (!texto) return null;

    try {
      return JSON.parse(texto);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    setCargando(true);

    const { data: cotizacionesData, error: cotizacionesError } = await supabase
      .from("cotizaciones")
      .select(
        `
        *,
        clientes (
          nombre_cliente,
          empresa,
          destino
        )
      `
      )
      .order("created_at", { ascending: false });

    if (cotizacionesError) {
      alert("Error al cargar cotizaciones: " + cotizacionesError.message);
      setCargando(false);
      return;
    }

    const { data: mobilityData, error: mobilityError } = await supabase
      .from("mobility")
      .select(
        `
        *,
        clientes (
          nombre_cliente,
          empresa
        )
      `
      )
      .order("created_at", { ascending: false });

    if (mobilityError) {
      alert("Error al cargar Mobility: " + mobilityError.message);
      setCargando(false);
      return;
    }

    setCotizaciones((cotizacionesData || []) as CotizacionRaw[]);
    setServicios((mobilityData || []) as MobilityRaw[]);
    setCargando(false);
  };

  const enRango = (fecha: string | null | undefined) => {
    if (!inicio && !fin) return true;
    if (!fecha) return false;

    const fechaCorta = fecha.slice(0, 10);

    if (inicio && fechaCorta < inicio) return false;
    if (fin && fechaCorta > fin) return false;

    return true;
  };

  const cotFiltradas = useMemo(() => {
    return cotizaciones.filter((cotizacion) => enRango(cotizacion.created_at));
  }, [cotizaciones, inicio, fin]);

  const servFiltrados = useMemo(() => {
    return servicios.filter((servicio) =>
      enRango(servicio.fecha_servicio || servicio.created_at)
    );
  }, [servicios, inicio, fin]);

  const totalCotizaciones = cotFiltradas.reduce(
    (acc, cotizacion) => acc + numero(cotizacion.total_publica),
    0
  );

  const totalServicios = servFiltrados.reduce(
    (acc, servicio) => acc + numero(servicio.total_publico),
    0
  );

  const totalGeneral = totalCotizaciones + totalServicios;

  const utilidadCotizaciones = cotFiltradas.reduce(
    (acc, cotizacion) => acc + numero(cotizacion.utilidad),
    0
  );

  const utilidadServicios = servFiltrados.reduce(
    (acc, servicio) => acc + numero(servicio.utilidad),
    0
  );

  const utilidadTotal = utilidadCotizaciones + utilidadServicios;

  const comisionesCotizaciones = cotFiltradas.reduce(
    (acc, cotizacion) => acc + numero(cotizacion.comision),
    0
  );

  const comisionesServicios = servFiltrados.reduce(
    (acc, servicio) => acc + numero(servicio.comision),
    0
  );

  const comisionesTotal = comisionesCotizaciones + comisionesServicios;

  const anticiposCotizaciones = cotFiltradas.reduce(
    (acc, cotizacion) => acc + numero(cotizacion.anticipos),
    0
  );

  const anticiposServicios = servFiltrados.reduce(
    (acc, servicio) => acc + numero(servicio.anticipo),
    0
  );

  const anticiposTotal = anticiposCotizaciones + anticiposServicios;
  const saldoPendienteTotal = totalGeneral - anticiposTotal;
  const totalOperaciones = cotFiltradas.length + servFiltrados.length;

  const cotizacionesPorEstado = cotFiltradas.reduce<Record<string, number>>(
    (acc, cotizacion) => {
      const estado = cotizacion.estado || "Sin estado";
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    },
    {}
  );

  const mobilityPorEstado = servFiltrados.reduce<Record<string, number>>(
    (acc, servicio) => {
      const estado = servicio.estado || "Sin estado";
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    },
    {}
  );

  const ingresosPorUnidad = servFiltrados.reduce<Record<string, number>>(
    (acc, servicio) => {
      const unidad = servicio.unidad || "Sin unidad";
      acc[unidad] = (acc[unidad] || 0) + numero(servicio.total_publico);
      return acc;
    },
    {}
  );

  const actividadReciente: Actividad[] = [
    ...cotFiltradas.map((cotizacion) => {
      const meta = safeJson(cotizacion.observaciones);
      const cliente =
        meta?.cliente ||
        cotizacion.clientes?.nombre_cliente ||
        cotizacion.clientes?.empresa ||
        "Sin cliente";

      const destino =
        meta?.destino || cotizacion.clientes?.destino || "Sin destino";

      return {
        id: cotizacion.id,
        tipo: "Cotización" as const,
        fecha: cotizacion.created_at || "",
        cliente,
        detalle: `${destino} · ${cotizacion.tipo_servicio || "Servicio"}`,
        total: numero(cotizacion.total_publica),
        utilidad: numero(cotizacion.utilidad),
        estado: cotizacion.estado || "Sin estado",
      };
    }),
    ...servFiltrados.map((servicio) => {
      const cliente =
        servicio.clientes?.nombre_cliente ||
        servicio.clientes?.empresa ||
        "Sin cliente";

      return {
        id: servicio.id,
        tipo: "Mobility" as const,
        fecha: servicio.fecha_servicio || servicio.created_at || "",
        cliente,
        detalle: `${servicio.origen || "Origen"} → ${
          servicio.destino || "Destino"
        }`,
        total: numero(servicio.total_publico),
        utilidad: numero(servicio.utilidad),
        estado: servicio.estado || "Sin estado",
      };
    }),
  ]
    .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""))
    .slice(0, 12);

  return (
    <main className="p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">
            Dashboard Ejecutivo 📊
          </h1>
          <p className="text-gray-600">
            Indicadores reales de Cotizador y Mobility conectados a Supabase.
          </p>
        </div>

        <button
          onClick={cargarDashboard}
          className="bg-blue-950 text-white px-4 py-2 rounded"
        >
          Actualizar datos
        </button>
      </div>

      <section className="border p-4 rounded mb-6">
        <h2 className="font-bold mb-3">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="border p-2 rounded">
            Inicio:
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="ml-2 outline-none"
            />
          </label>

          <label className="border p-2 rounded">
            Fin:
            <input
              type="date"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              className="ml-2 outline-none"
            />
          </label>

          <button
            onClick={() => {
              setInicio("");
              setFin("");
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Limpiar filtros
          </button>

          <div className="border p-2 rounded bg-gray-100">
            {cargando ? "Cargando..." : `Operaciones: ${totalOperaciones}`}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-950 text-white p-4 rounded">
          <p className="text-sm">Total general</p>
          <h2 className="text-2xl font-bold">{formatoMoneda(totalGeneral)}</h2>
        </div>

        <div className="bg-green-700 text-white p-4 rounded">
          <p className="text-sm">Cotizaciones</p>
          <h2 className="text-2xl font-bold">
            {formatoMoneda(totalCotizaciones)}
          </h2>
        </div>

        <div className="bg-purple-700 text-white p-4 rounded">
          <p className="text-sm">Mobility</p>
          <h2 className="text-2xl font-bold">
            {formatoMoneda(totalServicios)}
          </h2>
        </div>

        <div className="bg-gray-800 text-white p-4 rounded">
          <p className="text-sm">Operaciones</p>
          <h2 className="text-2xl font-bold">{totalOperaciones}</h2>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border p-4 rounded bg-white">
          <p className="text-sm text-gray-600">Utilidad total</p>
          <h2 className="text-xl font-bold text-blue-950">
            {formatoMoneda(utilidadTotal)}
          </h2>
        </div>

        <div className="border p-4 rounded bg-white">
          <p className="text-sm text-gray-600">Comisiones</p>
          <h2 className="text-xl font-bold text-blue-950">
            {formatoMoneda(comisionesTotal)}
          </h2>
        </div>

        <div className="border p-4 rounded bg-white">
          <p className="text-sm text-gray-600">Anticipos</p>
          <h2 className="text-xl font-bold text-blue-950">
            {formatoMoneda(anticiposTotal)}
          </h2>
        </div>

        <div className="border p-4 rounded bg-white">
          <p className="text-sm text-gray-600">Saldo pendiente</p>
          <h2 className="text-xl font-bold text-red-700">
            {formatoMoneda(saldoPendienteTotal)}
          </h2>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border p-4 rounded overflow-x-auto">
          <h2 className="font-bold mb-3">Cotizaciones por estado ✈️</h2>

          <table className="w-full border text-sm">
            <thead className="bg-blue-950 text-white">
              <tr>
                <th className="p-2">Estado</th>
                <th className="p-2">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(cotizacionesPorEstado).length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-3 text-center border">
                    Sin datos
                  </td>
                </tr>
              ) : (
                Object.entries(cotizacionesPorEstado).map(
                  ([estado, cantidad]) => (
                    <tr key={estado}>
                      <td className="p-2 border">{estado}</td>
                      <td className="p-2 border text-center">{cantidad}</td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="border p-4 rounded overflow-x-auto">
          <h2 className="font-bold mb-3">Mobility por estado 🚐</h2>

          <table className="w-full border text-sm">
            <thead className="bg-blue-950 text-white">
              <tr>
                <th className="p-2">Estado</th>
                <th className="p-2">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(mobilityPorEstado).length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-3 text-center border">
                    Sin datos
                  </td>
                </tr>
              ) : (
                Object.entries(mobilityPorEstado).map(([estado, cantidad]) => (
                  <tr key={estado}>
                    <td className="p-2 border">{estado}</td>
                    <td className="p-2 border text-center">{cantidad}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border p-4 rounded overflow-x-auto">
          <h2 className="font-bold mb-3">Ingresos por unidad 🚐</h2>

          <table className="w-full border text-sm">
            <thead className="bg-blue-950 text-white">
              <tr>
                <th className="p-2">Unidad</th>
                <th className="p-2">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(ingresosPorUnidad).length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-3 text-center border">
                    Sin datos
                  </td>
                </tr>
              ) : (
                Object.entries(ingresosPorUnidad).map(([unidad, total]) => (
                  <tr key={unidad}>
                    <td className="p-2 border">{unidad}</td>
                    <td className="p-2 border">{formatoMoneda(total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border p-4 rounded overflow-x-auto">
        <h2 className="font-bold mb-3">Actividad reciente</h2>

        <table className="w-full border text-sm">
          <thead className="bg-blue-950 text-white">
            <tr>
              <th className="p-2">Fecha</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Cliente</th>
              <th className="p-2">Detalle</th>
              <th className="p-2">Total</th>
              <th className="p-2">Utilidad</th>
              <th className="p-2">Estado</th>
            </tr>
          </thead>

          <tbody>
            {actividadReciente.length === 0 ? (
              <tr>
                <td className="p-3 text-center border" colSpan={7}>
                  No hay actividad registrada
                </td>
              </tr>
            ) : (
              actividadReciente.map((actividad) => (
                <tr key={`${actividad.tipo}-${actividad.id}`}>
                  <td className="p-2 border">
                    {actividad.fecha ? actividad.fecha.slice(0, 10) : "N/A"}
                  </td>
                  <td className="p-2 border">{actividad.tipo}</td>
                  <td className="p-2 border">{actividad.cliente}</td>
                  <td className="p-2 border">{actividad.detalle}</td>
                  <td className="p-2 border">
                    {formatoMoneda(actividad.total)}
                  </td>
                  <td className="p-2 border">
                    {formatoMoneda(actividad.utilidad)}
                  </td>
                  <td className="p-2 border">{actividad.estado}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
