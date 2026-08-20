"use client";

import { useState } from "react";

/** Criar uma frente de trabalho sem sair do ecrã. Escreve-se uma vez, fica
 *  gravada, e a partir daí escolhe-se da lista — que é o que evita ter
 *  "Projeto Post", "projeto post" e "Proj. Post" no mesmo monitor. */
export default function CriarTarefa({
  quantas,
  souChefe,
  aoCriar,
}: {
  quantas: number;
  souChefe: boolean;
  aoCriar: (nome: string, daDivisao: boolean) => Promise<boolean>;
}) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [daDivisao, setDaDivisao] = useState(false);
  const [aGravar, setAGravar] = useState(false);
  const [feito, setFeito] = useState<string | null>(null);

  async function criar() {
    if (nome.trim().length < 3) return;
    setAGravar(true);
    const ok = await aoCriar(nome.trim(), daDivisao);
    if (ok) {
      setFeito(nome.trim());
      setNome("");
      setTimeout(() => setFeito(null), 4000);
    }
    setAGravar(false);
  }

  if (!aberto) {
    return (
      <section className="g-cartao g-criar-fechado">
        <div>
          <h2>As tuas frentes de trabalho</h2>
          <p className="g-ajuda" style={{ marginBottom: 0 }}>
            {quantas === 0
              ? "Ainda não tens nenhuma. Cria a primeira e passa a escolhê-la da lista."
              : `${quantas} ${quantas === 1 ? "disponível" : "disponíveis"} para escolheres aqui em baixo.`}
          </p>
        </div>
        <button className="botao" onClick={() => setAberto(true)}>
          Criar nova tarefa
        </button>
      </section>
    );
  }

  return (
    <section className="g-cartao">
      <h2>Criar nova tarefa</h2>
      <p className="g-ajuda">
        Uma frente de trabalho — "Projeto Post", "Green Destinations",
        "Licenciamento de esplanadas". Escreve-se uma vez e fica na lista.
        {souChefe ? "" : " É tua: mais ninguém a vê."}
      </p>

      <div className="g-campo">
        <label htmlFor="nova-tarefa">Nome da tarefa</label>
        <input
          id="nova-tarefa"
          className="campo"
          autoFocus
          placeholder="Projeto Post"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && criar()}
        />
      </div>

      {souChefe && (
        <div className="g-campo">
          <label>Âmbito</label>
          <div className="g-atalhos">
            <button
              type="button"
              className={"g-atalho" + (daDivisao ? "" : " ativo")}
              onClick={() => setDaDivisao(false)}
            >
              Só para mim
            </button>
            <button
              type="button"
              className={"g-atalho" + (daDivisao ? " ativo" : "")}
              onClick={() => setDaDivisao(true)}
            >
              Para toda a divisão
            </button>
          </div>
        </div>
      )}

      <div className="g-acoes">
        <button
          className="botao principal"
          onClick={criar}
          disabled={aGravar || nome.trim().length < 3}
        >
          {aGravar ? "A criar…" : "Criar tarefa"}
        </button>
        <button
          className="botao discreto"
          onClick={() => {
            setAberto(false);
            setNome("");
          }}
        >
          fechar
        </button>
      </div>

      {feito && (
        <p className="g-feito">
          "{feito}" criada. Já a podes escolher aqui em baixo.
        </p>
      )}
    </section>
  );
}
