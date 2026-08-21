import { estaConcluida } from "./fases";
import type { Movimento, Pessoa, Trabalho } from "./tipos";

/** O que mudou para uma pessoa desde um dado momento.
 *
 *  É isto que faz a reunião de segunda-feira funcionar sem ninguém preparar
 *  nada: o quadro já sabe o que fechou, o que avançou e o que entrou. */
export interface PontoDeSituacao {
  pessoa: Pessoa;
  fechou: Trabalho[];
  avancou: Trabalho[];
  entrou: Trabalho[];
  aberto: Trabalho[];
  parado: Trabalho[];
  atrasado: Trabalho[];
}

export function pontoDeSituacao(
  pessoa: Pessoa,
  trabalhos: Trabalho[],
  movimentos: Movimento[],
  desde: Date,
  agora: Date
): PontoDeSituacao {
  const meus = trabalhos.filter((t) => t.responsaveis.includes(pessoa.id));
  const idsMeus = new Set(meus.map((t) => t.id));

  const desdeAReuniao = movimentos.filter(
    (m) => m.quando >= desde && idsMeus.has(m.trabalho)
  );

  const idsFechados = new Set(
    desdeAReuniao.filter((m) => estaConcluida(m.para)).map((m) => m.trabalho)
  );
  const idsEntrados = new Set(
    desdeAReuniao.filter((m) => m.de === null).map((m) => m.trabalho)
  );
  const idsAvancados = new Set(
    desdeAReuniao
      .filter((m) => m.de !== null && !estaConcluida(m.para))
      .map((m) => m.trabalho)
  );

  const abertos = meus.filter((t) => !estaConcluida(t.fase));

  return {
    pessoa,
    fechou: meus.filter((t) => idsFechados.has(t.id)),
    entrou: abertos.filter((t) => idsEntrados.has(t.id)),
    avancou: abertos.filter((t) => idsAvancados.has(t.id) && !idsEntrados.has(t.id)),
    aberto: abertos,
    parado: abertos.filter((t) => t.bloqueada),
    atrasado: abertos.filter((t) => t.prazo && t.prazo < agora),
  };
}

/** Sem marcador de reunião anterior, olha-se para os últimos sete dias. */
export function inicioDaJanela(ultimaReuniao: Date | null, agora: Date) {
  if (ultimaReuniao) return ultimaReuniao;
  const d = new Date(agora);
  d.setDate(d.getDate() - 7);
  return d;
}
