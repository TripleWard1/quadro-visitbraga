/** O motivo gráfico da marca Visit Braga — arcos concêntricos — redesenhado
 *  em SVG para poder respirar em qualquer tamanho sem pesar no monitor.
 *  Fica atrás de tudo, quase invisível: dá presença de marca sem disputar
 *  atenção com a informação. */
export default function MarcaDeAgua() {
  const nucleos = [
    { cx: 300, cy: 300, n: 14, passo: 20 },
    { cx: 470, cy: 340, n: 11, passo: 22 },
    { cx: 150, cy: 350, n: 9, passo: 24 },
  ];

  return (
    <svg
      className="marca-agua"
      viewBox="0 0 620 500"
      aria-hidden="true"
      preserveAspectRatio="xMaxYMax meet"
    >
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
