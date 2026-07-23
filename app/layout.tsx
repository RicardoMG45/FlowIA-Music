import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowIA Music",
  description: "Gestión inteligente para grupos musicales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}