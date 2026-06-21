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
const prueba = await supabase
  .from("usuarios")
  .select("*");

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
    <main className="flex min-h-screen items-center justify-center bg-blue-950">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center">
        <img
          src="/faraway.png"
          alt="Far Away"
          className="mx-auto w-72 mb-8 drop-shadow-lg"
        />

        <h1 className="text-3xl font-bold text-blue-950 mb-2">
          Far Away Manager
        </h1>

        <p className="text-gray-600 mb-6">
          Acceso interno Premium Mobility
        </p>

        <input
          type="text"
          placeholder="Correo o nombre de usuario"
          className="border p-3 rounded w-full mb-3"
          value={usuarioInput}
          onChange={(e) => setUsuarioInput(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="border p-3 rounded w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") login();
          }}
        />

        <button
          onClick={login}
          disabled={cargando}
          className="bg-blue-950 text-white px-4 py-3 rounded w-full"
        >
          {cargando ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </div>
    </main>
  );
}