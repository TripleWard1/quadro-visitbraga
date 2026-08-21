import { corDe } from "@/lib/cores";
import { mesmoDia } from "@/lib/datas";
import { nomeTarefa } from "@/lib/tarefas";
import type { Pessoa, Tarefa, Trabalho } from "@/lib/tipos";

const DIAS = 7;

const fmtDia = new Intl.DateTimeFormat("pt-PT", { weekday: "short" });
const fmtData = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit" });

/** O tempo, que até aqui era uma linha de texto dentro de um cartão. Oito
 *  colunas: o que já passou do prazo, hoje, e a semana à frente. Numa vista
 *  vê-se se a carga está à frente ou às costas — e aguenta quarenta registos,
 *  que uma lista de quatro linhas não aguentava. */
export default function CenaSemana({
  trabalhos,
  pessoas,
  tarefas,
  agora,
}: {
  trabalhos: Trabalho[];
  pessoas: Pessoa[];
  tarefas: Tarefa[];
  agora: Date;
}) {
  const quem = (email: string) => pessoas.find((p) => p.id === email);

  // Ancorar no início do dia: com `agora` ao segundo, as chaves mudavam a
  // cada tique e o React remontava as colunas — daí o piscar.
  const inicioDoDia = new Date(agora);
  inicioDoDia.setHours(0, 0, 0, 0);

  const dias = Array.from({ length: DIAS }).map((_, i) => {
    const d = new Date(inicioDoDia);
    d.setDate(d.getDate() + i);
    return d;
  });

  const atrasados = trabalhos.filter((t) => t.prazo && t.prazo < agora);
  const semPrazo = trabalhos.filter((t) => !t.prazo);
  const limite = new Date(agora);
  limite.setDate(limite.getDate() + DIAS);
  const distantes = trabalhos.filter((t) => t.prazo && t.prazo >= limite);

  function doDia(d: Date) {
    return trabalhos.filter((t) => t.prazo && t.prazo >= agora && mesmoDia(t.prazo, d));
  }

  function Pastilha({ t, tom }: { t: Trabalho; tom: string }) {
    return (
      <div className={`pastilha ${tom}${t.bloqueada ? " parada" : ""}`}>
        <span
          className="pastilha-quem"
          style={{ background: quem(t.responsavel) ? corDe(quem(t.responsavel)!) : undefined }}
        >
          {quem(t.responsavel)?.iniciais ?? "—"}
        </span>
        <span className="pastilha-titulo">{t.titulo}</span>
        {t.tarefa && <span className="pastilha-frente">{nomeTarefa(tarefas, t.tarefa)}</span>}
      </div>
    );
  }

  return (
    <div className="semana">
      {atrasados.length > 0 && (
        <section className="coluna-dia atrasado">
          <header>
            <span className="dia-nome">Atrasado</span>
            <span className="dia-conta">{atrasados.length}</span>
          </header>
          <div className="dia-corpo">
            {atrasados.slice(0, 8).map((t) => (
              <Pastilha key={t.id} t={t} tom="tom-atraso" />
            ))}
            {atrasados.length > 8 && <span className="dia-mais">+{atrasados.length - 8}</span>}
          </div>
        </section>
      )}

      {dias.map((d, i) => {
        const itens = doDia(d);
        const hoje = i === 0;
        const fds = d.getDay() === 0 || d.getDay() === 6;
        return (
          <section
            className={"coluna-dia" + (hoje ? " hoje" : "") + (fds ? " fds" : "")}
            key={i}
          >
            <header>
              <span className="dia-nome">
                {hoje ? "Hoje" : fmtDia.format(d).replace(".", "")}
              </span>
              <span className="dia-data">{fmtData.format(d)}</span>
              {itens.length > 0 && <span className="dia-conta">{itens.length}</span>}
            </header>
            <div className="dia-corpo">
              {itens.slice(0, 8).map((t) => (
                <Pastilha key={t.id} t={t} tom={hoje ? "tom-hoje" : "tom-normal"} />
              ))}
              {itens.length > 8 && <span className="dia-mais">+{itens.length - 8}</span>}
            </div>
          </section>
        );
      })}

      {(distantes.length > 0 || semPrazo.length > 0) && (
        <section className="coluna-dia depois">
          <header>
            <span className="dia-nome">Depois</span>
            <span className="dia-conta">{distantes.length + semPrazo.length}</span>
          </header>
          <div className="dia-corpo">
            {distantes.slice(0, 4).map((t) => (
              <Pastilha key={t.id} t={t} tom="tom-normal" />
            ))}
            {semPrazo.slice(0, 4).map((t) => (
              <Pastilha key={t.id} t={t} tom="tom-continuo" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
