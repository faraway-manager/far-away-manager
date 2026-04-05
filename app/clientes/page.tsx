"use client";

import { useEffect, useState } from "react";

type Cliente = {
  nombre: string;
  telefono: string;
  destino: string;
  personas: number;
  fecha: string;
};

export default function ClientesPage() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [destino, setDestino] = useState("");
  const [personas, setPersonas] = useState<number | "">("");
  const [fecha, setFecha] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // 🔄 Cargar desde localStorage
  useEffect(() => {
    const data = localStorage.getItem("clientes");
    if (data) {
      setClientes(JSON.parse(data));
    }
  }, []);

  // 💾 Guardar en localStorage
  const guardarEnStorage = (lista: Cliente[]) => {
    localStorage.setItem("clientes", JSON.stringify(lista));
  };

  // ➕ Guardar o editar
  const guardarCliente = () => {
    if (!nombre || !destino || !personas) {
      alert("Completa los campos obligatorios");
      return;
    }

    const nuevo: Cliente = {
      nombre,
      telefono,
      destino,
      personas: Number(personas),
      fecha,
    };

    let nuevaLista: Cliente[];

    if (editIndex !== null) {
      nuevaLista = [...clientes];
      nuevaLista[editIndex] = nuevo;
      setEditIndex(null);
    } else {
      nuevaLista = [...clientes, nuevo];
    }

    setClientes(nuevaLista);
    guardarEnStorage(nuevaLista);

    limpiarFormulario();
  };

  // ❌ Eliminar
  const eliminarCliente = (index: number) => {
    const nuevaLista = clientes.filter((_, i) => i !== index);
    setClientes(nuevaLista);
    guardarEnStorage(nuevaLista);
  };

  // ✏️ Editar
  const editarCliente = (index: number) => {
    const c = clientes[index];
    setNombre(c.nombre);
    setTelefono(c.telefono);
    setDestino(c.destino);
    setPersonas(c.personas);
    setFecha(c.fecha);
    setEditIndex(index);
  };

  // 🧹 Limpiar
  const limpiarFormulario = () => {
    setNombre("");
    setTelefono("");
    setDestino("");
    setPersonas("");
    setFecha("");
  };

  return (
    <main className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Clientes 🧾
      </h1>

      {/* FORMULARIO */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          placeholder="Nombre"
          className="border p-2"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          placeholder="Destino"
          className="border p-2"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        />

        <input
          placeholder="Teléfono"
          className="border p-2"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />

        <input
          type="date"
          className="border p-2"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <input
          placeholder="Personas"
          type="number"
          className="border p-2 col-span-2"
          value={personas}
          onChange={(e) =>
            setPersonas(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      </div>

      <button
        onClick={guardarCliente}
        className="bg-blue-950 text-white px-4 py-2 rounded w-full mb-6"
      >
        {editIndex !== null ? "Actualizar cliente" : "Guardar cliente"}
      </button>

      {/* LISTA */}
      <div className="space-y-4">
        {clientes.map((c, index) => (
          <div
            key={index}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-bold">
                {c.nombre} - {c.destino}
              </p>
              <p>📞 {c.telefono}</p>
<p>📅 Cotizado el: {c.fecha}</p>
              <p>👥 {c.personas} personas</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => editarCliente(index)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Editar
              </button>

              <button
                onClick={() => eliminarCliente(index)}
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