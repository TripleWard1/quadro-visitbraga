import type { Tarefa } from "./tipos";

/** Os trabalhos guardam o id da tarefa. Se a tarefa tiver sido arquivada — ou
 *  se o trabalho vier de antes de haver tarefas — devolve-se o que lá está,
 *  para o quadro nunca mostrar um espaço em branco sem explicação. */
export function nomeTarefa(tarefas: Tarefa[], id: string) {
  if (!id) return "";
  return tarefas.find((t) => t.id === id)?.nome ?? id;
}

/** "Estratégia de Turismo 2027–2037" → "estrategia-de-turismo-2027-2037" */
export function idDeTarefa(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
