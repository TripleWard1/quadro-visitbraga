import { FASES } from "@/lib/fases";
import type { FaseId } from "@/lib/tipos";

/** O titular do quadro: quatro números que respondem ao "há alguma coisa a
 *  arder" sem se ler uma linha. Só ganham cor quando são diferentes de zero —
 *  um zero a vermelho é ruído. */
export default function FaixaEstado({
  abertos,
  atrasados,
  hoje,
  parados,
  porFase,
}: {
  abertos: number;
  atrasados: number;
  hoje: number;
  parados: number;
  porFase: Record<FaseId, number>;
}) {
  return (
    <section className="faixa">
      <div className="faixa-numeros">
        <span className="fn">
          <b>{abertos}</b> em curso
        </span>
        <span className={"fn" + (atrasados ? " mau" : "")}>
          <b>{atrasados}</b> em atraso
        </span>
        <span className={"fn" + (hoje ? " aviso" : "")}>
          <b>{hoje}</b> fecham hoje
        </span>
        <span className={"fn" + (parados ? " mau" : "")}>
          <b>{parados}</b> parados
        </span>
      </div>

      <div className="faixa-fases">
        {FASES.filter((f) => f.id !== "concluida").map((f) => (
          <span className="ff" key={f.id}>
            {f.nome}
            <b>{porFase[f.id] ?? 0}</b>
          </span>
        ))}
      </div>
    </section>
  );
}
