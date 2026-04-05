import "./globals.css";

export const metadata = {
  title: "Far Away Manager",
  description: "Sistema de gestión de viajes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
      </head>

      <body>
        {/* NAVBAR */}
        <nav className="bg-blue-950 text-white px-6 py-3 flex gap-6">
          <a href="/clientes">Clientes</a>
          <a href="/cotizador">Cotizador</a>
          <a href="/reportes">Reportes</a>
          <a href="/tarifario">Tarifario</a>
          <a href="/mobility">Transporte</a>
          <a href="/dashboard">Dashboard</a>
        </nav>

        {/* CONTENIDO */}
        <main className="p-6">
          {children}
        </main>
      </body>
    </html>
  );
}