"use client";

import dynamic from "next/dynamic";

const Semana = dynamic(() => import("@/components/Semana"), {
  ssr: false,
  loading: () => (
    <main className="gestao">
      <div className="g-entrada">
        <p className="g-nota" style={{ textAlign: "center" }}>A preparar o resumo…</p>
      </div>
    </main>
  ),
});

export default function Pagina() {
  return <Semana />;
}
