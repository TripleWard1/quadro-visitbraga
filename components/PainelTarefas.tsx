"use client";

import { useState } from "react";
import { estaConcluida } from "@/lib/fases";
import type { Tarefa, Trabalho } from "@/lib/tipos";

/** As tarefas da divisão — a lista por onde a equipa escolhe. Escreve-se aqui,
 *  não vem escrita de fábrica. Só o chefe de divisão lá chega: as regras do
 *  Firestore garantem-no, isto é só a interface. */
export default function PainelTarefas({
  tarefas,
  trabalhos,
  souChefe,
  aoCriar,
  aoArquivar,
}: {
  tarefas: Tarefa[];
  trabalhos: Trabalho[];
  souChefe: boolean;
  aoCriar: (nome: string, daDivisao: boolean) => Promise<boolean>;
  aoArquivar: (t: Tarefa) => Promise<void>;
}) {
  const [nome, setNome] = useState("");
  const [aGravar, setAGravar] = useState(false);

  async function criar() {
    if (nome.trim().length < 3) return;
    setAGravar(true);
    if (await aoCriar(nome.trim(), true)) setNome("");
    setAGravar(false);
  }

  return (
    <>
      {souChefe && (
      <section className="g-cartao">
        <h2>Nova frente de trabalho da divisão</h2>
        <p className="g-ajuda">
          Estas aparecem a toda a equipa quando registam trabalho. As que cada
          um cria para si ficam só com essa pessoa — só tu é que crias as
          comuns.
        </p>
        <div className="g-campo">
          <label htmlFor="nt">Nome da tarefa</label>
          <input
            id="nt"
            className="campo"
            placeholder="Plano Estratégico de Turismo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && criar()}
          />
        </div>
        <button
          className="botao principal"
          onClick={criar}
          disabled={aGravar || nome.trim().length < 3}
        >
          {aGravar ? "A criar…" : "Criar frente da divisão"}
        </button>
      </section>
      )}

      <section className="g-cartao">
        <h2>Frentes ativas</h2>
        <p className="g-ajuda">
          As da divisão e as tuas. Arquivar tira-a da lista de escolha, mas deixa
          em paz o trabalho que já lhe está associado.
        </p>
        {tarefas.length === 0 && (
          <p className="g-vazio">
            Ainda não escreveste nenhuma. Enquanto a lista estiver vazia, a equipa
            regista trabalho sem tarefa associada.
          </p>
        )}
        {tarefas.map((t) => {
          const abertos = trabalhos.filter(
            (w) => w.tarefa === t.id && !estaConcluida(w.fase)
          ).length;
          return (
            <div className="g-projeto" key={t.id}>
              <b>{t.nome}</b>
              <span className="g-chip">{t.dono ? "só tua" : "da divisão"}</span>
              <span className="contagem">
                {abertos} {abertos === 1 ? "trabalho aberto" : "trabalhos abertos"}
              </span>
              <button className="botao discreto" onClick={() => aoArquivar(t)}>
                arquivar
              </button>
            </div>
          );
        })}
      </section>
    </>
  );
}
