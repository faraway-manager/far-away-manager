"use client";

import { useEffect, useState } from "react";

type Cotizacion = {
  cliente: string;
  destino: string;
  pasajeros: number;
  costo: number;
  total: number;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  seleccionado: boolean;
};

export default function CotizadorPage() {
  const [cliente, setCliente] = useState("");
  const [destino, setDestino] = useState("");
  const [pasajeros, setPasajeros] = useState(1);
  const [costo, setCosto] = useState(0);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [tarifas, setTarifas] = useState<any[]>([]);

  // cargar cotizaciones
  useEffect(() => {
    const data = localStorage.getItem("cotizaciones");
    if (data) setCotizaciones(JSON.parse(data));
  }, []);

  // guardar cotizaciones
  useEffect(() => {
    localStorage.setItem("cotizaciones", JSON.stringify(cotizaciones));
  }, [cotizaciones]);

  // cargar tarifas
  useEffect(() => {
    const data = localStorage.getItem("tarifas");
    if (data) setTarifas(JSON.parse(data));
  }, []);

  // AUTOCOMPLETAR PRECIO
  const handleDestinoChange = (value: string) => {
    setDestino(value);

    const encontrada = tarifas.find(
      (t) =>
        t.destino &&
        t.destino.toLowerCase() === value.toLowerCase()
    );

    if (encontrada) {
      setCosto(Number(encontrada.precio));
    }
  };

  const agregarCotizacion = () => {
    const total = pasajeros * costo;

    const nueva: Cotizacion = {
      cliente,
      destino,
      pasajeros,
      costo,
      total,
      fechaInicio,
      fechaFin,
      descripcion,
      seleccionado: false,
    };

    setCotizaciones([...cotizaciones, nueva]);

    // limpiar
    setCliente("");
    setDestino("");
    setPasajeros(1);
    setCosto(0);
    setFechaInicio("");
    setFechaFin("");
    setDescripcion("");
  };

  const toggleSeleccion = (index: number) => {
    const nuevas = cotizaciones.map((c, i) =>
      i === index ? { ...c, seleccionado: !c.seleccionado } : c
    );
    setCotizaciones(nuevas);
  };

  const eliminarSeleccionados = () => {
    const filtradas = cotizaciones.filter((c) => !c.seleccionado);
    setCotizaciones(filtradas);
  };

  return (
    <main className="p-6 w-full">

      <h1 className="text-2xl font-bold mb-4">
        Cotizador ✈️
      </h1>

      {/* FORMULARIO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        <input
          className="border p-2 rounded"
          placeholder="Cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />

        <input
          className="border p-2 rounded"
          placeholder="Destino"
          value={destino}
          onChange={(e) => handleDestinoChange(e.target.value)}
        />

        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Número de pasajeros"
          value={pasajeros}
          onChange={(e) => setPasajeros(Number(e.target.value))}
        />

        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Costo por persona"
          value={costo}
          onChange={(e) => setCosto(Number(e.target.value))}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />

        <input
          className="border p-2 rounded col-span-2"
          placeholder="Descripción del viaje"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      <button
        onClick={agregarCotizacion}
        className="mt-4 bg-blue-950 text-white px-4 py-2 rounded"
      >
        Agregar cotización
      </button>

      <button
        onClick={eliminarSeleccionados}
        className="mt-4 ml-2 bg-red-600 text-white px-4 py-2 rounded"
      >
        Eliminar seleccionados
      </button>

      {/* TABLA */}
      <table className="w-full mt-4 border">
        <thead className="bg-gray-200">
          <tr>
            <th></th>
            <th>Cliente</th>
            <th>Destino</th>
            <th>Pasajeros</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {cotizaciones.map((c, i) => (
            <tr key={i} className="text-center border-t">

              <td>
                <input
                  type="checkbox"
                  checked={c.seleccionado}
                  onChange={() => toggleSeleccion(i)}
                />
              </td>

              <td>{c.cliente}</td>
              <td>{c.destino}</td>
              <td>{c.pasajeros}</td>
              <td>${c.total}</td>

            </tr>
          ))}
        </tbody>
      </table>

    </main>
  );
}