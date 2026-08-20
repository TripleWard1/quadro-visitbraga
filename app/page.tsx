"use client";

import dynamic from "next/dynamic";

/* O quadro tem relógio e prazos relativos: renderizado no servidor daria
   sempre horas diferentes das do browser. Corre só do lado do cliente. */
const Quadro = dynamic(() => import("@/components/Quadro"), {
  ssr: false,
  loading: () => (
    <div className="quadro quadro-arranque">
      <p>A abrir o quadro…</p>
    </div>
  ),
});

export default function Pagina() {
  return <Quadro />;
}
