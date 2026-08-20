import { FASES } from "@/lib/fases";

/** Explica o carril uma vez, para os cartões poderem ficar limpos. */
export default function Legenda() {
  return (
    <div className="legenda">
      <span className="legenda-rotulo">Percurso de uma tarefa</span>
      {FASES.map((f, i) => (
        <span className="legenda-item" key={f.id}>
          <span className="legenda-ponto" />
          {f.nome}
          {i < FASES.length - 1 && <span className="legenda-seta">→</span>}
        </span>
      ))}
    </div>
  );
}
