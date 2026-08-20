import Carril from "./Carril";
import { estadoDe, porPrazo, prazoLegivel } from "@/lib/datas";
import { estaConcluida, nomeFase } from "@/lib/fases";
import { nomeTarefa } from "@/lib/tarefas";
import type { Estado, Pessoa, Tarefa, Trabalho } from "@/lib/tipos";

/** Quantos trabalhos cabem num cartão antes de valer mais a pena resumir. */
const MAX_ITENS = 4;

/** O estado do cartão é o pior dos trabalhos lá dentro: se uma coisa está
 *  atrasada, é isso que a barra da esquerda tem de dizer. */
const GRAVIDADE: Estado[] = ["atrasada", "bloqueada", "hoje", "normal", "continua", "livre"];

function pior(estados: Estado[]): Estado {
  for (const e of GRAVIDADE) if (estados.includes(e)) return e;
  return "livre";
}

export default function CartaoPessoa({
  pessoa,
  trabalhos,
  tarefas,
  agora,
}: {
  pessoa: Pessoa;
  trabalhos: Trabalho[];
  tarefas: Tarefa[];
  agora: Date;
}) {
  const abertos = trabalhos
    .filter((t) => t.responsavel === pessoa.id && !estaConcluida(t.fase))
    .sort(porPrazo);

  const visiveis = abertos.slice(0, MAX_ITENS);
  const escondidos = abertos.length - visiveis.length;
  const estado = abertos.length
    ? pior(abertos.map((t) => estadoDe(t, agora)))
    : "livre";

  return (
    <article className={`cartao estado-${estado}`}>
      <header className="cartao-topo">
        <span className="cracha">{pessoa.iniciais}</span>
        <h3>{pessoa.nome}</h3>
        <span className="ref">{abertos.length}</span>
      </header>

      {visiveis.map((t) => (
        <div className={`item estado-${estadoDe(t, agora)}`} key={t.id}>
          {t.tarefa && <p className="projeto">{nomeTarefa(tarefas, t.tarefa)}</p>}
          <p className="tarefa">{t.titulo}</p>
          <Carril fase={t.fase} bloqueada={t.bloqueada} />
          <div className="cartao-fundo">
            <span className="fase-nome">{nomeFase(t.fase)}</span>
            <span className="prazo">{prazoLegivel(t.prazo, agora)}</span>
          </div>
          {t.bloqueada && <p className="bloqueio">Parada — {t.motivo}</p>}
        </div>
      ))}

      {escondidos > 0 && (
        <p className="fila">
          e mais {escondidos} {escondidos === 1 ? "trabalho" : "trabalhos"}
        </p>
      )}

      {abertos.length === 0 && <p className="livre">Sem trabalho aberto</p>}
    </article>
  );
}
