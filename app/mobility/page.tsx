"use client";

import { useEffect, useState } from "react";

type Servicio = {
  unidad: string;
  operador: string;
  tipo: string;
  origen: string;
  destino: string;
  fecha: string;
  pasajeros: number;
  costo: number;
  nombresPasajeros: string[];
  observaciones: string;
  status: string;
};

export default function TransportePage() {
  const [unidad, setUnidad] = useState("");
  const [operador, setOperador] = useState("");
  const [tipo, setTipo] = useState("Tour");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState("");
  const [pasajeros, setPasajeros] = useState(1);
  const [costo, setCosto] = useState(0);
  const [observaciones, setObservaciones] = useState("");

  const [nombresPasajeros, setNombresPasajeros] = useState<string[]>([""]);

  const [servicios, setServicios] = useState<Servicio[]>([]);

  // Cargar datos
  useEffect(() => {
    const data = localStorage.getItem("servicios");
    if (data) setServicios(JSON.parse(data));
  }, []);

  // Guardar datos
  useEffect(() => {
    localStorage.setItem("servicios", JSON.stringify(servicios));
  }, [servicios]);

  // Manejar pasajeros dinámicos
  const handleNombreChange = (index: number, value: string) => {
    const nuevos = [...nombresPasajeros];
    nuevos[index] = value;
    setNombresPasajeros(nuevos);
  };

  const agregarPasajero = () => {
    setNombresPasajeros([...nombresPasajeros, ""]);
  };

  const eliminarPasajero = (index: number) => {
    const nuevos = nombresPasajeros.filter((_, i) => i !== index);
    setNombresPasajeros(nuevos);
  };

  // Enter agrega nuevo campo
  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarPasajero();
    }
  };

  const agregarServicio = () => {
    const nuevo: Servicio = {
      unidad,
      operador,
      tipo,
      origen,
      destino,
      fecha,
      pasajeros,
      costo,
      nombresPasajeros,
      observaciones,
      status: "Disponible",
    };

    setServicios([...servicios, nuevo]);

    // limpiar
    setUnidad("");
    setOperador("");
    setTipo("Tour");
    setOrigen("");
    setDestino("");
    setFecha("");
    setPasajeros(1);
    setCosto(0);
    setObservaciones("");
    setNombresPasajeros([""]);
  };

  const eliminarServicio = (index: number) => {
    const nuevaLista = servicios.filter((_, i) => i !== index);
    setServicios(nuevaLista);
  };

  const cambiarStatus = (index: number) => {
    const nuevaLista = servicios.map((s, i) => {
      if (i === index) {
        return {
          ...s,
          status: s.status === "Disponible" ? "Ocupado" : "Disponible",
        };
      }
      return s;
    });

    setServicios(nuevaLista);
  };

  const ingresosTotales = servicios.reduce((acc, s) => acc + s.costo, 0);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Transporte 🚐</h1>

      {/* FORMULARIO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        <div>
          <label className="text-sm font-medium">Unidad</label>
          <input className="border p-2 rounded w-full" value={unidad} onChange={(e) => setUnidad(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Operador</label>
          <input className="border p-2 rounded w-full" value={operador} onChange={(e) => setOperador(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Servicio</label>
          <select className="border p-2 rounded w-full" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option>Tour</option>
            <option>Traslado</option>
            <option>Excursión</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Origen</label>
          <input className="border p-2 rounded w-full" value={origen} onChange={(e) => setOrigen(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Destino</label>
          <input className="border p-2 rounded w-full" value={destino} onChange={(e) => setDestino(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Fecha</label>
          <input type="date" className="border p-2 rounded w-full" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Número de pasajeros</label>
          <input type="number" className="border p-2 rounded w-full" value={pasajeros} onChange={(e) => setPasajeros(Number(e.target.value))} />
        </div>

        <div>
          <label className="text-sm font-medium">Costo del servicio</label>
          <input type="number" className="border p-2 rounded w-full" value={costo} onChange={(e) => setCosto(Number(e.target.value))} />
        </div>
      </div>

      {/* OBSERVACIONES */}
      <div className="mt-3">
        <label className="text-sm font-medium">Observaciones</label>
        <input className="border p-2 rounded w-full" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
      </div>

      {/* PASAJEROS DINÁMICOS */}
      <div className="mt-4">
        <label className="text-sm font-medium">Nombre de pasajeros</label>

        {nombresPasajeros.map((nombre, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <input
              className="border p-2 rounded w-full"
              value={nombre}
              onChange={(e) => handleNombreChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />placeholder={"Pasajero " + (index + 1)}

            <button
              onClick={() => eliminarPasajero(index)}
              className="bg-red-500 text-white px-3 rounded"
            >
              X
            </button>
          </div>
        ))}

        <button
          onClick={agregarPasajero}
          className="mt-2 bg-gray-700 text-white px-3 py-1 rounded"
        >
          + Agregar pasajero
        </button>
      </div>

      {/* BOTÓN */}
      <button
        onClick={agregarServicio}
        className="mt-4 bg-blue-950 text-white px-4 py-2 rounded"
      >
        Agregar servicio
      </button>

      {/* INGRESOS */}
      <h2 className="mt-4 font-semibold">
        Ingresos totales: ${ingresosTotales}
      </h2>

      {/* TABLA */}
      <table className="w-full mt-4 border">
        <thead className="bg-gray-200">
          <tr>
            <th>Unidad</th>
            <th>Operador</th>
            <th>Servicio</th>
            <th>Ruta</th>
            <th>Fecha</th>
            <th>Pax</th>
            <th>Total</th>
            <th>Pasajeros</th>
            <th>Status</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {servicios.map((s, i) => (
            <tr key={i} className="text-center border-t">
              <td>{s.unidad}</td>
              <td>{s.operador}</td>
              <td>{s.tipo}</td>
              <td>{s.origen} → {s.destino}</td>
              <td>{s.fecha}</td>
              <td>{s.pasajeros}</td>
              <td>${s.costo}</td>
              <td>{s.nombresPasajeros.join(", ")}</td>
              <td>{s.status}</td>
              <td className="flex gap-2 justify-center">
                <button
                  onClick={() => cambiarStatus(i)}
                  className="bg-yellow-500 px-2 rounded"
                >
                  Cambiar
                </button>
                <button
                  onClick={() => eliminarServicio(i)}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}