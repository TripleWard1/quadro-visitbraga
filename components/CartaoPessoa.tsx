import Carril from "./Carril";
import { estadoDe, prazoLegivel } from "@/lib/datas";
import { nomeFase } from "@/lib/fases";
import type { Pessoa, Tarefa } from "@/lib/tipos";

export default function CartaoPessoa({
  pessoa,
  tarefas,
  agora,
}: {
  pessoa: Pessoa;
  tarefas: Tarefa[];
  agora: Date;
}) {
  const ativas = tarefas
    .filter((t) => t.responsavel === pessoa.id && t.fase !== "entregue")
    .sort((a, b) => a.prazo.getTime() - b.prazo.getTime());

  const atual = ativas[0];
  const fila = Math.max(0, ativas.length - 1);
  const estado = atual ? estadoDe(atual, agora) : "livre";

  return (
    <article className={`cartao estado-${estado}`}>
      <header className="cartao-topo">
        <span className="cracha">{pessoa.iniciais}</span>
        <h3>{pessoa.nome}</h3>
        {atual && <span className="ref">#{atual.id}</span>}
      </header>

      {atual ? (
        <>
          <p className="projeto">{atual.projeto}</p>
          <p className="tarefa">{atual.titulo}</p>
          <Carril fase={atual.fase} bloqueada={atual.bloqueada} />
          <footer className="cartao-fundo">
            <span className="fase-nome">{nomeFase(atual.fase)}</span>
            <span className="prazo">{prazoLegivel(atual.prazo, agora)}</span>
          </footer>
          {atual.bloqueada && <p className="bloqueio">Parada — {atual.motivo}</p>}
          {fila > 0 && <span className="fila">+{fila} na fila</span>}
        </>
      ) : (
        <p className="livre">Sem tarefa aberta</p>
      )}
    </article>
  );
}
