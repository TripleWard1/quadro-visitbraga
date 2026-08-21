"use client";

import { useEffect, useRef, useState } from "react";
import { FASES } from "@/lib/fases";
import type { FaseId } from "@/lib/tipos";

/** Um número que pisca quando muda. É a diferença entre um painel e um sinal
 *  de vida: ao canto do olho, percebe-se que aconteceu alguma coisa. */
function Numero({ valor, rotulo, tom }: { valor: number; rotulo: string; tom?: string }) {
  const anterior = useRef(valor);
  const [mudou, setMudou] = useState(false);

  useEffect(() => {
    if (anterior.current !== valor) {
      anterior.current = valor;
      setMudou(true);
      const t = setTimeout(() => setMudou(false), 1200);
      return () => clearTimeout(t);
    }
  }, [valor]);

  return (
    <span className={`fn ${tom ?? ""}${mudou ? " mudou" : ""}`}>
      <b>{valor}</b> {rotulo}
    </span>
  );
}

export default function FaixaEstado({
  abertos,
  atrasados,
  hoje,
  parados,
  porFase,
}: {
  abertos: number;
  atrasados: number;
  hoje: number;
  parados: number;
  porFase: Record<FaseId, number>;
}) {
  return (
    <section className="faixa">
      <div className="faixa-numeros">
        <Numero valor={abertos} rotulo="em curso" />
        <Numero valor={atrasados} rotulo="em atraso" tom={atrasados ? "mau" : ""} />
        <Numero valor={hoje} rotulo="fecham hoje" tom={hoje ? "aviso" : ""} />
        <Numero valor={parados} rotulo="parados" tom={parados ? "mau" : ""} />
      </div>

      <div className="faixa-fases">
        {FASES.filter((f) => f.id !== "concluida").map((f, i) => (
          <span className="ff" key={f.id}>
            <span className={`ff-ponto f${i}`} />
            {f.nome}
            <b>{porFase[f.id] ?? 0}</b>
          </span>
        ))}
      </div>
    </section>
  );
}
