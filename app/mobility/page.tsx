"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Cliente = {
  id: string;
  tipo_cliente: "personal" | "empresarial" | "vip";
  nombre_cliente: string | null;
  empresa: string | null;
  contacto: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
};

type ServicioDetalle = {
  id: string;
  tipoServicio: string;
  subtipoServicio: string;
  origen: string;
  destino: string;
  fecha: string;
  numeroPasajeros: number;
  nombresPasajeros: string;
  tarifaReal: number;
  tarifaBase: number;
  iva: number;
  otrosCargos: number;
  totalCliente: number;
  utilidad: number;
};

type ServicioTransporte = {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteWhatsapp: string;
  tipoCliente: string;
  operador: string;
  telefonoOperador: string;
  unidad: string;
  tipoServicio: string;
  subtipoServicio: string;
  origen: string;
  destino: string;
  fecha: string;
  numeroPasajeros: number;
  nombresPasajeros: string;
  tarifaReal: number;
  tarifaBase: number;
  iva: number;
  otrosCargos: number;
  totalCliente: number;
  agente: string;
  porcentajeComision: number;
  utilidad: number;
  comision: number;
  anticipo: number;
  saldoPendiente: number;
  observaciones: string;
  estado: string;
  serviciosDetalle: ServicioDetalle[];
};

const crearIdTemporal = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return String(Date.now() + Math.random());
};

export default function TransportePage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteWhatsapp, setClienteWhatsapp] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");

  const [operador, setOperador] = useState("");
  const [telefonoOperador, setTelefonoOperador] = useState("");
  const [unidad, setUnidad] = useState("");

  const [tipoServicio, setTipoServicio] = useState("Traslado");
  const [subtipoServicio, setSubtipoServicio] = useState("Con chofer");

  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState("");

  const [numeroPasajeros, setNumeroPasajeros] = useState(1);
  const [nombresPasajeros, setNombresPasajeros] = useState("");

  const [tarifaReal, setTarifaReal] = useState("");
  const [tarifaBase, setTarifaBase] = useState("");
  const [iva, setIva] = useState("");
  const [otrosCargos, setOtrosCargos] = useState("");

  const [serviciosCotizacion, setServiciosCotizacion] = useState<ServicioDetalle[]>([]);
  const [servicioEditandoId, setServicioEditandoId] = useState<string | null>(null);

  const [agente, setAgente] = useState("");
  const [porcentajeComision, setPorcentajeComision] = useState(0);

  const [anticipo, setAnticipo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [estado, setEstado] = useState("Cotizado");

  const [servicios, setServicios] = useState<ServicioTransporte[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  const tarifaRealNumero = Number(tarifaReal || 0);
  const tarifaBaseNumero = Number(tarifaBase || 0);
  const ivaNumero = Number(iva || 0);
  const otrosCargosNumero = Number(otrosCargos || 0);

  const totalServicioActual = tarifaBaseNumero + ivaNumero + otrosCargosNumero;
  const utilidadServicioActual = tarifaBaseNumero - tarifaRealNumero;

  const totalClienteCotizacion = serviciosCotizacion.reduce(
    (sum, servicio) => sum + servicio.totalCliente,
    0,
  );

  const tarifaRealCotizacion = serviciosCotizacion.reduce(
    (sum, servicio) => sum + servicio.tarifaReal,
    0,
  );

  const tarifaBaseCotizacion = serviciosCotizacion.reduce(
    (sum, servicio) => sum + servicio.tarifaBase,
    0,
  );

  const ivaCotizacion = serviciosCotizacion.reduce(
    (sum, servicio) => sum + servicio.iva,
    0,
  );

  const otrosCargosCotizacion = serviciosCotizacion.reduce(
    (sum, servicio) => sum + servicio.otrosCargos,
    0,
  );

  const utilidadCotizacion = serviciosCotizacion.reduce(
    (sum, servicio) => sum + servicio.utilidad,
    0,
  );

  const numeroPasajerosCotizacion = serviciosCotizacion.reduce(
    (sum, servicio) => sum + Number(servicio.numeroPasajeros || 0),
    0,
  );

  const comisionCotizacion =
    utilidadCotizacion * (Number(porcentajeComision || 0) / 100);

  const anticipoNumero = Number(anticipo || 0);
  const saldoPendienteCotizacion = totalClienteCotizacion - anticipoNumero;

  const formatoMoneda = (valor: number) => {
    return (
      "$" +
      Number(valor || 0).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  const textoServiciosResumen = (detalles: ServicioDetalle[]) => {
    if (!detalles.length) return "Sin servicios";

    return detalles
      .map(
        (servicio, index) =>
          `${index + 1}. ${servicio.tipoServicio} ${servicio.origen} a ${servicio.destino}`,
      )
      .join(" | ");
  };

  useEffect(() => {
    cargarClientes();
    cargarServicios();
  }, []);

  const cargarClientes = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select(
        "id, tipo_cliente, nombre_cliente, empresa, contacto, telefono, whatsapp, email",
      )
      .order("created_at", { ascending: false });

    if (error) {
      alert("Error al cargar clientes: " + error.message);
      return;
    }

    setClientes((data || []) as Cliente[]);
  };

  const construirDetalleDesdeRegistro = (item: any): ServicioDetalle[] => {
    if (Array.isArray(item.servicios_detalle) && item.servicios_detalle.length > 0) {
      return item.servicios_detalle.map((servicio: any) => ({
        id: servicio.id || crearIdTemporal(),
        tipoServicio: servicio.tipoServicio || servicio.tipo_servicio || "",
        subtipoServicio: servicio.subtipoServicio || servicio.subtipo_servicio || "",
        origen: servicio.origen || "",
        destino: servicio.destino || "",
        fecha: servicio.fecha || "",
        numeroPasajeros: Number(servicio.numeroPasajeros || servicio.numero_pasajeros || 0),
        nombresPasajeros: servicio.nombresPasajeros || servicio.nombres_pasajeros || "",
        tarifaReal: Number(servicio.tarifaReal || servicio.tarifa_real || 0),
        tarifaBase: Number(servicio.tarifaBase || servicio.tarifa_base || 0),
        iva: Number(servicio.iva || 0),
        otrosCargos: Number(servicio.otrosCargos || servicio.otros_cargos || 0),
        totalCliente: Number(servicio.totalCliente || servicio.total_cliente || 0),
        utilidad: Number(servicio.utilidad || 0),
      }));
    }

    return [
      {
        id: crearIdTemporal(),
        tipoServicio: item.servicio || "",
        subtipoServicio: item.subtipo || "",
        origen: item.origen || "",
        destino: item.destino || "",
        fecha: item.fecha_servicio || "",
        numeroPasajeros: Number(item.pasajeros || 0),
        nombresPasajeros: item.nombres_pasajeros || "",
        tarifaReal: Number(item.tarifa_neta || 0),
        tarifaBase: Number(item.tarifa_publica || 0),
        iva: Number(item.iva_publica || 0),
        otrosCargos: Number(item.iva_neta || 0),
        totalCliente: Number(item.total_publico || 0),
        utilidad: Number(item.utilidad || 0),
      },
    ];
  };

  const cargarServicios = async () => {
    const { data, error } = await supabase
      .from("mobility")
      .select(
        `
        *,
        clientes (
          nombre_cliente,
          empresa,
          tipo_cliente,
          whatsapp
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      alert("Error al cargar servicios: " + error.message);
      return;
    }

    const serviciosMapeados: ServicioTransporte[] = (data || []).map(
      (item: any) => {
        const nombreCliente =
          item.clientes?.nombre_cliente || item.clientes?.empresa || "";

        const tipoCliente = item.clientes?.tipo_cliente || "";
        const detalles = construirDetalleDesdeRegistro(item);
        const primerServicio = detalles[0];

        return {
          id: item.id,
          clienteId: item.cliente_id || "",
          clienteNombre: nombreCliente,
          clienteWhatsapp: item.clientes?.whatsapp || "",
          tipoCliente,
          operador: item.operador || "",
          telefonoOperador: item.telefono_operador || "",
          unidad: item.unidad || "",
          tipoServicio: item.servicio || primerServicio?.tipoServicio || "",
          subtipoServicio: item.subtipo || primerServicio?.subtipoServicio || "",
          origen: item.origen || primerServicio?.origen || "",
          destino: item.destino || primerServicio?.destino || "",
          fecha: item.fecha_servicio || primerServicio?.fecha || "",
          numeroPasajeros: Number(item.pasajeros || 0),
          nombresPasajeros: item.nombres_pasajeros || "",
          tarifaReal: Number(item.tarifa_neta || 0),
          tarifaBase: Number(item.tarifa_publica || 0),
          iva: Number(item.iva_publica || 0),
          otrosCargos: Number(item.iva_neta || 0),
          totalCliente: Number(item.total_publico || 0),
          agente: item.agente || "",
          porcentajeComision: Number(item.porcentaje_comision || 0),
          utilidad: Number(item.utilidad || 0),
          comision: Number(item.comision || 0),
          anticipo: Number(item.anticipo || 0),
          saldoPendiente: Number(item.saldo_pendiente || 0),
          observaciones: item.observaciones || "",
          estado: item.estado || "Cotizado",
          serviciosDetalle: detalles,
        };
      },
    );

    setServicios(serviciosMapeados);
  };

  const seleccionarCliente = (id: string) => {
    setClienteId(id);

    const cliente = clientes.find((item) => item.id === id);

    if (!cliente) {
      setClienteNombre("");
      setClienteWhatsapp("");
      setTipoCliente("");
      return;
    }

    setClienteNombre(cliente.nombre_cliente || cliente.empresa || "");
    setClienteWhatsapp(cliente.whatsapp || "");
    setTipoCliente(cliente.tipo_cliente || "");
  };

  const limpiarCamposServicio = () => {
    setTipoServicio("Traslado");
    setSubtipoServicio("Con chofer");
    setOrigen("");
    setDestino("");
    setFecha("");
    setNumeroPasajeros(1);
    setNombresPasajeros("");
    setTarifaReal("");
    setTarifaBase("");
    setIva("");
    setOtrosCargos("");
    setServicioEditandoId(null);
  };

  const limpiarFormulario = () => {
    setClienteId("");
    setClienteNombre("");
    setClienteWhatsapp("");
    setTipoCliente("");
    setOperador("");
    setTelefonoOperador("");
    setUnidad("");
    limpiarCamposServicio();
    setServiciosCotizacion([]);
    setAgente("");
    setPorcentajeComision(0);
    setAnticipo("");
    setObservaciones("");
    setEstado("Cotizado");
    setEditId(null);
  };

  const agregarServicioCotizacion = () => {
    if (!origen || !destino || !fecha) {
      alert("Captura origen, destino y fecha del servicio.");
      return;
    }

    const detalle: ServicioDetalle = {
      id: servicioEditandoId || crearIdTemporal(),
      tipoServicio,
      subtipoServicio,
      origen: origen.trim(),
      destino: destino.trim(),
      fecha,
      numeroPasajeros: Number(numeroPasajeros || 1),
      nombresPasajeros: nombresPasajeros.trim(),
      tarifaReal: tarifaRealNumero,
      tarifaBase: tarifaBaseNumero,
      iva: ivaNumero,
      otrosCargos: otrosCargosNumero,
      totalCliente: totalServicioActual,
      utilidad: utilidadServicioActual,
    };

    if (servicioEditandoId) {
      setServiciosCotizacion((actuales) =>
        actuales.map((servicio) =>
          servicio.id === servicioEditandoId ? detalle : servicio,
        ),
      );
    } else {
      setServiciosCotizacion((actuales) => [...actuales, detalle]);
    }

    limpiarCamposServicio();
  };

  const editarServicioCotizacion = (servicio: ServicioDetalle) => {
    setServicioEditandoId(servicio.id);
    setTipoServicio(servicio.tipoServicio || "Traslado");
    setSubtipoServicio(servicio.subtipoServicio || "Con chofer");
    setOrigen(servicio.origen || "");
    setDestino(servicio.destino || "");
    setFecha(servicio.fecha || "");
    setNumeroPasajeros(Number(servicio.numeroPasajeros || 1));
    setNombresPasajeros(servicio.nombresPasajeros || "");
    setTarifaReal(String(servicio.tarifaReal || ""));
    setTarifaBase(String(servicio.tarifaBase || ""));
    setIva(String(servicio.iva || ""));
    setOtrosCargos(String(servicio.otrosCargos || ""));
  };

  const eliminarServicioCotizacion = (id: string) => {
    const confirmar = confirm("¿Eliminar este renglón de servicio?");
    if (!confirmar) return;

    setServiciosCotizacion((actuales) =>
      actuales.filter((servicio) => servicio.id !== id),
    );

    if (servicioEditandoId === id) {
      limpiarCamposServicio();
    }
  };

  const guardarServicio = async () => {
    if (!clienteId || !operador || !telefonoOperador) {
      alert("Completa cliente, operador y teléfono del operador.");
      return;
    }

    if (serviciosCotizacion.length === 0) {
      alert("Agrega por lo menos un servicio a la cotización.");
      return;
    }

    const primerServicio = serviciosCotizacion[0];

    const servicioData = {
      cliente_id: clienteId,
      operador,
      telefono_operador: telefonoOperador,
      unidad,
      servicio: serviciosCotizacion
        .map((servicio) => servicio.tipoServicio)
        .join(", "),
      subtipo: serviciosCotizacion
        .map((servicio) => servicio.subtipoServicio)
        .join(", "),
      origen:
        serviciosCotizacion.length === 1
          ? primerServicio.origen
          : serviciosCotizacion.map((servicio) => servicio.origen).join(" | "),
      destino:
        serviciosCotizacion.length === 1
          ? primerServicio.destino
          : serviciosCotizacion.map((servicio) => servicio.destino).join(" | "),
      fecha_servicio: primerServicio.fecha,
      pasajeros: numeroPasajerosCotizacion,
      nombres_pasajeros: serviciosCotizacion
        .map((servicio, index) =>
          servicio.nombresPasajeros
            ? `${index + 1}. ${servicio.nombresPasajeros}`
            : "",
        )
        .filter(Boolean)
        .join(" | "),
      tarifa_neta: tarifaRealCotizacion,
      iva_neta: otrosCargosCotizacion,
      total_neto: tarifaRealCotizacion + otrosCargosCotizacion,
      tarifa_publica: tarifaBaseCotizacion,
      iva_publica: ivaCotizacion,
      total_publico: totalClienteCotizacion,
      agente,
      porcentaje_comision: Number(porcentajeComision || 0),
      utilidad: utilidadCotizacion,
      comision: comisionCotizacion,
      anticipo: anticipoNumero,
      saldo_pendiente: saldoPendienteCotizacion,
      observaciones,
      estado,
      servicios_detalle: serviciosCotizacion,
    };

    if (editId) {
      const { error } = await supabase
        .from("mobility")
        .update(servicioData)
        .eq("id", editId);

      if (error) {
        alert("Error al actualizar en Supabase: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("mobility").insert([servicioData]);

      if (error) {
        alert("Error al guardar en Supabase: " + error.message);
        return;
      }
    }

    await cargarServicios();
    limpiarFormulario();
  };

  const editarServicio = (servicio: ServicioTransporte) => {
    setEditId(servicio.id);
    setClienteId(servicio.clienteId || "");
    setClienteNombre(servicio.clienteNombre || "");
    setClienteWhatsapp(servicio.clienteWhatsapp || "");
    setTipoCliente(servicio.tipoCliente || "");
    setOperador(servicio.operador || "");
    setTelefonoOperador(servicio.telefonoOperador || "");
    setUnidad(servicio.unidad || "");
    setServiciosCotizacion(servicio.serviciosDetalle || []);
    setAgente(servicio.agente || "");
    setPorcentajeComision(Number(servicio.porcentajeComision || 0));
    setAnticipo(String(servicio.anticipo || ""));
    setObservaciones(servicio.observaciones || "");
    setEstado(servicio.estado || "Cotizado");
    limpiarCamposServicio();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarServicio = async (id: string) => {
    const confirmar = confirm("¿Eliminar esta cotización de Mobility?");
    if (!confirmar) return;

    const { error } = await supabase.from("mobility").delete().eq("id", id);

    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }

    await cargarServicios();
  };

  const pintarPiePagina = (doc: jsPDF) => {
    doc.setFillColor(23, 37, 84);
    doc.rect(14, 280, 182, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(
      "Viajes Far Away Premium Mobility · WhatsApp 55 5650 1374",
      55,
      286,
    );

    doc.setTextColor(0, 0, 0);
  };

  const cargarLogoComoPng = (
    ruta: string,
  ): Promise<{ dataUrl: string; proporcion: number }> =>
    new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvasOriginal = document.createElement("canvas");
        canvasOriginal.width = img.naturalWidth;
        canvasOriginal.height = img.naturalHeight;

        const contextoOriginal = canvasOriginal.getContext("2d");
        if (!contextoOriginal) {
          reject(new Error("No fue posible preparar el logotipo."));
          return;
        }

        contextoOriginal.drawImage(img, 0, 0);

        const pixeles = contextoOriginal.getImageData(
          0,
          0,
          canvasOriginal.width,
          canvasOriginal.height,
        );

        let izquierda = canvasOriginal.width;
        let derecha = 0;
        let arriba = canvasOriginal.height;
        let abajo = 0;

        for (let y = 0; y < canvasOriginal.height; y += 1) {
          for (let x = 0; x < canvasOriginal.width; x += 1) {
            const alfa = pixeles.data[(y * canvasOriginal.width + x) * 4 + 3];
            if (alfa > 10) {
              izquierda = Math.min(izquierda, x);
              derecha = Math.max(derecha, x);
              arriba = Math.min(arriba, y);
              abajo = Math.max(abajo, y);
            }
          }
        }

        const tieneContenido = derecha >= izquierda && abajo >= arriba;
        const anchoRecorte = tieneContenido
          ? derecha - izquierda + 1
          : canvasOriginal.width;
        const altoRecorte = tieneContenido
          ? abajo - arriba + 1
          : canvasOriginal.height;

        const canvasRecortado = document.createElement("canvas");
        canvasRecortado.width = anchoRecorte;
        canvasRecortado.height = altoRecorte;

        const contextoRecortado = canvasRecortado.getContext("2d");
        if (!contextoRecortado) {
          reject(new Error("No fue posible recortar el logotipo."));
          return;
        }

        contextoRecortado.drawImage(
          canvasOriginal,
          tieneContenido ? izquierda : 0,
          tieneContenido ? arriba : 0,
          anchoRecorte,
          altoRecorte,
          0,
          0,
          anchoRecorte,
          altoRecorte,
        );

        resolve({
          dataUrl: canvasRecortado.toDataURL("image/png"),
          proporcion: anchoRecorte / altoRecorte,
        });
      };

      img.onerror = () => reject(new Error("No fue posible cargar el logotipo."));
      img.src = ruta;
    });

  const cargarPrimerLogoDisponible = async () => {
    const rutas = [
      "/faraway-premium.png",
      "/faraway-premium.webp",
      "/faraway.png",
    ];

    for (const ruta of rutas) {
      try {
        return await cargarLogoComoPng(`${ruta}?v=2`);
      } catch {
        // Intenta con la siguiente ruta.
      }
    }

    return null;
  };

  const pintarEncabezado = async (doc: jsPDF) => {
    doc.setFillColor(23, 37, 84);
    doc.roundedRect(14, 8, 46, 34, 2, 2, "F");

    const logo = await cargarPrimerLogoDisponible();

    if (logo) {
      const anchoMaximo = 40;
      const altoMaximo = 27;
      let anchoLogo = anchoMaximo;
      let altoLogo = anchoLogo / logo.proporcion;

      if (altoLogo > altoMaximo) {
        altoLogo = altoMaximo;
        anchoLogo = altoLogo * logo.proporcion;
      }

      const xLogo = 14 + (46 - anchoLogo) / 2;
      const yLogo = 8 + (34 - altoLogo) / 2;

      doc.addImage(logo.dataUrl, "PNG", xLogo, yLogo, anchoLogo, altoLogo);
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("FAR AWAY", 37, 27, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Viajes Far Away Premium Mobility", 105, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Av. Río Soto la Marina No. 81, Planta Alta", 105, 20);
    doc.text("Paseos de Churubusco, 09030, CDMX", 105, 25);
    doc.text("Tel. 55 8956 6540 · 55 8956 6541", 105, 30);
    doc.text("55 9691 0419 · 55 9696 8174", 105, 35);
    doc.text("premiummobility@viajesfaraway.com", 105, 40);

    doc.line(14, 45, 196, 45);
  };

  const generarPDF = async (servicio: ServicioTransporte) => {
    const doc = new jsPDF();
    const fechaHoy = new Date().toLocaleDateString("es-MX");
    const detalles = servicio.serviciosDetalle?.length
      ? servicio.serviciosDetalle
      : [
          {
            id: crearIdTemporal(),
            tipoServicio: servicio.tipoServicio,
            subtipoServicio: servicio.subtipoServicio,
            origen: servicio.origen,
            destino: servicio.destino,
            fecha: servicio.fecha,
            numeroPasajeros: servicio.numeroPasajeros,
            nombresPasajeros: servicio.nombresPasajeros,
            tarifaReal: servicio.tarifaReal,
            tarifaBase: servicio.tarifaBase,
            iva: servicio.iva,
            otrosCargos: servicio.otrosCargos,
            totalCliente: servicio.totalCliente,
            utilidad: servicio.utilidad,
          },
        ];

    await pintarEncabezado(doc);

    doc.setFontSize(16);
    doc.text("COTIZACIÓN", 14, 56);

    doc.setFontSize(10);
    doc.text("Fecha de elaboración: " + fechaHoy, 14, 64);
    doc.text("Cliente: " + (servicio.clienteNombre || "N/A"), 14, 70);
    doc.text("Tipo de cliente: " + (servicio.tipoCliente || "N/A"), 14, 76);
    doc.text("Agente: " + (servicio.agente || "N/A"), 14, 82);
    doc.text("Operador: " + (servicio.operador || "N/A"), 14, 88);
    doc.text("Teléfono operador: " + (servicio.telefonoOperador || "N/A"), 14, 94);
    doc.text("Unidad: " + (servicio.unidad || "N/A"), 14, 100);

    autoTable(doc, {
      startY: 108,
      head: [["#", "Servicio", "Ruta", "Fecha", "Pax", "Pasajeros", "Total"]],
      body: detalles.map((detalle, index) => [
        String(index + 1),
        `${detalle.tipoServicio} / ${detalle.subtipoServicio}`,
        `${detalle.origen} a ${detalle.destino}`,
        detalle.fecha || "N/A",
        String(detalle.numeroPasajeros || 0),
        detalle.nombresPasajeros || "N/A",
        formatoMoneda(detalle.totalCliente),
      ]),
      headStyles: { fillColor: [23, 37, 84], font: "helvetica", fontStyle: "bold" },
      bodyStyles: { font: "helvetica", fontStyle: "normal", fontSize: 8.5 },
      styles: { font: "helvetica", fontStyle: "normal" },
    });

    let startY = (doc as any).lastAutoTable.finalY + 10;

    autoTable(doc, {
      startY,
      head: [["Concepto", "Importe"]],
      body: [
        ["Tarifa base", formatoMoneda(servicio.tarifaBase)],
        ["IVA", formatoMoneda(servicio.iva)],
        ["Otros cargos", formatoMoneda(servicio.otrosCargos)],
        ["Total", formatoMoneda(servicio.totalCliente)],
        ["Anticipo", formatoMoneda(servicio.anticipo)],
        ["Saldo pendiente", formatoMoneda(servicio.saldoPendiente)],
      ],
      headStyles: { fillColor: [23, 37, 84] },
    });

    startY = (doc as any).lastAutoTable.finalY + 10;

    if (servicio.observaciones) {
      autoTable(doc, {
        startY,
        head: [["Observaciones"]],
        body: [[servicio.observaciones]],
        headStyles: { fillColor: [23, 37, 84] },
      });

      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(
      "Cotización sujeta a disponibilidad y confirmación del servicio.",
      14,
      Math.min(startY, 260),
    );

    pintarPiePagina(doc);

    doc.save(
      "Cotizacion_Mobility_" +
        (servicio.clienteNombre || "servicio").replaceAll(" ", "_") +
        ".pdf",
    );
  };

  const abrirWhatsApp = (servicio: ServicioTransporte) => {
    const telefono = (servicio.clienteWhatsapp || "").replace(/\D/g, "");

    if (!telefono) {
      alert("Este cliente no tiene un número de WhatsApp registrado.");
      return;
    }

    const telefonoConPais = telefono.startsWith("52")
      ? telefono
      : `52${telefono}`;

    const mensaje = encodeURIComponent(
      `Hola ${servicio.clienteNombre || ""}, te compartimos tu cotización de Mobility con ${servicio.serviciosDetalle.length || 1} servicio(s): ${textoServiciosResumen(servicio.serviciosDetalle)}. Total: ${formatoMoneda(servicio.totalCliente)}.`,
    );

    window.open(
      `https://wa.me/${telefonoConPais}?text=${mensaje}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const totalServicios = servicios.reduce(
    (sum, servicio) => sum + Math.max(servicio.serviciosDetalle.length, 1),
    0,
  );
  const totalCotizaciones = servicios.length;
  const totalVendido = servicios.reduce(
    (sum, servicio) => sum + servicio.totalCliente,
    0,
  );
  const utilidadTotal = servicios.reduce(
    (sum, servicio) => sum + servicio.utilidad,
    0,
  );
  const saldoPendienteTotal = servicios.reduce(
    (sum, servicio) => sum + servicio.saldoPendiente,
    0,
  );

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-950 mb-2">
        Mobility Premium 🚐
      </h1>

      <p className="text-gray-600 mb-6">
        Control de cotizaciones terrestres con uno o varios servicios por cliente.
      </p>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-950 text-white p-4 rounded">
          <div className="text-sm">Cotizaciones registradas</div>
          <div className="text-3xl font-bold">{totalCotizaciones}</div>
        </div>

        <div className="bg-green-700 text-white p-4 rounded">
          <div className="text-sm">Total vendido</div>
          <div className="text-3xl font-bold">
            {formatoMoneda(totalVendido)}
          </div>
        </div>

        <div className="bg-blue-700 text-white p-4 rounded">
          <div className="text-sm">Utilidad</div>
          <div className="text-3xl font-bold">
            {formatoMoneda(utilidadTotal)}
          </div>
        </div>

        <div className="bg-red-700 text-white p-4 rounded">
          <div className="text-sm">Saldo pendiente</div>
          <div className="text-3xl font-bold">
            {formatoMoneda(saldoPendienteTotal)}
          </div>
        </div>
      </section>

      <section className="border p-4 mb-6">
        <h2 className="font-bold mb-3">1. Cliente</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            className="border p-2 rounded"
            value={clienteId}
            onChange={(e) => seleccionarCliente(e.target.value)}
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre_cliente || cliente.empresa || "Sin nombre"}
              </option>
            ))}
          </select>

          <input
            className="border p-2 rounded bg-gray-100"
            value={`Tipo de cliente: ${tipoCliente || "N/A"}`}
            readOnly
          />

          <input
            className="border p-2 rounded bg-gray-100"
            value={`Cliente: ${clienteNombre || "N/A"}`}
            readOnly
          />
        </div>
      </section>

      <section className="border p-4 mb-6">
        <h2 className="font-bold mb-3">2. Operador y unidad</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Nombre del operador"
            value={operador}
            onChange={(e) => setOperador(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Teléfono del operador"
            value={telefonoOperador}
            onChange={(e) => setTelefonoOperador(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Unidad / tipo de unidad"
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
          />
        </div>
      </section>

      <section className="border p-4 mb-6">
        <h2 className="font-bold mb-3">
          3. Agregar servicios a la cotización
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
          <select
            className="border p-2 rounded"
            value={tipoServicio}
            onChange={(e) => setTipoServicio(e.target.value)}
          >
            <option>Tour</option>
            <option>Traslado</option>
            <option>Experiencia</option>
            <option>Servicios terrestres</option>
            <option>Renta de unidad</option>
          </select>

          <select
            className="border p-2 rounded"
            value={subtipoServicio}
            onChange={(e) => setSubtipoServicio(e.target.value)}
          >
            <option>Con chofer</option>
            <option>Sin chofer</option>
            <option>Renta sin chofer</option>
          </select>

          <input
            className="border p-2 rounded"
            placeholder="Origen"
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Destino"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
          />

          <label className="border p-2 rounded flex items-center gap-2">
            <span className="font-semibold">🗓️ Fecha:</span>
            <input
              type="date"
              className="flex-1 outline-none"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input
            type="number"
            className="border p-2 rounded"
            value={numeroPasajeros}
            onChange={(e) => setNumeroPasajeros(Number(e.target.value || 1))}
          />

          <input
            className="border p-2 rounded"
            placeholder="Nombre de pasajeros"
            value={nombresPasajeros}
            onChange={(e) => setNombresPasajeros(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
          <input
            type="number"
            step="0.01"
            className="border p-2 rounded"
            placeholder="Tarifa Real"
            value={tarifaReal}
            onChange={(e) => setTarifaReal(e.target.value)}
          />

          <input
            type="number"
            step="0.01"
            className="border p-2 rounded"
            placeholder="Tarifa Base"
            value={tarifaBase}
            onChange={(e) => setTarifaBase(e.target.value)}
          />

          <input
            type="number"
            step="0.01"
            className="border p-2 rounded"
            placeholder="IVA"
            value={iva}
            onChange={(e) => setIva(e.target.value)}
          />

          <input
            type="number"
            step="0.01"
            className="border p-2 rounded"
            placeholder="Otros Cargos"
            value={otrosCargos}
            onChange={(e) => setOtrosCargos(e.target.value)}
          />

          <input
            className="border p-2 rounded bg-gray-100 font-bold"
            value={`Total servicio: ${formatoMoneda(totalServicioActual)}`}
            readOnly
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={agregarServicioCotizacion}
            className="bg-blue-950 text-white px-4 py-2 rounded"
          >
            {servicioEditandoId
              ? "Actualizar renglón de servicio"
              : "Agregar servicio a cotización"}
          </button>

          {servicioEditandoId && (
            <button
              onClick={limpiarCamposServicio}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancelar edición de renglón
            </button>
          )}
        </div>

        <div className="mt-5 overflow-x-auto">
          <h3 className="font-bold mb-2">Servicios de esta cotización</h3>

          <table className="w-full border text-sm">
            <thead className="bg-blue-950 text-white">
              <tr>
                <th className="p-2 border">Servicio</th>
                <th className="p-2 border">Ruta</th>
                <th className="p-2 border">Fecha</th>
                <th className="p-2 border">Pax</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Acción</th>
              </tr>
            </thead>

            <tbody>
              {serviciosCotizacion.length === 0 ? (
                <tr>
                  <td className="p-3 border text-center text-gray-500" colSpan={6}>
                    Agrega uno o más servicios para esta cotización.
                  </td>
                </tr>
              ) : (
                serviciosCotizacion.map((servicio) => (
                  <tr key={servicio.id}>
                    <td className="p-2 border">
                      {servicio.tipoServicio} / {servicio.subtipoServicio}
                    </td>
                    <td className="p-2 border">
                      {servicio.origen} → {servicio.destino}
                    </td>
                    <td className="p-2 border">{servicio.fecha || "N/A"}</td>
                    <td className="p-2 border">{servicio.numeroPasajeros}</td>
                    <td className="p-2 border">
                      {formatoMoneda(servicio.totalCliente)}
                    </td>
                    <td className="p-2 border">
                      <button
                        onClick={() => editarServicioCotizacion(servicio)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-1"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarServicioCotizacion(servicio.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border p-4 mb-6">
        <h2 className="font-bold mb-3">4. Agente, comisión y totales</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Agente"
            value={agente}
            onChange={(e) => setAgente(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={porcentajeComision}
            onChange={(e) => setPorcentajeComision(Number(e.target.value))}
          >
            <option value={0}>0% / Sin comisión</option>
            <option value={5}>5%</option>
            <option value={10}>10%</option>
            <option value={15}>15%</option>
            <option value={18}>18%</option>
          </select>

          <input
            className="border p-2 rounded bg-gray-100"
            value={`Total cotización: ${formatoMoneda(totalClienteCotizacion)}`}
            readOnly
          />

          <input
            className="border p-2 rounded bg-gray-100"
            value={`Utilidad: ${formatoMoneda(utilidadCotizacion)}`}
            readOnly
          />

          <input
            className="border p-2 rounded bg-gray-100 font-bold"
            value={`Comisión: ${formatoMoneda(comisionCotizacion)}`}
            readOnly
          />
        </div>
      </section>

      <section className="border p-4 mb-6">
        <h2 className="font-bold mb-3">5. Pagos y observaciones</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            type="number"
            step="0.01"
            className="border p-2 rounded"
            placeholder="Anticipo"
            value={anticipo}
            onChange={(e) => setAnticipo(e.target.value)}
          />

          <input
            className="border p-2 rounded bg-gray-100 font-bold"
            value={`Saldo pendiente: ${formatoMoneda(saldoPendienteCotizacion)}`}
            readOnly
          />

          <select
            className="border p-2 rounded"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option>Cotizado</option>
            <option>Confirmado</option>
            <option>Operado</option>
            <option>Cancelado</option>
          </select>
        </div>

        <textarea
          className="border p-2 rounded w-full h-24"
          placeholder="Observaciones / Información adicional"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </section>

      <button
        onClick={guardarServicio}
        className="bg-blue-950 text-white px-4 py-2 rounded mb-6"
      >
        {editId ? "Actualizar cotización" : "Guardar cotización"}
      </button>

      {editId && (
        <button
          onClick={limpiarFormulario}
          className="bg-gray-600 text-white px-4 py-2 rounded mb-6 ml-2"
        >
          Cancelar edición
        </button>
      )}

      <section className="border p-4 overflow-x-auto">
        <h2 className="font-bold mb-3">Cotizaciones registradas</h2>

        <table className="w-full border text-sm">
          <thead className="bg-blue-950 text-white">
            <tr>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border">Tipo</th>
              <th className="p-2 border">Operador</th>
              <th className="p-2 border">Tel. operador</th>
              <th className="p-2 border">Servicios</th>
              <th className="p-2 border">Rutas</th>
              <th className="p-2 border">Fecha</th>
              <th className="p-2 border">Pax</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Utilidad</th>
              <th className="p-2 border">Estado</th>
              <th className="p-2 border">Acción</th>
            </tr>
          </thead>

          <tbody>
            {servicios.length === 0 ? (
              <tr>
                <td className="p-3 border text-center text-gray-500" colSpan={12}>
                  No hay cotizaciones registradas.
                </td>
              </tr>
            ) : (
              servicios.map((servicio) => (
                <tr key={servicio.id}>
                  <td className="p-2 border">{servicio.clienteNombre}</td>
                  <td className="p-2 border">{servicio.tipoCliente}</td>
                  <td className="p-2 border">{servicio.operador}</td>
                  <td className="p-2 border">{servicio.telefonoOperador}</td>
                  <td className="p-2 border">
                    {servicio.serviciosDetalle.length} servicio(s)
                  </td>
                  <td className="p-2 border">
                    {servicio.serviciosDetalle
                      .map((detalle) => `${detalle.origen} → ${detalle.destino}`)
                      .join(" | ")}
                  </td>
                  <td className="p-2 border">{servicio.fecha || "N/A"}</td>
                  <td className="p-2 border">{servicio.numeroPasajeros}</td>
                  <td className="p-2 border">
                    {formatoMoneda(servicio.totalCliente)}
                  </td>
                  <td className="p-2 border">
                    {formatoMoneda(servicio.utilidad)}
                  </td>
                  <td className="p-2 border">{servicio.estado}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => editarServicio(servicio)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-1"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => generarPDF(servicio)}
                      className="bg-blue-950 text-white px-2 py-1 rounded mr-1"
                    >
                      PDF
                    </button>

                    <button
                      onClick={() => abrirWhatsApp(servicio)}
                      className="bg-green-700 text-white px-2 py-1 rounded mr-1"
                    >
                      WhatsApp
                    </button>

                    <button
                      onClick={() => eliminarServicio(servicio.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
