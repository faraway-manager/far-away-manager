"use client";

import { useEffect, useState } from "react";

type Tarifa = {
  servicio: string;
  destino: string;
  precio: number;
};

export default function TarifarioPage() {
  const [servicio, setServicio] = useState("");
  const [destino, setDestino] = useState("");
  const [precio, setPrecio] = useState<number | "">("");

  const [tarifas, setTarifas] = useState<Tarifa[]>([]);

  // Cargar tarifas
  useEffect(() => {
    const data = localStorage.getItem("tarifas");
    if (data) {
      setTarifas(JSON.parse(data));
    }
  }, []);

  // Guardar en localStorage
  const guardarEnStorage = (lista: Tarifa[]) => {
    localStorage.setItem("tarifas", JSON.stringify(lista));
  };

  // Agregar tarifa
  const agregarTarifa = () => {
    if (!servicio || !destino || !precio) return;

    const nueva = {
      servicio,
      destino,
      precio: Number(precio),
    };

    const nuevaLista = [...tarifas, nueva];
    setTarifas(nuevaLista);
    guardarEnStorage(nuevaLista);

    // limpiar
    setServicio("");
    setDestino("");
    setPrecio("");
  };

  // Eliminar
  const eliminarTarifa = (index: number) => {
    const nuevaLista = tarifas.filter((_, i) => i !== index);
    setTarifas(nuevaLista);
    guardarEnStorage(nuevaLista);
  };

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-6">Tarifario 💰</h1>

      {/* FORMULARIO */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          placeholder="Servicio (Tour, Traslado...)"
          value={servicio}
          onChange={(e) => setServicio(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          className="border p-2"
        />

        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(Number(e.target.value))}
          className="border p-2"
        />
      </div>

      <button
        onClick={agregarTarifa}
        className="bg-blue-950 text-white px-4 py-2 mb-6"
      >
        Guardar tarifa
      </button>

      {/* TABLA */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Servicio</th>
            <th className="border p-2">Destino</th>
            <th className="border p-2">Precio</th>
            <th className="border p-2">Acción</th>
          </tr>
        </thead>

        <tbody>
          {tarifas.map((t, i) => (
            <tr key={i} className="text-center">
              <td className="border p-2">{t.servicio}</td>
              <td className="border p-2">{t.destino}</td>
              <td className="border p-2">${t.precio}</td>
              <td className="border p-2">
                <button
                  onClick={() => eliminarTarifa(i)}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}

          {tarifas.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center">
                No hay tarifas registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}