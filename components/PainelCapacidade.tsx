"use client";

import { estaConcluida } from "@/lib/fases";
import { corDe } from "@/lib/cores";
import { contaComoAtraso, estaAusente } from "@/lib/tempo";
import type { Pessoa, Trabalho } from "@/lib/tipos";

/** "A quem é que dou isto?" — a pergunta que o quadro nunca respondia.
 *
 *  A carga usa o peso, não a contagem: quem regista oito emails não pode
 *  parecer mais ocupado do que quem faz sozinho o plano estratégico. Quem
 *  está ausente aparece à parte, não como pessoa livre. */
export default function PainelCapacidade({
  pessoas,
  trabalhos,
  agora,
}: {
  pessoas: Pessoa[];
  trabalhos: Trabalho[];
  agora: Date;
}) {
  const abertos = trabalhos.filter((t) => !estaConcluida(t.fase));

  const linhas = pessoas
    .map((p) => {
      const meus = abertos.filter((t) => t.responsaveis.includes(p.id));
      return {
        pessoa: p,
        quantos: meus.length,
        carga: meus.reduce((soma, t) => soma + (t.peso ?? 2), 0),
        atrasados: meus.filter((t) => contaComoAtraso(t, pessoas, agora)).length,
        ausente: estaAusente(p, agora),
      };
    })
    .sort((a, b) => a.carga - b.carga);

  const maximo = Math.max(6, ...linhas.map((l) => l.carga));

  return (
    <section className="g-cartao">
      <h2>Capacidade</h2>
      <p className="g-ajuda">
        Carga aberta por pessoa, com o tamanho de cada trabalho a contar. Do
        mais livre para o mais carregado — é por cima que se começa a ler.
      </p>

      <div className="cap-lista">
        {linhas.map((l) => (
          <div className={"cap-linha" + (l.ausente ? " ausente" : "")} key={l.pessoa.id}>
            <span className="cap-cracha" style={{ background: corDe(l.pessoa) }}>
              {l.pessoa.iniciais}
            </span>
            <span className="cap-nome">
              {l.pessoa.nome}
              {l.ausente && <em> · fora</em>}
            </span>
            <span className="cap-barra">
              <span
                className={"cap-preenchida" + (l.atrasados ? " com-atraso" : "")}
                style={{ width: `${(l.carga / maximo) * 100}%` }}
              />
            </span>
            <span className="cap-numero">
              {l.quantos === 0 ? "livre" : `${l.quantos}`}
              {l.atrasados > 0 && <b> · {l.atrasados} em atraso</b>}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
