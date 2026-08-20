import type { FonteDados } from "@/lib/tipos";

export default function Rodape({
  abertas,
  atrasadas,
  paradas,
  entregues,
  ecras,
  passo,
  pausa,
  fonte,
}: {
  abertas: number;
  atrasadas: number;
  paradas: number;
  entregues: number;
  ecras: number;
  passo: number;
  pausa: boolean;
  fonte: FonteDados;
}) {
  return (
    <footer className="rodape">
      <div className="metricas">
        <span className="metrica">
          <b>{abertas}</b> abertas
        </span>
        <span className="metrica atraso">
          <b>{atrasadas}</b> em atraso
        </span>
        <span className="metrica">
          <b>{paradas}</b> paradas
        </span>
        <span className="metrica">
          <b>{entregues}</b> entregues
        </span>
      </div>
      <div className="pontos">
        {Array.from({ length: ecras }).map((_, i) => (
          <span key={i} className={"ponto" + (i === passo ? " ativo" : "")} />
        ))}
        <span className="fonte">
          {pausa
            ? "rotação em pausa"
            : fonte === "firestore"
              ? "em direto"
              : "dados de demonstração"}
        </span>
      </div>
    </footer>
  );
}
