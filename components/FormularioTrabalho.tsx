"use client";

import { useState } from "react";
import type { Pessoa, Tarefa } from "@/lib/tipos";

/** Atalhos de prazo. Escrever "22/09/2026 17:00" num telemóvel é um suplício;
 *  quase sempre o prazo é hoje, amanhã ou sexta — ou não há prazo nenhum. */
function atalhos(): { rotulo: string; valor: () => Date }[] {
  const asHoras = (d: Date, h = 17) => {
    d.setHours(h, 0, 0, 0);
    return d;
  };
  const daquiA = (dias: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return asHoras(d);
  };
  return [
    { rotulo: "Hoje", valor: () => asHoras(new Date()) },
    { rotulo: "Amanhã", valor: () => daquiA(1) },
    {
      rotulo: "Esta sexta",
      valor: () => {
        const d = new Date();
        return daquiA((5 - d.getDay() + 7) % 7 || 7);
      },
    },
    { rotulo: "Daqui a 1 semana", valor: () => daquiA(7) },
    { rotulo: "Daqui a 1 mês", valor: () => daquiA(30) },
  ];
}

function paraCampo(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(
    d.getMinutes()
  )}`;
}

export default function FormularioTrabalho({
  eu,
  pessoas,
  tarefas,
  souChefe,
  aoCriar,
}: {
  eu: Pessoa;
  pessoas: Pessoa[];
  tarefas: Tarefa[];
  souChefe: boolean;
  aoCriar: (dados: {
    titulo: string;
    tarefa: string;
    prazo: Date | null;
    responsavel: string;
  }) => Promise<boolean>;
}) {
  const [titulo, setTitulo] = useState("");
  const [tarefa, setTarefa] = useState("");
  const [prazo, setPrazo] = useState("");
  const [semPrazo, setSemPrazo] = useState(false);
  const [responsavel, setResponsavel] = useState(eu.id);
  const [atalhoAtivo, setAtalhoAtivo] = useState<string | null>(null);
  const [aGravar, setAGravar] = useState(false);

  const pronto = titulo.trim().length > 2 && (semPrazo || prazo);

  function escolherAtalho(rotulo: string, data: Date) {
    setPrazo(paraCampo(data));
    setSemPrazo(false);
    setAtalhoAtivo(rotulo);
  }

  function escolherSemPrazo() {
    setSemPrazo(true);
    setPrazo("");
    setAtalhoAtivo("continuo");
  }

  async function submeter() {
    if (!pronto) return;
    setAGravar(true);
    const feito = await aoCriar({
      titulo: titulo.trim(),
      tarefa,
      prazo: semPrazo ? null : new Date(prazo),
      responsavel,
    });
    if (feito) {
      setTitulo("");
      setTarefa("");
      setPrazo("");
      setSemPrazo(false);
      setAtalhoAtivo(null);
      setResponsavel(eu.id);
    }
    setAGravar(false);
  }

  return (
    <section className="g-cartao">
      <h2>Registar trabalho</h2>
      <p className="g-ajuda">
        {souChefe
          ? "Regista o teu trabalho ou distribui pela equipa. Aparece no monitor assim que gravares."
          : "O que estás a fazer aparece no monitor assim que gravares."}
      </p>

      <div className="g-campo">
        <label htmlFor="titulo">
          O que estás a fazer
          <span className="dica">uma frase curta, com o verbo à frente</span>
        </label>
        <input
          id="titulo"
          className="campo"
          placeholder="Rever o caderno de encargos"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>

      <div className="g-campo">
        <label htmlFor="tarefa">
          Frente de trabalho<span className="dica">opcional</span>
        </label>
        <select
          id="tarefa"
          className="campo"
          value={tarefa}
          onChange={(e) => setTarefa(e.target.value)}
        >
          <option value="">Sem tarefa associada</option>
          {tarefas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
        {tarefas.length === 0 && (
          <p className="g-nota" style={{ marginTop: 6 }}>
            A lista está vazia — cria a primeira frente de trabalho aqui em cima.
          </p>
        )}
      </div>

      <div className="g-campo">
        <label htmlFor="prazo">
          Para quando<span className="dica">é o que decide a cor no monitor</span>
        </label>
        <div className="g-atalhos">
          {atalhos().map((a) => (
            <button
              type="button"
              key={a.rotulo}
              className={"g-atalho" + (atalhoAtivo === a.rotulo ? " ativo" : "")}
              onClick={() => escolherAtalho(a.rotulo, a.valor())}
            >
              {a.rotulo}
            </button>
          ))}
          <button
            type="button"
            className={"g-atalho continuo" + (semPrazo ? " ativo" : "")}
            onClick={escolherSemPrazo}
          >
            Sem prazo definido
          </button>
        </div>
        {semPrazo ? (
          <p className="g-nota">
            Trabalho contínuo: fica no monitor sem contagem e nunca entra em atraso.
          </p>
        ) : (
          <input
            id="prazo"
            className="campo"
            type="datetime-local"
            value={prazo}
            onChange={(e) => {
              setPrazo(e.target.value);
              setAtalhoAtivo(null);
            }}
          />
        )}
      </div>

      {souChefe && (
        <div className="g-campo">
          <label htmlFor="responsavel">Quem faz</label>
          <select
            id="responsavel"
            className="campo"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
          >
            <option value={eu.id}>Eu</option>
            {pessoas
              .filter((p) => p.id !== eu.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
          </select>
        </div>
      )}

      <div className="g-acoes">
        <button className="botao principal" onClick={submeter} disabled={!pronto || aGravar}>
          {aGravar ? "A gravar…" : "Pôr no quadro"}
        </button>
        {!pronto && (
          <span className="g-porque">
            {titulo.trim().length <= 2
              ? "Falta dizer o que estás a fazer"
              : "Falta escolher o prazo"}
          </span>
        )}
      </div>
    </section>
  );
}
