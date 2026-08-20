import { estadoDe, prazoLegivel } from "@/lib/datas";
import { nomeFase } from "@/lib/fases";
import type { Pessoa, Tarefa } from "@/lib/tipos";

export default function ListaLateral({
  titulo,
  subtitulo,
  itens,
  pessoas,
  agora,
  vazio,
  urgente = false,
}: {
  titulo: string;
  subtitulo: string;
  itens: Tarefa[];
  pessoas: Pessoa[];
  agora: Date;
  vazio: string;
  urgente?: boolean;
}) {
  return (
    <section className={"painel" + (urgente ? " painel-urgente" : "")}>
      <header className="painel-topo">
        <h2>{titulo}</h2>
        <span className="painel-sub">{subtitulo}</span>
      </header>
      <div className="painel-corpo">
        {itens.length === 0 && <p className="painel-vazio">{vazio}</p>}
        {itens.map((t) => {
          const p = pessoas.find((x) => x.id === t.responsavel);
          return (
            <div className={`linha estado-${estadoDe(t, agora)}`} key={t.id}>
              <div className="linha-topo">
                <span className="linha-quem">{p ? p.nome : "Por atribuir"}</span>
                <span className="ref">#{t.id}</span>
              </div>
              <p className="linha-titulo">{t.titulo}</p>
              <div className="linha-fundo">
                <span className="etiqueta-fase">{nomeFase(t.fase)}</span>
                <span className="linha-prazo">{prazoLegivel(t.prazo, agora)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
