"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type Moneda = "MXN" | "USD";

type Tarifa = {
  id: string;
  servicio: string;
  destino: string;
  precio: number;
  moneda: Moneda;
};

export default function TarifarioPage() {
  const [servicio, setServicio] = useState("");
  const [destino, setDestino] = useState("");
  const [precio, setPrecio] = useState("");
  const [moneda, setMoneda] = useState<Moneda>("MXN");

  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [indiceEditando, setIndiceEditando] = useState<number | null>(null);

  const [nombrePdf, setNombrePdf] = useState("");
  const inputPdfRef = useRef<HTMLInputElement>(null);

  // Cargar tarifas guardadas
  useEffect(() => {
    try {
      const data = localStorage.getItem("tarifas");

      if (!data) return;

      const tarifasGuardadas = JSON.parse(data);

      if (!Array.isArray(tarifasGuardadas)) return;

      // Compatibilidad con tarifas registradas antes de agregar moneda e ID
      const tarifasActualizadas: Tarifa[] = tarifasGuardadas.map(
        (
          tarifa: {
            id?: string;
            servicio?: string;
            destino?: string;
            precio?: number;
            moneda?: Moneda;
          },
          index: number
        ) => ({
          id:
            tarifa.id ??
            `${Date.now()}-${index}-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
          servicio: tarifa.servicio ?? "",
          destino: tarifa.destino ?? "",
          precio: Number(tarifa.precio) || 0,
          moneda: tarifa.moneda === "USD" ? "USD" : "MXN",
        })
      );

      setTarifas(tarifasActualizadas);
      guardarEnStorage(tarifasActualizadas);
    } catch (error) {
      console.error("Error al cargar las tarifas:", error);
    }
  }, []);

  // Guardar tarifas en localStorage
  const guardarEnStorage = (lista: Tarifa[]) => {
    localStorage.setItem("tarifas", JSON.stringify(lista));
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setServicio("");
    setDestino("");
    setPrecio("");
    setMoneda("MXN");
    setIndiceEditando(null);
  };

  // Guardar tarifa nueva o actualizar tarifa existente
  const guardarTarifa = () => {
    const servicioLimpio = servicio.trim();
    const destinoLimpio = destino.trim();
    const precioNumerico = Number(precio);

    if (
      !servicioLimpio ||
      !destinoLimpio ||
      !precio ||
      Number.isNaN(precioNumerico) ||
      precioNumerico <= 0
    ) {
      alert("Completa servicio, destino y un precio mayor a cero.");
      return;
    }

    if (indiceEditando !== null) {
      const nuevaLista = tarifas.map((tarifa, index) =>
        index === indiceEditando
          ? {
              ...tarifa,
              servicio: servicioLimpio,
              destino: destinoLimpio,
              precio: precioNumerico,
              moneda,
            }
          : tarifa
      );

      setTarifas(nuevaLista);
      guardarEnStorage(nuevaLista);
      limpiarFormulario();
      return;
    }

    const nuevaTarifa: Tarifa = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      servicio: servicioLimpio,
      destino: destinoLimpio,
      precio: precioNumerico,
      moneda,
    };

    const nuevaLista = [...tarifas, nuevaTarifa];

    setTarifas(nuevaLista);
    guardarEnStorage(nuevaLista);
    limpiarFormulario();
  };

  // Cargar tarifa en el formulario para editar
  const editarTarifa = (index: number) => {
    const tarifa = tarifas[index];

    setServicio(tarifa.servicio);
    setDestino(tarifa.destino);
    setPrecio(String(tarifa.precio));
    setMoneda(tarifa.moneda);
    setIndiceEditando(index);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Eliminar tarifa
  const eliminarTarifa = (index: number) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta tarifa?"
    );

    if (!confirmar) return;

    const nuevaLista = tarifas.filter((_, i) => i !== index);

    setTarifas(nuevaLista);
    guardarEnStorage(nuevaLista);

    if (indiceEditando === index) {
      limpiarFormulario();
    } else if (
      indiceEditando !== null &&
      index < indiceEditando
    ) {
      setIndiceEditando(indiceEditando - 1);
    }
  };

  // Abrir selector de archivos PDF
  const seleccionarPdf = () => {
    inputPdfRef.current?.click();
  };

  // Importar y abrir PDF seleccionado
  const importarPdf = (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];

    if (!archivo) return;

    const esPdf =
      archivo.type === "application/pdf" ||
      archivo.name.toLowerCase().endsWith(".pdf");

    if (!esPdf) {
      alert("Selecciona únicamente un archivo PDF.");
      event.target.value = "";
      return;
    }

    setNombrePdf(archivo.name);

    const urlTemporal = URL.createObjectURL(archivo);
    const nuevaVentana = window.open(urlTemporal, "_blank");

    if (!nuevaVentana) {
      alert(
        "El navegador bloqueó la apertura del PDF. Permite las ventanas emergentes para este sitio."
      );
    }

    window.setTimeout(() => {
      URL.revokeObjectURL(urlTemporal);
    }, 60000);

    event.target.value = "";
  };

  // Formatear precio según la moneda seleccionada
  const formatearPrecio = (precioTarifa: number, monedaTarifa: Moneda) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: monedaTarifa,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(precioTarifa);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-950">
              Tarifario
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Registro y consulta de tarifas de servicios turísticos
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              ref={inputPdfRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={importarPdf}
              className="hidden"
            />

            <button
              type="button"
              onClick={seleccionarPdf}
              className="rounded-lg bg-gray-700 px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800"
            >
              Importar PDF
            </button>

            <a
              href="http://b2b.latitudetour.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-950 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-blue-900"
            >
              Reservar Tour Operador
            </a>
          </div>
        </div>

        {nombrePdf && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
            PDF seleccionado:{" "}
            <span className="font-semibold">{nombrePdf}</span>
          </div>
        )}

        {/* FORMULARIO */}
        <section className="mb-8 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-blue-950">
            {indiceEditando !== null
              ? "Editar tarifa"
              : "Registrar tarifa"}
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Servicio
              </label>

              <input
                type="text"
                placeholder="Tour, traslado, hotel..."
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-950"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Destino
              </label>

              <input
                type="text"
                placeholder="Ciudad o destino"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-950"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Precio
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-950"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Moneda
              </label>

              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value as Moneda)}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-950"
              >
                <option value="MXN">MXN - Peso mexicano</option>
                <option value="USD">USD - Dólar estadounidense</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={guardarTarifa}
              className="rounded-lg bg-blue-950 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-900"
            >
              {indiceEditando !== null
                ? "Actualizar tarifa"
                : "Guardar tarifa"}
            </button>

            {indiceEditando !== null && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-lg bg-gray-500 px-6 py-2.5 font-semibold text-white transition hover:bg-gray-600"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </section>

        {/* TABLA */}
        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead className="bg-blue-950 text-white">
                <tr>
                  <th className="p-3 text-left">Servicio</th>
                  <th className="p-3 text-left">Destino</th>
                  <th className="p-3 text-right">Precio</th>
                  <th className="p-3 text-center">Moneda</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {tarifas.map((tarifa, index) => (
                  <tr
                    key={tarifa.id}
                    className="border-b transition hover:bg-gray-50"
                  >
                    <td className="p-3">{tarifa.servicio}</td>

                    <td className="p-3">{tarifa.destino}</td>

                    <td className="p-3 text-right font-semibold">
                      {formatearPrecio(
                        tarifa.precio,
                        tarifa.moneda
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-950">
                        {tarifa.moneda}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => editarTarifa(index)}
                          className="rounded bg-amber-500 px-3 py-1.5 font-semibold text-white transition hover:bg-amber-600"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => eliminarTarifa(index)}
                          className="rounded bg-red-600 px-3 py-1.5 font-semibold text-white transition hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {tarifas.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-gray-500"
                    >
                      No hay tarifas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}