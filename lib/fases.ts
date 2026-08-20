import type { FaseId } from "./tipos";

/** Quatro fases. Eram cinco e uma estava a mais: "Aceite" e "Por fazer"
 *  diziam o mesmo, e separar "Em revisão" de "Aprovação" só faz sentido em
 *  equipas onde revisão e aprovação são pessoas diferentes.
 *
 *  A ordem é a espinha do quadro: o carril, as colunas do fluxo e o botão
 *  "avançar" leem todos daqui. Mexer aqui muda tudo o resto. */
export const FASES: { id: FaseId; nome: string }[] = [
  { id: "porfazer", nome: "Por fazer" },
  { id: "curso", nome: "Em curso" },
  { id: "aprovacao", nome: "Em aprovação" },
  { id: "concluida", nome: "Concluída" },
];

/** A última fase tira a tarefa do quadro. */
export const FASE_FINAL: FaseId = "concluida";

export const idxFase = (id: FaseId) => Math.max(0, FASES.findIndex((f) => f.id === id));

export const nomeFase = (id: FaseId) => FASES.find((f) => f.id === id)?.nome ?? "—";

export const estaConcluida = (id: FaseId) => id === FASE_FINAL;

export function faseSeguinte(id: FaseId): FaseId {
  return FASES[Math.min(idxFase(id) + 1, FASES.length - 1)].id;
}

export function faseAnterior(id: FaseId): FaseId {
  return FASES[Math.max(idxFase(id) - 1, 0)].id;
}

/** Tarefas criadas com o conjunto antigo de fases continuam a abrir. */
export function normalizarFase(valor: string): FaseId {
  const antigas: Record<string, FaseId> = {
    aceite: "porfazer",
    revisao: "aprovacao",
    entregue: "concluida",
  };
  if (FASES.some((f) => f.id === valor)) return valor as FaseId;
  return antigas[valor] ?? "porfazer";
}
