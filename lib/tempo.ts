import type { Pessoa, Trabalho } from "./tipos";

/** A divisão não trabalha ao fim de semana, e o quadro tem de saber disso.
 *
 *  Sem isto, um prazo de sexta às 17:00 fica vermelho às 17:01 e passa o fim
 *  de semana inteiro a acumular ansiedade que ninguém pode resolver — e à
 *  segunda de manhã a equipa entra e encontra uma parede vermelha por causa
 *  de duas horas de atraso. */

export const DIA = 864e5;

export function ehFimDeSemana(d: Date) {
  const dia = d.getDay();
  return dia === 0 || dia === 6;
}

/** Avança para o próximo dia útil, se calhar em fim de semana. */
export function proximoDiaUtil(d: Date) {
  const r = new Date(d);
  while (ehFimDeSemana(r)) r.setDate(r.getDate() + 1);
  return r;
}

/** Um dia útil de tolerância antes de uma coisa ficar vermelha. Quem entrega
 *  às 9h da manhã seguinte não falhou nada de significativo. */
export function limiteDeAtraso(prazo: Date) {
  const limite = new Date(prazo);
  limite.setDate(limite.getDate() + 1);
  return proximoDiaUtil(limite);
}

export function estaAusente(pessoa: Pessoa | undefined, agora: Date) {
  if (!pessoa?.ausenteAte) return false;
  return pessoa.ausenteAte > agora;
}

/** Um trabalho de quem está fora não conta como atraso: não há ninguém para o
 *  fazer, e culpar quem está de férias é a forma mais rápida de esvaziar o
 *  quadro em agosto. */
export function contaComoAtraso(t: Trabalho, pessoas: Pessoa[], agora: Date) {
  if (!t.prazo) return false;
  if (agora < limiteDeAtraso(t.prazo)) return false;
  const todosFora = t.responsaveis.every((email) =>
    estaAusente(pessoas.find((p) => p.id === email), agora)
  );
  return !(t.responsaveis.length > 0 && todosFora);
}

/** Fechado nos últimos sete dias — é o que alimenta o "feito esta semana". */
export function fechadoNaSemana(t: Trabalho, agora: Date) {
  if (!t.fechadoEm) return false;
  return agora.getTime() - t.fechadoEm.getTime() < 7 * DIA;
}
