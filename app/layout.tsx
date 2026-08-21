import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quadro da Divisão · Atividades Económicas e Turismo",
  description:
    "Quem está em quê e em que fase — quadro de parede da Divisão de Atividades Económicas e Turismo do Município de Braga.",
  icons: { icon: "/sino-vermelho.png" },
};

export const viewport: Viewport = {
  themeColor: "#e30613",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
