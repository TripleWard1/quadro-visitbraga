import { prazoLegivel } from "@/lib/datas";
import { diasNaFase } from "@/lib/movimentos";
import type { Movimento, Pessoa, Trabalho } from "@/lib/tipos";

/** A fase "Em aprovação" é a secretária do chefe de divisão, e era a única
 *  invisível para ele. Aqui está, ordenada por tempo de espera — o que espera
 *  há mais tempo aparece primeiro. */
export default function PainelAprovacao({
  trabalhos,
  pessoas,
  movimentos,
  agora,
}: {
  trabalhos: Trabalho[];
  pessoas: Pessoa[];
  movimentos: Movimento[];
  agora: Date;
}) {
  const desde = (id: string) =>
    movimentos.find((m) => m.trabalho === id && m.para === "aprovacao")?.quando;

  const fila = trabalhos
    .filter((t) => t.fase === "aprovacao")
    .map((t) => ({ t, dias: diasNaFase(desde(t.id), agora) }))
    .sort((a, b) => (b.dias ?? 0) - (a.dias ?? 0));

  return (
    <div className="painel-lista">
      {fila.map(({ t, dias }) => {
        const quem = pessoas.find((p) => p.id === t.responsaveis[0]);
        const muito = (dias ?? 0) >= 7;
        return (
          <div className={"pl-linha" + (muito ? " demora" : "")} key={t.id}>
            <span className="pl-quem">{quem?.iniciais ?? "—"}</span>
            <span className="pl-titulo">{t.titulo}</span>
            <span className="pl-lado">
              {dias === null
                ? prazoLegivel(t.prazo, agora)
                : dias === 0
                  ? "hoje"
                  : `há ${dias} ${dias === 1 ? "dia" : "dias"}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
