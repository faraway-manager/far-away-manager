"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type Cliente = {
  id: string;
  tipo_cliente: "personal" | "empresarial" | "vip";
  nombre_cliente: string | null;
  empresa: string | null;
  destino: string | null;
  fecha_salida: string | null;
  fecha_llegada: string | null;
  nombre_pax: string | null;
  created_at: string | null;
};

type CotizacionRaw = {
  id: string;
  cliente_id: string | null;
  tipo_servicio: string | null;
  descripcion_viaje: string | null;
  total_neta: number | string | null;
  total_publica: number | string | null;
  utilidad: number | string | null;
  comision: number | string | null;
  anticipos: number | string | null;
  fecha_limite_pago: string | null;
  estado: string | null;
  observaciones: string | null;
  created_at: string | null;
  clientes?: {
    nombre_cliente: string | null;
    empresa: string | null;
    tipo_cliente: "personal" | "empresarial" | "vip" | null;
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
  total_neto: number | string | null;
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
    tipo_cliente: "personal" | "empresarial" | "vip" | null;
  } | null;
};

type Venta = {
  id: string;
  tipo: "Cotización" | "Mobility";
  folio: string;
  cliente: string;
  tipoCliente: string;
  destino: string;
  agente: string;
  servicio: string;
  estado: string;
  totalVendido: number;
  totalNeto: number;
  utilidad: number;
  comision: number;
  anticipo: number;
  saldoPendiente: number;
  fecha: string;
  limitePago: string;
};

export default function Reportes() {
  const router = useRouter();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cotizaciones, setCotizaciones] = useState<CotizacionRaw[]>([]);
  const [mobility, setMobility] = useState<MobilityRaw[]>([]);
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [cargando, setCargando] = useState(true);

  const [filtroAgente, setFiltroAgente] = useState("");
  const [filtroTipoCliente, setFiltroTipoCliente] = useState("");
  const [filtroDestino, setFiltroDestino] = useState("");
  const [filtroServicio, setFiltroServicio] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroInicio, setFiltroInicio] = useState("");
  const [filtroFin, setFiltroFin] = useState("");

  const formatoMoneda = (valor: number) =>
    "$" +
    Number(valor || 0).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const numero = (valor: number | string | null | undefined) =>
    Number(valor || 0);

  const safeJson = (texto: string | null) => {
    if (!texto) return null;
    try {
      return JSON.parse(texto);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const autorizado = sessionStorage.getItem("reportes_ok");

    if (!autorizado) {
      const pass = prompt("Ingrese contraseña para acceder a Reportes");

      if (pass === "faraway2026") {
        sessionStorage.setItem("reportes_ok", "1");
        setAccesoPermitido(true);
        cargarReportes();
      } else {
        alert("Acceso denegado");
        router.push("/");
      }

      return;
    }

    setAccesoPermitido(true);
    cargarReportes();
  }, [router]);

  const cargarReportes = async () => {
    setCargando(true);

    const { data: clientesData, error: clientesError } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (clientesError) {
      alert("Error al cargar clientes: " + clientesError.message);
      setCargando(false);
      return;
    }

    const { data: cotizacionesData, error: cotizacionesError } = await supabase
      .from("cotizaciones")
      .select(
        `
        *,
        clientes (
          nombre_cliente,
          empresa,
          tipo_cliente,
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
          empresa,
          tipo_cliente
        )
      `
      )
      .order("created_at", { ascending: false });

    if (mobilityError) {
      alert("Error al cargar Mobility: " + mobilityError.message);
      setCargando(false);
      return;
    }

    setClientes((clientesData || []) as Cliente[]);
    setCotizaciones((cotizacionesData || []) as CotizacionRaw[]);
    setMobility((mobilityData || []) as MobilityRaw[]);
    setCargando(false);
  };

  const ventasNormalizadas = useMemo<Venta[]>(() => {
    const ventasCotizaciones: Venta[] = cotizaciones.map((item) => {
      const meta = safeJson(item.observaciones);
      const cliente =
        meta?.cliente ||
        item.clientes?.nombre_cliente ||
        item.clientes?.empresa ||
        "Sin cliente";

      const destino =
        meta?.destino || item.clientes?.destino || "Sin destino";

      const tipoCliente =
        meta?.tipoCliente || item.clientes?.tipo_cliente || "Sin tipo";

      const folio = meta?.folio || `COT-${String(item.id).slice(0, 8)}`;
      const agente = meta?.agente || "Sin agente";
      const totalVendido = numero(item.total_publica);
      const anticipo = numero(item.anticipos);

      return {
        id: item.id,
        tipo: "Cotización",
        folio,
        cliente,
        tipoCliente,
        destino,
        agente,
        servicio: item.tipo_servicio || "Servicio",
        estado: item.estado || "Sin estado",
        totalVendido,
        totalNeto: numero(item.total_neta),
        utilidad: numero(item.utilidad),
        comision: numero(item.comision),
        anticipo,
        saldoPendiente: totalVendido - anticipo,
        fecha: (item.created_at || "").slice(0, 10),
        limitePago: item.fecha_limite_pago || "",
      };
    });

    const ventasMobility: Venta[] = mobility.map((item) => {
      const cliente =
        item.clientes?.nombre_cliente ||
        item.clientes?.empresa ||
        "Sin cliente";

      return {
        id: item.id,
        tipo: "Mobility",
        folio: `MOB-${String(item.id).slice(0, 8)}`,
        cliente,
        tipoCliente: item.clientes?.tipo_cliente || "Sin tipo",
        destino: item.destino || "Sin destino",
        agente: item.agente || "Sin agente",
        servicio: `${item.servicio || "Servicio terrestre"}${
          item.subtipo ? " / " + item.subtipo : ""
        }`,
        estado: item.estado || "Sin estado",
        totalVendido: numero(item.total_publico),
        totalNeto: numero(item.total_neto),
        utilidad: numero(item.utilidad),
        comision: numero(item.comision),
        anticipo: numero(item.anticipo),
        saldoPendiente: numero(item.saldo_pendiente),
        fecha: (item.fecha_servicio || item.created_at || "").slice(0, 10),
        limitePago: "",
      };
    });

    return [...ventasCotizaciones, ...ventasMobility].sort((a, b) =>
      (b.fecha || "").localeCompare(a.fecha || "")
    );
  }, [cotizaciones, mobility]);

  const ventasFiltradas = useMemo(() => {
    return ventasNormalizadas.filter((venta) => {
      const coincideAgente =
        !filtroAgente ||
        venta.agente.toLowerCase().includes(filtroAgente.toLowerCase());

      const coincideTipoCliente =
        !filtroTipoCliente || venta.tipoCliente === filtroTipoCliente;

      const coincideDestino =
        !filtroDestino ||
        venta.destino.toLowerCase().includes(filtroDestino.toLowerCase());

      const coincideServicio =
        !filtroServicio ||
        venta.servicio.toLowerCase().includes(filtroServicio.toLowerCase());

      const coincideEstado = !filtroEstado || venta.estado === filtroEstado;
      const coincideInicio = !filtroInicio || venta.fecha >= filtroInicio;
      const coincideFin = !filtroFin || venta.fecha <= filtroFin;

      return (
        coincideAgente &&
        coincideTipoCliente &&
        coincideDestino &&
        coincideServicio &&
        coincideEstado &&
        coincideInicio &&
        coincideFin
      );
    });
  }, [
    ventasNormalizadas,
    filtroAgente,
    filtroTipoCliente,
    filtroDestino,
    filtroServicio,
    filtroEstado,
    filtroInicio,
    filtroFin,
  ]);

  const totalClientes = clientes.length;
  const personal = clientes.filter((c) => c.tipo_cliente === "personal").length;
  const empresarial = clientes.filter(
    (c) => c.tipo_cliente === "empresarial"
  ).length;
  const vip = clientes.filter((c) => c.tipo_cliente === "vip").length;

  const totalVendido = ventasFiltradas.reduce((s, v) => s + v.totalVendido, 0);
  const totalNeto = ventasFiltradas.reduce((s, v) => s + v.totalNeto, 0);
  const utilidadTotal = ventasFiltradas.reduce((s, v) => s + v.utilidad, 0);
  const comisionTotal = ventasFiltradas.reduce((s, v) => s + v.comision, 0);
  const anticiposTotal = ventasFiltradas.reduce((s, v) => s + v.anticipo, 0);
  const saldoPendienteTotal = ventasFiltradas.reduce(
    (s, v) => s + v.saldoPendiente,
    0
  );

  const ventasCerradas = ventasFiltradas.filter((v) =>
    ["Pagada", "Confirmada", "Confirmado", "Operado"].includes(v.estado)
  ).length;

  const cotizacionesPendientes = ventasFiltradas.filter((v) =>
    ["Pendiente", "Cotizada", "Cotizado"].includes(v.estado)
  ).length;

  const agrupar = <T,>(
    lista: Venta[],
    llave: (venta: Venta) => string,
    mapFn: (key: string, ventas: Venta[]) => T
  ) =>
    Array.from(new Set(lista.map(llave))).map((key) =>
      mapFn(
        key,
        lista.filter((item) => llave(item) === key)
      )
    );

  const reporteAgentes = agrupar(ventasFiltradas, (v) => v.agente, (agente, ventas) => ({
    agente,
    ventas: ventas.length,
    totalVendido: ventas.reduce((s, v) => s + v.totalVendido, 0),
    utilidad: ventas.reduce((s, v) => s + v.utilidad, 0),
    comision: ventas.reduce((s, v) => s + v.comision, 0),
  }));

  const reporteClientes = agrupar(ventasFiltradas, (v) => v.cliente, (cliente, ventas) => ({
    cliente,
    compras: ventas.length,
    totalComprado: ventas.reduce((s, v) => s + v.totalVendido, 0),
    destinos: Array.from(new Set(ventas.map((v) => v.destino))).join(", "),
  }));

  const reporteDestinos = agrupar(ventasFiltradas, (v) => v.destino, (destino, ventas) => ({
    destino,
    operaciones: ventas.length,
    cerradas: ventas.filter((v) =>
      ["Pagada", "Confirmada", "Confirmado", "Operado"].includes(v.estado)
    ).length,
    ingresos: ventas.reduce((s, v) => s + v.totalVendido, 0),
  }));

  const reporteServicios = agrupar(
    ventasFiltradas.flatMap((v) =>
      v.servicio.split(",").map((servicio) => ({ ...v, servicio: servicio.trim() }))
    ),
    (v) => v.servicio,
    (servicio, ventas) => ({
      servicio,
      ventas: ventas.length,
      ingresos: ventas.reduce((s, v) => s + v.totalVendido, 0),
    })
  );

  const reporteEstados = agrupar(ventasFiltradas, (v) => v.estado, (estado, ventas) => ({
    estado,
    cantidad: ventas.length,
    total: ventas.reduce((s, v) => s + v.totalVendido, 0),
  }));

  const limpiarFiltros = () => {
    setFiltroAgente("");
    setFiltroTipoCliente("");
    setFiltroDestino("");
    setFiltroServicio("");
    setFiltroEstado("");
    setFiltroInicio("");
    setFiltroFin("");
  };

  const descargarCSV = (nombreArchivo: string, filas: Record<string, any>[]) => {
    if (filas.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const encabezados = Object.keys(filas[0]);
    const contenido = [
      encabezados.join(","),
      ...filas.map((fila) =>
        encabezados
          .map((encabezado) => {
            const valor = String(fila[encabezado] ?? "").replaceAll('"', '""');
            return `"${valor}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + contenido], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();

    URL.revokeObjectURL(url);
  };

  if (!accesoPermitido) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-blue-950 mb-2">
            Reportes 📊
          </h1>
          <p className="text-gray-600">
          </p>
        </div>

        <button
          onClick={cargarReportes}
          className="bg-blue-950 text-white px-4 py-2 rounded"
        >
          {cargando ? "Cargando..." : "Actualizar datos"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          ["Total vendido", totalVendido, "bg-blue-950"],
          ["Total neto", totalNeto, "bg-slate-700"],
          ["Utilidad", utilidadTotal, "bg-green-700"],
          ["Comisión", comisionTotal, "bg-purple-700"],
          ["Anticipos", anticiposTotal, "bg-emerald-600"],
          ["Saldo pendiente", saldoPendienteTotal, "bg-red-600"],
        ].map(([titulo, valor, clase]) => (
          <div key={String(titulo)} className={`${clase} text-white p-4 rounded`}>
            <div className="text-sm">{String(titulo)}</div>
            <div className="text-3xl font-bold">{formatoMoneda(Number(valor))}</div>
          </div>
        ))}

        <div className="bg-yellow-500 text-white p-4 rounded">
          <div className="text-sm">Ventas cerradas</div>
          <div className="text-3xl font-bold">{ventasCerradas}</div>
        </div>

        <div className="bg-orange-500 text-white p-4 rounded">
          <div className="text-sm">Pendientes / cotizadas</div>
          <div className="text-3xl font-bold">{cotizacionesPendientes}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border p-4 rounded bg-white">
          <div className="text-sm text-gray-600">Clientes</div>
          <div className="text-2xl font-bold text-blue-950">{totalClientes}</div>
        </div>
        <div className="border p-4 rounded bg-white">
          <div className="text-sm text-gray-600">Personales</div>
          <div className="text-2xl font-bold text-blue-950">{personal}</div>
        </div>
        <div className="border p-4 rounded bg-white">
          <div className="text-sm text-gray-600">Empresariales</div>
          <div className="text-2xl font-bold text-blue-950">{empresarial}</div>
        </div>
        <div className="border p-4 rounded bg-white">
          <div className="text-sm text-gray-600">VIP</div>
          <div className="text-2xl font-bold text-blue-950">{vip}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold text-lg mb-3">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          <input type="date" className="border p-2" value={filtroInicio} onChange={(e) => setFiltroInicio(e.target.value)} />
          <input type="date" className="border p-2" value={filtroFin} onChange={(e) => setFiltroFin(e.target.value)} />
          <input className="border p-2" placeholder="Agente" value={filtroAgente} onChange={(e) => setFiltroAgente(e.target.value)} />
          <select className="border p-2" value={filtroTipoCliente} onChange={(e) => setFiltroTipoCliente(e.target.value)}>
            <option value="">Tipo cliente</option>
            <option value="personal">Personal</option>
            <option value="empresarial">Empresarial</option>
            <option value="vip">VIP</option>
          </select>
          <input className="border p-2" placeholder="Destino" value={filtroDestino} onChange={(e) => setFiltroDestino(e.target.value)} />
          <input className="border p-2" placeholder="Servicio" value={filtroServicio} onChange={(e) => setFiltroServicio(e.target.value)} />
          <select className="border p-2" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Estado</option>
            {Array.from(new Set(ventasNormalizadas.map((v) => v.estado))).map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 mt-3">
          <button onClick={limpiarFiltros} className="bg-gray-600 text-white px-4 py-2 rounded">
            Limpiar filtros
          </button>
          <button
            onClick={() =>
              descargarCSV(
                "reporte_ventas_faraway.csv",
                ventasFiltradas.map((v) => ({
                  tipo: v.tipo,
                  folio: v.folio,
                  cliente: v.cliente,
                  tipoCliente: v.tipoCliente,
                  destino: v.destino,
                  agente: v.agente,
                  servicio: v.servicio,
                  estado: v.estado,
                  totalVendido: v.totalVendido,
                  totalNeto: v.totalNeto,
                  utilidad: v.utilidad,
                  comision: v.comision,
                  anticipo: v.anticipo,
                  saldoPendiente: v.saldoPendiente,
                  fecha: v.fecha,
                  limitePago: v.limitePago,
                }))
              )
            }
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Tabla titulo="Reporte por agente" columnas={["Agente", "Ventas", "Vendido", "Utilidad", "Comisión"]}>
          {reporteAgentes.map((item) => (
            <tr key={item.agente}>
              <td className="p-2 border">{item.agente}</td>
              <td className="p-2 border">{item.ventas}</td>
              <td className="p-2 border">{formatoMoneda(item.totalVendido)}</td>
              <td className="p-2 border">{formatoMoneda(item.utilidad)}</td>
              <td className="p-2 border">{formatoMoneda(item.comision)}</td>
            </tr>
          ))}
        </Tabla>

        <Tabla titulo="Reporte de clientes" columnas={["Cliente", "Compras", "Total", "Destinos"]}>
          {reporteClientes.map((item) => (
            <tr key={item.cliente}>
              <td className="p-2 border">{item.cliente}</td>
              <td className="p-2 border">{item.compras}</td>
              <td className="p-2 border">{formatoMoneda(item.totalComprado)}</td>
              <td className="p-2 border">{item.destinos}</td>
            </tr>
          ))}
        </Tabla>

        <Tabla titulo="Reporte de destinos" columnas={["Destino", "Operaciones", "Cerradas", "Ingresos"]}>
          {reporteDestinos.map((item) => (
            <tr key={item.destino}>
              <td className="p-2 border">{item.destino}</td>
              <td className="p-2 border">{item.operaciones}</td>
              <td className="p-2 border">{item.cerradas}</td>
              <td className="p-2 border">{formatoMoneda(item.ingresos)}</td>
            </tr>
          ))}
        </Tabla>

        <Tabla titulo="Reporte de servicios" columnas={["Servicio", "Ventas", "Ingresos"]}>
          {reporteServicios.map((item) => (
            <tr key={item.servicio}>
              <td className="p-2 border">{item.servicio}</td>
              <td className="p-2 border">{item.ventas}</td>
              <td className="p-2 border">{formatoMoneda(item.ingresos)}</td>
            </tr>
          ))}
        </Tabla>
      </div>

      <Tabla titulo="Reporte de estados" columnas={["Estado", "Cantidad", "Total"]}>
        {reporteEstados.map((item) => (
          <tr key={item.estado}>
            <td className="p-2 border">{item.estado}</td>
            <td className="p-2 border">{item.cantidad}</td>
            <td className="p-2 border">{formatoMoneda(item.total)}</td>
          </tr>
        ))}
      </Tabla>

      <div className="mb-6" />

      <Tabla titulo="Reporte de pagos" columnas={["Tipo", "Folio", "Cliente", "Anticipo", "Saldo pendiente", "Límite de pago", "Estado"]}>
        {ventasFiltradas.map((item) => (
          <tr key={`pagos-${item.tipo}-${item.id}`}>
            <td className="p-2 border">{item.tipo}</td>
            <td className="p-2 border">{item.folio}</td>
            <td className="p-2 border">{item.cliente}</td>
            <td className="p-2 border">{formatoMoneda(item.anticipo)}</td>
            <td className="p-2 border">{formatoMoneda(item.saldoPendiente)}</td>
            <td className="p-2 border">{item.limitePago || "N/A"}</td>
            <td className="p-2 border">{item.estado}</td>
          </tr>
        ))}
      </Tabla>

      <div className="mb-6" />

      <Tabla titulo="Reporte de ventas" columnas={["Tipo", "Folio", "Cliente", "Destino", "Servicio", "Total", "Utilidad", "Agente", "Estado"]}>
        {ventasFiltradas.map((item) => (
          <tr key={`ventas-${item.tipo}-${item.id}`}>
            <td className="p-2 border">{item.tipo}</td>
            <td className="p-2 border">{item.folio}</td>
            <td className="p-2 border">{item.cliente}</td>
            <td className="p-2 border">{item.destino}</td>
            <td className="p-2 border">{item.servicio}</td>
            <td className="p-2 border">{formatoMoneda(item.totalVendido)}</td>
            <td className="p-2 border">{formatoMoneda(item.utilidad)}</td>
            <td className="p-2 border">{item.agente}</td>
            <td className="p-2 border">{item.estado}</td>
          </tr>
        ))}
      </Tabla>

      <div className="mb-6" />

      <Tabla titulo="Últimos clientes capturados" columnas={["Tipo", "Cliente / Empresa", "Destino", "Salida", "Regreso", "Pax"]}>
        {clientes.length === 0 ? (
          <tr>
            <td className="p-2 border text-center" colSpan={6}>
              No hay clientes registrados
            </td>
          </tr>
        ) : (
          clientes.slice(0, 10).map((cliente) => (
            <tr key={cliente.id}>
              <td className="p-2 border uppercase">{cliente.tipo_cliente}</td>
              <td className="p-2 border">
                {cliente.nombre_cliente || cliente.empresa || "Sin nombre"}
              </td>
              <td className="p-2 border">{cliente.destino || "Sin destino"}</td>
              <td className="p-2 border">{cliente.fecha_salida || "Sin fecha"}</td>
              <td className="p-2 border">{cliente.fecha_llegada || "Sin fecha"}</td>
              <td className="p-2 border">{cliente.nombre_pax || "N/A"}</td>
            </tr>
          ))
        )}
      </Tabla>
    </div>
  );
}

function Tabla({
  titulo,
  columnas,
  children,
}: {
  titulo: string;
  columnas: string[];
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white p-4 rounded shadow overflow-x-auto">
      <h2 className="font-semibold text-lg mb-3">{titulo}</h2>
      <table className="w-full border text-sm">
        <thead className="bg-blue-950 text-white">
          <tr>
            {columnas.map((columna) => (
              <th key={columna} className="p-2 text-left">
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </section>
  );
}
