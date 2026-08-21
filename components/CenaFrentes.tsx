import { corDe } from "@/lib/cores";
import { FASES, estaConcluida } from "@/lib/fases";
import type { Pessoa, Tarefa, Trabalho } from "@/lib/tipos";

/** O quadro visto pelo outro lado: não por pessoa, mas por frente de trabalho.
 *  Responde à pergunta que a grelha de pessoas não responde — em que é que a
 *  divisão está a gastar o seu tempo, e quem lá anda. */
export default function CenaFrentes({
  tarefas,
  trabalhos,
  pessoas,
}: {
  tarefas: Tarefa[];
  trabalhos: Trabalho[];
  pessoas: Pessoa[];
}) {
  const abertos = trabalhos.filter((t) => !estaConcluida(t.fase));

  const linhas = tarefas
    .map((t) => {
      const meus = abertos.filter((w) => w.tarefa === t.id);
      return {
        ...t,
        total: meus.length,
        porFase: FASES.map((f) => meus.filter((w) => w.fase === f.id).length),
        parados: meus.filter((w) => w.bloqueada).length,
        gente: Array.from(new Set(meus.map((w) => w.responsavel))),
      };
    })
    .filter((l) => l.total > 0)
    .sort((a, b) => b.total - a.total);

  const soltos = abertos.filter((w) => !w.tarefa);

  return (
    <div className="cena-frentes">
      {linhas.map((l) => (
        <article className="frente-cartao" key={l.id}>
          <header>
            <h3>{l.nome}</h3>
            <span className="frente-total">{l.total}</span>
          </header>

          <div className="frente-barra">
            {l.porFase.map((n, i) =>
              n > 0 ? (
                <span key={i} className={`segmento f${i}`} style={{ flexGrow: n }}>
                  {n}
                </span>
              ) : null
            )}
          </div>

          <footer>
            <div className="frente-gente">
              {l.gente.slice(0, 6).map((email) => {
                const p = pessoas.find((x) => x.id === email);
                return (
                  <span
                    className="frente-cracha"
                    key={email}
                    title={p?.nome}
                    style={p ? { background: corDe(p), color: "#fff", borderColor: "transparent" } : undefined}
                  >
                    {p?.iniciais ?? "—"}
                  </span>
                );
              })}
              {l.gente.length > 6 && (
                <span className="frente-cracha mais">+{l.gente.length - 6}</span>
              )}
            </div>
            {l.parados > 0 && (
              <span className="frente-parado">
                {l.parados} {l.parados === 1 ? "parado" : "parados"}
              </span>
            )}
          </footer>
        </article>
      ))}

      {soltos.length > 0 && (
        <article className="frente-cartao solto">
          <header>
            <h3>Sem frente associada</h3>
            <span className="frente-total">{soltos.length}</span>
          </header>
          <p className="frente-nota">
            Trabalho registado sem frente. Vale a pena arrumá-lo.
          </p>
        </article>
      )}
    </div>
  );
}
