"use client";

import { useMemo, useState } from "react";
import { LOGO } from "@/lib/config";
import { resumoDaSemana } from "@/lib/semana";
import { useQuadro } from "@/lib/useQuadro";

/** O chefe de divisão não vai ao corredor ver o monitor. Isto é para ele:
 *  abre, lê, copia, cola no email. Sem serviço de envio, sem tarefa agendada,
 *  sem mais nada para manter. */
export default function Semana() {
  const { trabalhos, pessoas, tarefas, movimentos } = useQuadro();
  const [copiado, setCopiado] = useState(false);
  const agora = useMemo(() => new Date(), []);

  const resumo = useMemo(
    () => resumoDaSemana(trabalhos, pessoas, tarefas, movimentos, agora),
    [trabalhos, pessoas, tarefas, movimentos, agora]
  );

  async function copiar() {
    try {
      await navigator.clipboard.writeText(resumo.texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <main className="gestao">
      <header className="g-cabecalho">
        <div className="g-cabecalho-interior">
          <div className="g-marca">
            <img src={LOGO} alt="Visit Braga" />
          </div>
          <div className="g-titulo">
            <h1>Resumo da semana</h1>
            <p>Atividades Económicas e Turismo · Município de Braga</p>
          </div>
        </div>
      </header>

      <div className="g-corpo">
        <div className="g-resumo">
          <div className="g-numero bom">
            <b>{resumo.fechados.length}</b>
            <span>fechados</span>
          </div>
          <div className={"g-numero" + (resumo.emAprovacao.length ? " aviso" : "")}>
            <b>{resumo.emAprovacao.length}</b>
            <span>à espera de aprovação</span>
          </div>
          <div className={"g-numero" + (resumo.atrasados.length ? " alerta" : "")}>
            <b>{resumo.atrasados.length}</b>
            <span>em atraso</span>
          </div>
        </div>

        <section className="g-cartao">
          <h2>Para copiar</h2>
          <p className="g-ajuda">
            Copia e cola no email. Não é enviado a ninguém automaticamente.
          </p>
          <pre className="g-texto">{resumo.texto}</pre>
          <button className="botao avancar botao-largo" onClick={copiar}>
            {copiado ? "Copiado ✓" : "Copiar resumo"}
          </button>
        </section>
      </div>
    </main>
  );
}
