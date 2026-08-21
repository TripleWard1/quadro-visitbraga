import { ENDERECO_GESTAO } from "@/lib/config";
import { FASES } from "@/lib/fases";
import type { FonteDados } from "@/lib/tipos";

/** Referência, não notícia: a legenda do carril e o estado da ligação.
 *  Os números que interessam estão no topo. */
export default function Rodape({
  pausa,
  fonte,
  concluidos,
}: {
  pausa: boolean;
  fonte: FonteDados;
  concluidos: number;
}) {
  return (
    <footer className="rodape">
      <span className="rodape-rotulo">Percurso de um trabalho</span>
      <div className="rodape-fases">
        {FASES.map((f, i) => (
          <span className="rf" key={f.id}>
            <span className={`rf-ponto f${i}`} />
            {f.nome}
            {i < FASES.length - 1 && <span className="rf-seta">→</span>}
          </span>
        ))}
      </div>

      <span className="rodape-registar">
        Regista o teu trabalho em <b>{ENDERECO_GESTAO}</b>
      </span>

      <span className="rodape-concluidos">{concluidos} fechados esta semana</span>

      <span className="fonte">
        {pausa ? "rotação em pausa" : fonte === "firestore" ? "em direto" : "sem ligação"}
      </span>
    </footer>
  );
}
