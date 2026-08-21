import Carril from "./Carril";
import { corDe } from "@/lib/cores";
import { prazoLegivel } from "@/lib/datas";
import { nomeFase } from "@/lib/fases";
import { nomeTarefa } from "@/lib/tarefas";
import type { PontoDeSituacao } from "@/lib/reuniao";
import type { Tarefa, Trabalho } from "@/lib/tipos";

/** Uma pessoa de cada vez, à frente de toda a gente. Rotação parada.
 *
 *  Esta é a peça de que depende a adoção: não é a animação que faz catorze
 *  pessoas atualizarem o telemóvel, é saber que na segunda-feira de manhã o
 *  chefe percorre o quadro pessoa a pessoa. */
export default function CenaReuniao({
  ponto,
  tarefas,
  agora,
  posicao,
  total,
}: {
  ponto: PontoDeSituacao;
  tarefas: Tarefa[];
  agora: Date;
  posicao: number;
  total: number;
}) {
  const { pessoa } = ponto;

  function Linha({ t, tom }: { t: Trabalho; tom: string }) {
    return (
      <div className={`r-linha ${tom}`}>
        <span className="r-titulo">{t.titulo}</span>
        {t.tarefa && <span className="r-frente">{nomeTarefa(tarefas, t.tarefa)}</span>}
        <span className="r-prazo">{prazoLegivel(t.prazo, agora)}</span>
      </div>
    );
  }

  return (
    <div className="reuniao">
      <header className="r-cabecalho">
        <span className="r-cracha" style={{ background: corDe(pessoa) }}>
          {pessoa.iniciais}
        </span>
        <div>
          <h2>{pessoa.nome}</h2>
          <p>{pessoa.cargo}</p>
        </div>
        <span className="r-posicao">
          {posicao} <span>de {total}</span>
        </span>
      </header>

      <div className="r-colunas">
        <section className="r-coluna feito">
          <h3>Fechou</h3>
          {ponto.fechou.length === 0 && <p className="r-vazio">nada desde a última</p>}
          {ponto.fechou.map((t) => (
            <Linha key={t.id} t={t} tom="tom-feito" />
          ))}
        </section>

        <section className="r-coluna">
          <h3>Avançou</h3>
          {ponto.avancou.length === 0 && <p className="r-vazio">nada</p>}
          {ponto.avancou.map((t) => (
            <div className="r-linha tom-avanco" key={t.id}>
              <span className="r-titulo">{t.titulo}</span>
              <Carril fase={t.fase} bloqueada={t.bloqueada} />
              <span className="r-fase">{nomeFase(t.fase)}</span>
            </div>
          ))}
        </section>

        <section className="r-coluna">
          <h3>Entrou</h3>
          {ponto.entrou.length === 0 && <p className="r-vazio">nada</p>}
          {ponto.entrou.map((t) => (
            <Linha key={t.id} t={t} tom="tom-novo" />
          ))}
        </section>

        <section className="r-coluna atencao">
          <h3>A precisar de conversa</h3>
          {ponto.parado.length === 0 && ponto.atrasado.length === 0 && (
            <p className="r-vazio">nada em atraso nem parado</p>
          )}
          {ponto.parado.map((t) => (
            <div className="r-linha tom-parado" key={t.id}>
              <span className="r-titulo">{t.titulo}</span>
              <span className="r-espera">à espera de {t.esperaPor || t.motivo}</span>
            </div>
          ))}
          {ponto.atrasado
            .filter((t) => !t.bloqueada)
            .map((t) => (
              <Linha key={t.id} t={t} tom="tom-atraso" />
            ))}
        </section>
      </div>

      <footer className="r-rodape">
        <span>
          {ponto.aberto.length} {ponto.aberto.length === 1 ? "trabalho aberto" : "trabalhos abertos"}
        </span>
        <span className="r-ajuda">← → para mudar de pessoa · R para sair da reunião</span>
      </footer>
    </div>
  );
}
