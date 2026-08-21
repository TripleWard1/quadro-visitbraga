/** O quadro não sabia que dia era. Passa a saber.
 *
 *  De manhã a pergunta é "o que entra hoje"; ao fim do dia é "o que fica por
 *  fechar"; à sexta ao fim da tarde é "o que a divisão fez esta semana". A
 *  mesma informação, por ordens diferentes conforme a hora a que se olha. */

export const HORARIO = { entrada: 9, saida: 17.5 };

export type Momento = "manha" | "dia" | "fimDoDia" | "fimDaSemana" | "fora";

export function momentoDe(agora: Date): Momento {
  const h = agora.getHours() + agora.getMinutes() / 60;
  const dia = agora.getDay();

  if (dia === 0 || dia === 6) return "fora";
  if (h < HORARIO.entrada - 1 || h > HORARIO.saida + 1.5) return "fora";
  if (dia === 5 && h >= 15) return "fimDaSemana";
  if (h < 11) return "manha";
  if (h >= HORARIO.saida - 1.5) return "fimDoDia";
  return "dia";
}

/** Que painel deve estar à frente a esta hora. */
export function ordemDosPaineis(momento: Momento): string[] {
  switch (momento) {
    case "manha":
      return ["semana", "aprovacao", "feito"];
    case "fimDoDia":
      return ["aprovacao", "semana", "feito"];
    case "fimDaSemana":
      return ["feito", "aprovacao", "semana"];
    default:
      return ["aprovacao", "feito", "semana"];
  }
}

export function saudacao(momento: Momento): string | null {
  switch (momento) {
    case "manha":
      return "Bom dia — o que entra hoje";
    case "fimDoDia":
      return "Fim do dia — o que fica por fechar";
    case "fimDaSemana":
      return "Sexta-feira — o que a divisão fez esta semana";
    default:
      return null;
  }
}

/** Já escureceu o ecrã fora de horas e o resultado parecia avaria.
 *  Fica a função, desligada, para quem quiser voltar ao assunto com cuidado. */
export function foraDeHoras(_momento: Momento) {
  return false;
}

/** Deslocação de um ou dois píxeis, que roda de dez em dez minutos.
 *  É o que evita a queimadura do ecrã num monitor ligado o ano inteiro. */
export function desvioAntiQueimadura(agora: Date) {
  const passo = Math.floor(agora.getTime() / 600_000) % 4;
  return [
    { x: 0, y: 0 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
    { x: -1, y: 1 },
  ][passo];
}
