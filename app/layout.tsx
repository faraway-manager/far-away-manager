import "./globals.css";
import AppShell from "./components/AppShell";
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}