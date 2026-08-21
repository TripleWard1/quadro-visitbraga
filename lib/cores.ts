import type { Pessoa } from "./tipos";

/** Uma cor por pessoa. Catorze crachás cinzentos são catorze manchas iguais;
 *  com cor, reconhece-se quem é a quatro metros antes de se ler o nome.
 *
 *  A paleta é institucional de propósito — tons saturados mas sóbrios, todos
 *  capazes de aguentar texto branco por cima. */
const PALETA = [
  "#E30613", // vermelho de marca
  "#1F4E79", // azul profundo
  "#2F6B4F", // verde jardim
  "#A8710D", // âmbar
  "#6B2D5B", // ameixa
  "#1F6F6B", // verde-azulado
  "#B4552D", // terracota
  "#3E4A5B", // ardósia
];

export function corDe(pessoa: Pick<Pessoa, "id" | "ordem">) {
  if (pessoa.ordem) return PALETA[(pessoa.ordem - 1) % PALETA.length];
  // sem ordem, uma soma simples do email chega para ser estável
  let n = 0;
  for (const c of pessoa.id) n = (n + c.charCodeAt(0)) % 997;
  return PALETA[n % PALETA.length];
}
