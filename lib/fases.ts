import type { FaseId } from "./tipos";

/** A ordem é a espinha do quadro: o carril, as colunas do fluxo e o botão
 *  "avançar fase" leem todos daqui. Mexer aqui muda tudo o resto. */
export const FASES: { id: FaseId; nome: string }[] = [
  { id: "aceite", nome: "Aceite" },
  { id: "curso", nome: "Em curso" },
  { id: "revisao", nome: "Em revisão" },
  { id: "aprovacao", nome: "Aprovação" },
  { id: "entregue", nome: "Entregue" },
];

export const idxFase = (id: FaseId) => FASES.findIndex((f) => f.id === id);

export const nomeFase = (id: FaseId) => FASES.find((f) => f.id === id)?.nome ?? "—";

export function faseSeguinte(id: FaseId): FaseId {
  const i = idxFase(id);
  return FASES[Math.min(i + 1, FASES.length - 1)].id;
}

export function faseAnterior(id: FaseId): FaseId {
  const i = idxFase(id);
  return FASES[Math.max(i - 1, 0)].id;
}
