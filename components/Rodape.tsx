import { FASES } from "@/lib/fases";
import type { FonteDados } from "@/lib/tipos";

/** O rodapé é referência, não notícia: a legenda do carril e o estado da
 *  ligação. Os números que interessam estão no topo. */
export default function Rodape({
  paginas,
  passo,
  pausa,
  fonte,
  concluidos,
}: {
  paginas: number;
  passo: number;
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
            <span className="rf-ponto" />
            {f.nome}
            {i < FASES.length - 1 && <span className="rf-seta">→</span>}
          </span>
        ))}
      </div>

      <span className="rodape-concluidos">{concluidos} concluídos</span>

      {paginas > 1 && (
        <div className="pontos">
          {Array.from({ length: paginas }).map((_, i) => (
            <span key={i} className={"ponto" + (i === passo ? " ativo" : "")} />
          ))}
        </div>
      )}

      <span className="fonte">
        {pausa ? "rotação em pausa" : fonte === "firestore" ? "em direto" : "sem ligação"}
      </span>
    </footer>
  );
}
