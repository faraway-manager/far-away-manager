"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Unidad = {
  id: string;
  marca: string;
  modelo: string;
  placas: string;
  capacidad_pax: number;
  tipo_unidad: string;
  created_at?: string;
};

export default function FlotillaPage() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [placas, setPlacas] = useState("");
  const [capacidadPax, setCapacidadPax] = useState("");
  const [tipoUnidad, setTipoUnidad] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarUnidades();
  }, []);

  const cargarUnidades = async () => {
    const { data, error } = await supabase
      .from("flotilla")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar flotilla:", error);
      alert("No se pudo cargar la flotilla.");
      return;
    }

    setUnidades(data || []);
  };

  const limpiarFormulario = () => {
    setMarca("");
    setModelo("");
    setPlacas("");
    setCapacidadPax("");
    setTipoUnidad("");
    setEditandoId(null);
  };

  const guardarUnidad = async () => {
    if (!marca || !modelo || !placas || !capacidadPax || !tipoUnidad) {
      alert("Captura todos los campos de la unidad.");
      return;
    }

    const capacidadNumero = Number(capacidadPax);

    if (Number.isNaN(capacidadNumero) || capacidadNumero <= 0) {
      alert("La capacidad debe ser un número mayor a cero.");
      return;
    }

    setCargando(true);

    const datosUnidad = {
      marca: marca.trim(),
      modelo: modelo.trim(),
      placas: placas.trim().toUpperCase(),
      capacidad_pax: capacidadNumero,
      tipo_unidad: tipoUnidad.trim(),
    };

    if (editandoId) {
      const { error } = await supabase
        .from("flotilla")
        .update(datosUnidad)
        .eq("id", editandoId);

      setCargando(false);

      if (error) {
        console.error("Error al actualizar unidad:", error);
        alert("No se pudo actualizar la unidad.");
        return;
      }

      alert("Unidad actualizada correctamente.");
    } else {
      const { error } = await supabase.from("flotilla").insert([datosUnidad]);

      setCargando(false);

      if (error) {
        console.error("Error al guardar unidad:", error);
        alert("No se pudo guardar la unidad.");
        return;
      }

      alert("Unidad guardada correctamente.");
    }

    limpiarFormulario();
    cargarUnidades();
  };

  const editarUnidad = (unidad: Unidad) => {
    setEditandoId(unidad.id);
    setMarca(unidad.marca);
    setModelo(unidad.modelo);
    setPlacas(unidad.placas);
    setCapacidadPax(String(unidad.capacidad_pax));
    setTipoUnidad(unidad.tipo_unidad);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarUnidad = async (id: string) => {
    const confirmar = confirm("¿Deseas eliminar esta unidad de la flotilla?");

    if (!confirmar) return;

    const { error } = await supabase.from("flotilla").delete().eq("id", id);

    if (error) {
      console.error("Error al eliminar unidad:", error);
      alert("No se pudo eliminar la unidad.");
      return;
    }

    alert("Unidad eliminada correctamente.");
    cargarUnidades();
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl bg-blue-950 p-6 text-white shadow">
          <h1 className="text-3xl font-bold">Flotilla</h1>
          <p className="mt-2 text-sm text-blue-100">
            Catálogo interno de unidades de Viajes Far Away Premium Mobility.
          </p>
        </div>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-blue-950">
            {editandoId ? "Editar unidad" : "Nueva unidad"}
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Marca
              </label>
              <input
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2"
                placeholder="Ej. Toyota"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Modelo
              </label>
              <input
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2"
                placeholder="Ej. Hiace"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Placas
              </label>
              <input
                value={placas}
                onChange={(e) => setPlacas(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2"
                placeholder="Ej. ABC-123"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Capacidad / No. pax
              </label>
              <input
                type="number"
                value={capacidadPax}
                onChange={(e) => setCapacidadPax(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2"
                placeholder="Ej. 15"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tipo de unidad
              </label>
              <input
                value={tipoUnidad}
                onChange={(e) => setTipoUnidad(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2"
                placeholder="Ej. Camioneta"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={guardarUnidad}
              disabled={cargando}
              className="rounded-lg bg-blue-950 px-5 py-2 font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {cargando
                ? "Guardando..."
                : editandoId
                ? "Actualizar unidad"
                : "Guardar unidad"}
            </button>

            {editandoId && (
              <button
                onClick={limpiarFormulario}
                className="rounded-lg bg-slate-500 px-5 py-2 font-semibold text-white hover:bg-slate-600"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-blue-950">
            Unidades registradas
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-blue-950 text-white">
                  <th className="border border-slate-300 p-2 text-left">
                    Marca
                  </th>
                  <th className="border border-slate-300 p-2 text-left">
                    Modelo
                  </th>
                  <th className="border border-slate-300 p-2 text-left">
                    Placas
                  </th>
                  <th className="border border-slate-300 p-2 text-left">
                    Capacidad
                  </th>
                  <th className="border border-slate-300 p-2 text-left">
                    Tipo de unidad
                  </th>
                  <th className="border border-slate-300 p-2 text-center">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {unidades.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-slate-300 p-4 text-center text-slate-500"
                    >
                      No hay unidades registradas.
                    </td>
                  </tr>
                ) : (
                  unidades.map((unidad) => (
                    <tr key={unidad.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2">
                        {unidad.marca}
                      </td>
                      <td className="border border-slate-300 p-2">
                        {unidad.modelo}
                      </td>
                      <td className="border border-slate-300 p-2">
                        {unidad.placas}
                      </td>
                      <td className="border border-slate-300 p-2">
                        {unidad.capacidad_pax}
                      </td>
                      <td className="border border-slate-300 p-2">
                        {unidad.tipo_unidad}
                      </td>
                      <td className="border border-slate-300 p-2">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => editarUnidad(unidad)}
                            className="rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarUnidad(unidad.id)}
                            className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}