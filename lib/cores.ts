import type { Pessoa } from "./tipos";

/** Uma cor por pessoa — catorze cores para catorze pessoas.
 *
 *  A paleta anterior tinha oito e usava `ordem % 8`: o chefe de divisão e o
 *  Pedro Abreu ficavam com o mesmo tom, e esse tom era o vermelho da marca,
 *  que é a cor de alarme. Reconhecer alguém pela cor deixava de funcionar
 *  exactamente quando passava a ser preciso.
 *
 *  Regras desta paleta: catorze tons distinguíveis a quatro metros, todos
 *  capazes de aguentar texto branco por cima, e **nenhum é o vermelho de
 *  marca** — esse está reservado para o alarme. */
const PALETA = [
  "#1F4E79", // azul profundo
  "#2F6B4F", // verde jardim
  "#A8710D", // âmbar escuro
  "#6B2D5B", // ameixa
  "#1F6F6B", // verde-azulado
  "#B4552D", // terracota
  "#3E4A5B", // ardósia
  "#7A1F3D", // bordô
  "#4A3B8C", // índigo
  "#8C6A1F", // mostarda
  "#1D6A8C", // azul-petróleo
  "#5B3A2E", // castanho
  "#6E2F6E", // púrpura
  "#2D5F2E", // oliva
];

export function corDe(pessoa: Pick<Pessoa, "id" | "ordem">) {
  if (pessoa.ordem) return PALETA[(pessoa.ordem - 1) % PALETA.length];
  let n = 0;
  for (const c of pessoa.id) n = (n + c.charCodeAt(0)) % 997;
  return PALETA[n % PALETA.length];
}

/** Quantas pessoas cabem sem repetir cor. Se a divisão crescer, é aqui que se
 *  descobre — em vez de duas pessoas ficarem iguais em silêncio. */
export const CORES_DISPONIVEIS = PALETA.length;
