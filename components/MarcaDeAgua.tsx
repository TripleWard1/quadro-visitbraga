/** Os motivos gráficos da marca Visit Braga, redesenhados em SVG para poderem
 *  respirar em qualquer tamanho sem pesar no monitor. */

/** Arcos concêntricos — a mancha grande, atrás de tudo. */
export function ArcosConcentricos() {
  const nucleos = [
    { cx: 300, cy: 300, n: 14, passo: 20 },
    { cx: 470, cy: 340, n: 11, passo: 22 },
    { cx: 150, cy: 350, n: 9, passo: 24 },
  ];

  return (
    <svg className="marca-agua" viewBox="0 0 620 500" aria-hidden="true">
      {nucleos.map((nucleo, i) =>
        Array.from({ length: nucleo.n }).map((_, k) => (
          <circle
            key={`${i}-${k}`}
            cx={nucleo.cx}
            cy={nucleo.cy}
            r={(k + 1) * nucleo.passo}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        ))
      )}
    </svg>
  );
}

/** O leque de raios — usado como textura dentro da faixa escura do topo. */
export function Raios() {
  const linhas = Array.from({ length: 64 });
  return (
    <svg className="raios" viewBox="0 0 800 120" preserveAspectRatio="none" aria-hidden="true">
      {linhas.map((_, i) => {
        const x = (i / linhas.length) * 800;
        const inclinacao = (i / linhas.length - 0.5) * 90;
        return (
          <line
            key={i}
            x1={x}
            y1={0}
            x2={x + inclinacao}
            y2={120}
            stroke="currentColor"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

export default ArcosConcentricos;
