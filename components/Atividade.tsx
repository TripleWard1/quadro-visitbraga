"use client";

import { ultimaAtividade } from "@/lib/atividade";
import type { Pessoa, Trabalho } from "@/lib/tipos";

/** Aparece no canto quando alguém mexe no quadro e desaparece sozinha.
 *  Sem retorno visível, ninguém mantém o registo em dia — esta linha é o
 *  aplauso. */
export default function Atividade({
  trabalhos,
  pessoas,
  agora,
}: {
  trabalhos: Trabalho[];
  pessoas: Pessoa[];
  agora: Date;
}) {
  const a = ultimaAtividade(trabalhos, pessoas, agora);
  if (!a) return null;

  return (
    <div className="atividade" key={a.id}>
      <span className="atividade-ponto" />
      <span className="atividade-texto">
        <b>{a.quem}</b> {a.acao} <i>{a.titulo}</i>
      </span>
      <span className="atividade-quando">{a.quando}</span>
    </div>
  );
}
