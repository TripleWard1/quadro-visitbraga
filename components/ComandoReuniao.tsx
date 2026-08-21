"use client";

import { useState } from "react";
import type { Pessoa } from "@/lib/tipos";

/** O telemóvel como comando da parede. Quem conduz a reunião não tem de estar
 *  ao pé do monitor nem ter teclado — carrega aqui e a parede muda. */
export default function ComandoReuniao({
  pessoas,
  ativa,
  indice,
  aoMudar,
  aoTerminar,
}: {
  pessoas: Pessoa[];
  ativa: boolean;
  indice: number;
  aoMudar: (ativa: boolean, indice: number) => Promise<void>;
  aoTerminar: () => Promise<void>;
}) {
  const [aTrabalhar, setATrabalhar] = useState(false);
  const atual = pessoas[Math.min(indice, pessoas.length - 1)];

  async function correr(fn: () => Promise<void>) {
    setATrabalhar(true);
    await fn();
    setATrabalhar(false);
  }

  if (!ativa) {
    return (
      <section className="g-cartao g-criar-fechado">
        <div>
          <h2>Reunião de serviço</h2>
          <p className="g-ajuda" style={{ marginBottom: 0 }}>
            Põe a parede em modo reunião e percorre a equipa pessoa a pessoa.
          </p>
        </div>
        <button
          className="botao avancar"
          disabled={aTrabalhar}
          onClick={() => correr(() => aoMudar(true, 0))}
        >
          Iniciar reunião
        </button>
      </section>
    );
  }

  return (
    <section className="g-cartao g-comando">
      <h2>Reunião a decorrer</h2>
      <p className="g-ajuda">A parede está a mostrar esta pessoa.</p>

      <div className="g-comando-atual">
        <span className="g-comando-nome">{atual?.nome ?? "—"}</span>
        <span className="g-comando-posicao">
          {Math.min(indice + 1, pessoas.length)} de {pessoas.length}
        </span>
      </div>

      <div className="g-comando-botoes">
        <button
          className="botao"
          disabled={aTrabalhar || indice === 0}
          onClick={() => correr(() => aoMudar(true, indice - 1))}
        >
          ← Anterior
        </button>
        <button
          className="botao avancar"
          disabled={aTrabalhar || indice >= pessoas.length - 1}
          onClick={() => correr(() => aoMudar(true, indice + 1))}
        >
          Seguinte →
        </button>
      </div>

      <button
        className="botao botao-largo"
        style={{ marginTop: 12 }}
        disabled={aTrabalhar}
        onClick={() => correr(aoTerminar)}
      >
        Terminar reunião
      </button>
      <p className="g-nota" style={{ marginTop: 10 }}>
        Ao terminar, fica marcado o momento — na próxima reunião o quadro mostra
        só o que mudou desde agora.
      </p>
    </section>
  );
}
