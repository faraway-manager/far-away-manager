"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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
  const [destino, setDestino] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [fechaLlegada, setFechaLlegada] = useState("");
  const [nombrePax, setNombrePax] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [accesoPermitido, setAccesoPermitido] = useState(false);
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

    setClientes((data || []) as Cliente[]);
  };

  const limpiarFormulario = () => {
    setTipoCliente("personal");
    setNombreCliente("");
    setEmpresa("");
    setContacto("");
    setTelefono("");
    setWhatsapp("");
    setEmail("");
    setDestino("");
    setFechaSalida("");
    setFechaLlegada("");
    setNombrePax("");
    setObservaciones("");
    setEditId(null);
  };

  const validarFormulario = () => {
    if (tipoCliente === "personal") {
      return nombreCliente && telefono && whatsapp && email && destino && nombrePax;
    }

    if (tipoCliente === "empresarial") {
      return empresa && telefono && contacto && email && whatsapp && destino && nombrePax;
    }

    if (tipoCliente === "vip") {
      return nombreCliente && telefono && contacto && email && whatsapp && destino && nombrePax;
    }

    return false;
  };

  const guardarCliente = async () => {
    if (!validarFormulario()) {
      alert("Completa los campos obligatorios.");
      return;
    }

    const clienteData = {
      tipo_cliente: tipoCliente,
      nombre_cliente: nombreCliente || null,
      empresa: empresa || null,
      contacto: contacto || null,
      telefono: telefono || null,
      whatsapp: whatsapp || null,
      email: email || null,
      destino: destino || null,
      fecha_salida: fechaSalida || null,
      fecha_llegada: fechaLlegada || null,
      nombre_pax: nombrePax || null,
      observaciones: observaciones || null,
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
    setDestino(cliente.destino || "");
    setFechaSalida(cliente.fecha_salida || "");
    setFechaLlegada(cliente.fecha_llegada || "");
    setNombrePax(cliente.nombre_pax || "");
    setObservaciones(cliente.observaciones || "");
    setEditId(cliente.id || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <main className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Clientes 🧾
      </h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTipoCliente("personal")}
          className={`px-4 py-2 rounded text-white ${
            tipoCliente === "personal" ? "bg-blue-950" : "bg-gray-500"
          }`}
        >
          Personal
        </button>

        <button
          onClick={() => setTipoCliente("empresarial")}
          className={`px-4 py-2 rounded text-white ${
            tipoCliente === "empresarial" ? "bg-blue-950" : "bg-gray-500"
          }`}
        >
          Empresarial
        </button>

        <button
          onClick={() => setTipoCliente("vip")}
          className={`px-4 py-2 rounded text-white ${
            tipoCliente === "vip" ? "bg-blue-950" : "bg-gray-500"
          }`}
        >
          VIP
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {tipoCliente === "personal" && (
          <input
            placeholder="Nombre completo"
            className="border p-2"
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
          />
        )}

        {tipoCliente === "empresarial" && (
          <>
            <input
              placeholder="Nombre de la empresa"
              className="border p-2"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />

            <input
              placeholder="Nombre del contacto"
              className="border p-2"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
            />
          </>
        )}

        {tipoCliente === "vip" && (
          <>
            <input
              placeholder="Nombre del cliente o empresa"
              className="border p-2"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
            />

            <input
              placeholder="Nombre del contacto"
              className="border p-2"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
            />
          </>
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
          type="email"
          className="border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Destino"
          className="border p-2"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        />

        <label className="border p-2 flex items-center gap-2">
          <span className="font-semibold">📅 Fecha de viaje:</span>
          <input
            type="date"
            className="flex-1 outline-none"
            value={fechaSalida}
            onChange={(e) => setFechaSalida(e.target.value)}
          />
        </label>

        <input
          placeholder="pax"
          className="border p-2"
          value={nombrePax}
          onChange={(e) => setNombrePax(e.target.value)}
        />

        <textarea
          placeholder="Información adicional / Observaciones"
          className="border p-2 col-span-2 min-h-[90px]"
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

      {editId && (
        <button
          onClick={limpiarFormulario}
          className="bg-gray-600 text-white px-4 py-2 rounded w-full mb-6"
        >
          Cancelar edición
        </button>
      )}

      <div className="space-y-4">
        {clientes.map((cliente) => (
          <div
            key={cliente.id}
            className="border p-4 rounded flex justify-between items-start"
          >
            <div>
              <p className="font-bold">
                {cliente.tipo_cliente?.toUpperCase()} ·{" "}
                {cliente.nombre_cliente || cliente.empresa} -{" "}
                {cliente.destino}
              </p>
              <p>👤 Contacto: {cliente.contacto || "N/A"}</p>
              <p>📞 Teléfono: {cliente.telefono || "N/A"}</p>
              <p>💬 WhatsApp: {cliente.whatsapp || "N/A"}</p>
              <p>✉️ Email: {cliente.email || "N/A"}</p>
              <p>📅 Salida: {cliente.fecha_salida || "Sin fecha"}</p>
              <p>📅 Regreso: {cliente.fecha_llegada || "Sin fecha"}</p>

              <p>👥 Nombre de pax: {cliente.nombre_pax || "N/A"}</p>
              <p>📝 Observaciones: {cliente.observaciones || "Sin observaciones"}</p>
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
        ))}
      </div>
    </main>
  );
}