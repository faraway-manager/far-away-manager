"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import * as XLSX from "xlsx";

type TipoCliente = "personal" | "empresarial" | "vip";

type Cliente = {
  id?: string;
  tipo_cliente: TipoCliente;
  nombre_cliente: string | null;
  empresa: string | null;
  contacto: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  destino: string | null;
  nombre_pax: string | null;
  observaciones: string | null;
  fecha_salida: string | null;
  fecha_llegada: string | null;
  created_at?: string;
};

export default function ClientesPage() {
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>("personal");

  const [nombreCliente, setNombreCliente] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [contacto, setContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Error al cargar clientes: " + error.message);
      return;
    }

    setClientes(data || []);
  };

  const limpiarFormulario = () => {
    setTipoCliente("personal");
    setNombreCliente("");
    setEmpresa("");
    setContacto("");
    setTelefono("");
    setWhatsapp("");
    setEmail("");
    setObservaciones("");
    setEditId(null);
  };

  const cambiarTipoCliente = (tipo: TipoCliente) => {
    setTipoCliente(tipo);

    if (tipo === "empresarial") {
      setNombreCliente("");
    }

    if (tipo === "personal") {
      setEmpresa("");
      setContacto("");
    }
  };

  const validarFormulario = () => {
    const telefonoOk = telefono.trim();
    const whatsappOk = whatsapp.trim();
    const emailOk = email.trim();

    if (tipoCliente === "personal") {
      return nombreCliente.trim() && telefonoOk && whatsappOk && emailOk;
    }

    if (tipoCliente === "empresarial") {
      return (
        empresa.trim() && contacto.trim() && telefonoOk && whatsappOk && emailOk
      );
    }

    if (tipoCliente === "vip") {
      return (
        (nombreCliente.trim() || empresa.trim()) &&
        telefonoOk &&
        whatsappOk &&
        emailOk
      );
    }

    return false;
  };

  const guardarCliente = async () => {
    if (!validarFormulario()) {
      alert(
        tipoCliente === "empresarial"
          ? "Completa Empresa, Contacto, Teléfono, WhatsApp y Email."
          : "Completa Nombre, Teléfono, WhatsApp y Email."
      );
      return;
    }

    const clienteData = {
      tipo_cliente: tipoCliente,
      nombre_cliente:
        tipoCliente === "empresarial" ? null : nombreCliente.trim() || null,
      empresa:
        tipoCliente === "empresarial" || tipoCliente === "vip"
          ? empresa.trim() || null
          : null,
      contacto:
        tipoCliente === "empresarial" || tipoCliente === "vip"
          ? contacto.trim() || null
          : null,
      telefono: telefono.trim() || null,
      whatsapp: whatsapp.trim() || null,
      email: email.trim() || null,
      observaciones: observaciones.trim() || null,
    };

    if (editId) {
      const { error } = await supabase
        .from("clientes")
        .update(clienteData)
        .eq("id", editId);

      if (error) {
        alert("Error al actualizar cliente: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("clientes").insert([clienteData]);

      if (error) {
        alert("Error al guardar cliente: " + error.message);
        return;
      }
    }

    await cargarClientes();
    limpiarFormulario();
  };

  const editarCliente = (cliente: Cliente) => {
    setTipoCliente(cliente.tipo_cliente || "personal");
    setNombreCliente(cliente.nombre_cliente || "");
    setEmpresa(cliente.empresa || "");
    setContacto(cliente.contacto || "");
    setTelefono(cliente.telefono || "");
    setWhatsapp(cliente.whatsapp || "");
    setEmail(cliente.email || "");
    setObservaciones(cliente.observaciones || "");
    setEditId(cliente.id || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportarClientesExcel = () => {
    if (clientes.length === 0) {
      alert("No hay clientes para exportar");
      return;
    }

    const datosExcel = clientes.map((cliente) => ({
      "Tipo de cliente": cliente.tipo_cliente || "",
      Nombre: cliente.nombre_cliente || "",
      Empresa: cliente.empresa || "",
      Contacto: cliente.contacto || "",
      Teléfono: cliente.telefono || "",
      WhatsApp: cliente.whatsapp || "",
      Correo: cliente.email || "",
      Destino: cliente.destino || "",
      Salida: cliente.fecha_salida || "",
      Regreso: cliente.fecha_llegada || "",
      Pax: cliente.nombre_pax || "",
      Observaciones: cliente.observaciones || "",
    }));

    const hoja = XLSX.utils.json_to_sheet(datosExcel);
    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hoja, "Clientes");

    XLSX.writeFile(libro, "clientes_far_away.xlsx");
  };

  const eliminarCliente = async (id?: string) => {
    if (!id) return;

    const confirmar = confirm("¿Eliminar este cliente?");
    if (!confirmar) return;

    const { error } = await supabase.from("clientes").delete().eq("id", id);

    if (error) {
      alert("Error al eliminar cliente: " + error.message);
      return;
    }

    await cargarClientes();
  };

  return (
    <main className="p-6 w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-950">
        Clientes 🧾
      </h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => cambiarTipoCliente("personal")}
          className={`px-4 py-2 rounded text-white ${
            tipoCliente === "personal" ? "bg-blue-950" : "bg-blue-900"
          }`}
        >
          Personal
        </button>

        <button
          onClick={() => cambiarTipoCliente("empresarial")}
          className={`px-4 py-2 rounded text-white ${
            tipoCliente === "empresarial" ? "bg-blue-950" : "bg-blue-900"
          }`}
        >
          Empresarial
        </button>

        <button
          onClick={() => cambiarTipoCliente("vip")}
          className={`px-4 py-2 rounded text-white ${
            tipoCliente === "vip" ? "bg-blue-950" : "bg-blue-900"
          }`}
        >
          VIP
        </button>
      </div>

      <section className="border p-4 rounded mb-6">
        <h2 className="font-bold mb-3">Datos del cliente</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {tipoCliente !== "empresarial" && (
            <input
              placeholder="Nombre completo"
              className="border p-2"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
            />
          )}

          {(tipoCliente === "empresarial" || tipoCliente === "vip") && (
            <input
              placeholder="Nombre de la empresa"
              className="border p-2"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />
          )}

          {(tipoCliente === "empresarial" || tipoCliente === "vip") && (
            <input
              placeholder="Nombre del contacto"
              className="border p-2"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
            />
          )}

          <input
            placeholder="Teléfono"
            className="border p-2"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <input
            placeholder="WhatsApp"
            className="border p-2"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />

          <input
            placeholder="Correo electrónico"
            className="border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <textarea
            placeholder="Información adicional / Observaciones"
            className="border p-2 md:col-span-2"
            rows={4}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <button
          onClick={guardarCliente}
          className="bg-blue-950 text-white px-4 py-2 rounded w-full mb-3"
        >
          {editId ? "Actualizar cliente" : "Guardar cliente"}
        </button>

        <button
          onClick={exportarClientesExcel}
          className="bg-green-700 text-white px-4 py-2 rounded w-full mb-3"
        >
          Exportar clientes a Excel
        </button>

        {editId && (
          <button
            onClick={limpiarFormulario}
            className="bg-gray-700 text-white px-4 py-2 rounded w-full"
          >
            Cancelar edición
          </button>
        )}
      </section>

      <section className="space-y-4">
        {clientes.length === 0 ? (
          <div className="border p-4 rounded text-center">
            No hay clientes registrados
          </div>
        ) : (
          clientes.map((cliente) => (
            <div
              key={cliente.id}
              className="border p-4 rounded flex flex-col md:flex-row md:justify-between md:items-start gap-4"
            >
              <div>
                <p className="font-bold text-blue-950">
                  {cliente.tipo_cliente?.toUpperCase()} -{" "}
                  {cliente.nombre_cliente || cliente.empresa || "Sin nombre"}
                </p>

                <p>👤 Contacto: {cliente.contacto || "N/A"}</p>
                <p>🏢 Empresa: {cliente.empresa || "N/A"}</p>
                <p>📞 Teléfono: {cliente.telefono || "N/A"}</p>
                <p>💬 WhatsApp: {cliente.whatsapp || "N/A"}</p>
                <p>✉️ Email: {cliente.email || "N/A"}</p>
                <p>
                  📝 Observaciones:{" "}
                  {cliente.observaciones || "Sin observaciones"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => editarCliente(cliente)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>

                <button
                  onClick={() => eliminarCliente(cliente.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
