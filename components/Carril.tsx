import { FASES, idxFase, nomeFase } from "@/lib/fases";
import type { FaseId } from "@/lib/tipos";

/** O carril é a peça que dá identidade ao quadro: cinco paragens, tipo
 *  diagrama de linha. A paragem atual é maior; se a tarefa estiver parada,
 *  o troço seguinte parte-se a tracejado vermelho. */
export default function Carril({ fase, bloqueada }: { fase: FaseId; bloqueada?: boolean }) {
  const atual = idxFase(fase);

  return (
    <div className="carril" role="img" aria-label={`Fase: ${nomeFase(fase)}`}>
      {FASES.map((f, i) => (
        <span className="carril-par" key={f.id}>
          <span
            className={[
              "paragem",
              `f${i}`,
              i < atual ? "feita" : "",
              i === atual ? "atual" : "",
              i === atual && bloqueada ? "bloq" : "",
            ].join(" ")}
          />
          {i < FASES.length - 1 && (
            <span
              className={[
                "troco",
                i < atual ? "feito" : "",
                i === atual && bloqueada ? "quebrado" : "",
              ].join(" ")}
            />
          )}
        </span>
      ))}
    </div>
  );
}
