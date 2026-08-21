import { FASES, estaConcluida } from "@/lib/fases";
import type { Tarefa, Trabalho } from "@/lib/tipos";

/** O quadro visto pelo outro lado: não por pessoa, mas por frente de trabalho.
 *  Responde à pergunta do chefe de divisão — em que é que a divisão está a
 *  gastar o seu tempo — que a grelha de pessoas não responde. */
export default function PainelFrentes({
  tarefas,
  trabalhos,
}: {
  tarefas: Tarefa[];
  trabalhos: Trabalho[];
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
      };
    })
    .filter((l) => l.total > 0)
    .sort((a, b) => b.total - a.total);

  const soltos = abertos.filter((w) => !w.tarefa).length;

  return (
    <aside className="frentes">
      <header className="frentes-topo">
        <h2>Frentes de trabalho</h2>
        <span className="frentes-conta">{linhas.length}</span>
      </header>

      <div className="frentes-corpo">
        {linhas.length === 0 && (
          <p className="frentes-vazio">Ainda não há trabalho associado a frentes.</p>
        )}

        {linhas.map((l) => (
          <div className="frente" key={l.id}>
            <div className="frente-topo">
              <span className="frente-nome">{l.nome}</span>
              <span className="frente-total">{l.total}</span>
            </div>
            <div className="frente-barra">
              {l.porFase.map((n, i) =>
                n > 0 ? (
                  <span
                    key={i}
                    className={`segmento f${i}`}
                    style={{ flexGrow: n }}
                    title={`${n} ${FASES[i].nome}`}
                  />
                ) : null
              )}
            </div>
            {l.parados > 0 && (
              <span className="frente-parado">
                {l.parados} {l.parados === 1 ? "parado" : "parados"}
              </span>
            )}
          </div>
        ))}

        {soltos > 0 && (
          <p className="frentes-soltos">
            {soltos} {soltos === 1 ? "trabalho" : "trabalhos"} sem frente associada
          </p>
        )}
      </div>
    </aside>
  );
}
