import Carril from "./Carril";
import { ehRecente } from "@/lib/atividade";
import { corDe } from "@/lib/cores";
import { estadoDe, porPrazo, prazoLegivel } from "@/lib/datas";
import { estaConcluida, nomeFase } from "@/lib/fases";
import { nomeTarefa } from "@/lib/tarefas";
import type { Estado, Pessoa, Tarefa, Trabalho } from "@/lib/tipos";

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
  denso = false,
  ausente = false,
}: {
  pessoa: Pessoa;
  trabalhos: Trabalho[];
  tarefas: Tarefa[];
  agora: Date;
  /** com muita gente ocupada, os trabalhos passam a linhas compactas */
  denso?: boolean;
  /** de férias, baixa ou formação: nada dela fica vermelho */
  ausente?: boolean;
}) {
  const abertos = trabalhos
    .filter((t) => t.responsaveis.includes(pessoa.id) && !estaConcluida(t.fase))
    .sort(porPrazo);

  const max = denso ? 5 : 4;
  const visiveis = abertos.slice(0, max);
  const escondidos = abertos.length - visiveis.length;
  const estado = abertos.length
    ? pior(abertos.map((t) => estadoDe(t, agora, ausente)))
    : "livre";
  const acabou = abertos.some((t) => ehRecente(t, agora));

  return (
    <article
      className={`cartao estado-${estado}${denso ? " denso" : ""}${acabou ? " aceso" : ""}`}
      style={{ ["--cor-pessoa" as any]: corDe(pessoa) }}
    >
      <header className="cartao-topo">
        <span className="cracha" style={{ background: corDe(pessoa) }}>
          {pessoa.iniciais}
        </span>
        <h3>{denso ? pessoa.nome.split(" ")[0] : pessoa.nome}</h3>
        {ausente && <span className="etiqueta-ausente">ausente</span>}
        <span className="ref">{abertos.length}</span>
      </header>

      {denso
        ? visiveis.map((t) => (
            <div className={`item-denso estado-${estadoDe(t, agora, ausente)}`} key={t.id}>
              <span className="id-titulo">{t.titulo}</span>
              <span className="id-fase">{nomeFase(t.fase)}</span>
              <span className="id-prazo">{prazoLegivel(t.prazo, agora)}</span>
            </div>
          ))
        : visiveis.map((t) => (
            <div className={`item estado-${estadoDe(t, agora, ausente)}`} key={t.id}>
              {t.tarefa && <p className="projeto">{nomeTarefa(tarefas, t.tarefa)}</p>}
              <p className="tarefa">{t.titulo}</p>
              <Carril fase={t.fase} bloqueada={t.bloqueada} />
              <div className="cartao-fundo">
                <span className={`fase-nome fase-${t.fase}`}>{nomeFase(t.fase)}</span>
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
