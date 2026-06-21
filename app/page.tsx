"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Usuario = {
  nombre: string;
  email: string | null;
  rol: "admin" | "direccion" | "agente";
};

export default function Home() {
  const [usuarioInput, setUsuarioInput] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const login = async () => {
    if (!usuarioInput || !password) {
      alert("Captura usuario/correo y contraseña.");
      return;
    }

    setCargando(true);

    const valor = usuarioInput.trim().toLowerCase();

    let query = supabase
      .from("usuarios")
      .select("nombre,email,rol,activo,password")
      .eq("activo", true);

    if (valor.includes("@")) {
      query = query.eq("email", valor);
    } else {
      query = query.ilike("nombre", usuarioInput.trim());
    }

    const { data, error } = await query.limit(1);

    setCargando(false);

    if (error) {
      alert("Error al iniciar sesión: " + error.message);
      return;
    }

    const user = data?.[0];

    if (!user) {
      alert("Usuario no encontrado.");
      return;
    }

    if (!user.activo) {
      alert("Usuario inactivo. Contacta al administrador.");
      return;
    }

    if (user.password !== password) {
      alert("Contraseña incorrecta.");
      return;
    }

    const sesion: Usuario = {
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    };

    localStorage.setItem("faraway_user", JSON.stringify(sesion));
    window.location.href = "/clientes";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl">
        <img
          src="/faraway-premium.png"
          alt="Viajes Far Away Premium Mobility"
          className="mx-auto mb-8 w-72 drop-shadow-lg"
        />

        <h1 className="mb-2 text-3xl font-bold text-blue-950">
          Far Away Manager
        </h1>

        <p className="mb-6 text-gray-600">
          Acceso interno Premium Mobility
        </p>

        <input
          type="text"
          placeholder="Correo o nombre de usuario"
          className="mb-3 w-full rounded border p-3"
          value={usuarioInput}
          onChange={(e) => setUsuarioInput(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="mb-4 w-full rounded border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") login();
          }}
        />

        <button
          type="button"
          onClick={login}
          disabled={cargando}
          className="w-full rounded bg-blue-950 px-4 py-3 text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {cargando ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </div>
    </main>
  );
}