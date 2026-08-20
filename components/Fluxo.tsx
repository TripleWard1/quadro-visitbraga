import { estadoDe, prazoLegivel } from "@/lib/datas";
import { FASES } from "@/lib/fases";
import type { Pessoa, Tarefa } from "@/lib/tipos";

const MAX_POR_COLUNA = 6;

export default function Fluxo({
  tarefas,
  pessoas,
  agora,
}: {
  tarefas: Tarefa[];
  pessoas: Pessoa[];
  agora: Date;
}) {
  return (
    <div className="fluxo">
      {FASES.map((fase) => {
        const itens = tarefas
          .filter((t) => t.fase === fase.id)
          .sort((a, b) => a.prazo.getTime() - b.prazo.getTime());

        return (
          <section className="coluna" key={fase.id}>
            <header className="coluna-topo">
              <h3>{fase.nome}</h3>
              <span className="contador">{itens.length}</span>
            </header>
            <div className="coluna-corpo">
              {itens.slice(0, MAX_POR_COLUNA).map((t) => {
                const p = pessoas.find((x) => x.id === t.responsavel);
                return (
                  <div className={`ficha estado-${estadoDe(t, agora)}`} key={t.id}>
                    <span className="ficha-quem">{p ? p.iniciais : "—"}</span>
                    <span className="ficha-titulo">{t.titulo}</span>
                    <span className="ficha-prazo">{prazoLegivel(t.prazo, agora)}</span>
                  </div>
                );
              })}
              {itens.length > MAX_POR_COLUNA && (
                <p className="mais">+{itens.length - MAX_POR_COLUNA}</p>
              )}
              {itens.length === 0 && <p className="vazio">—</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
