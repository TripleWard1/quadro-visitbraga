import { estaConcluida } from "./fases";
import { nomeTarefa } from "./tarefas";
import { contaComoAtraso, fechadoNaSemana } from "./tempo";
import type { Movimento, Pessoa, Tarefa, Trabalho } from "./tipos";

/** O resumo de sexta. Dois produtos diferentes: o monitor é para a equipa,
 *  isto é para quem chefia e para reportar acima. */
export function resumoDaSemana(
  trabalhos: Trabalho[],
  pessoas: Pessoa[],
  tarefas: Tarefa[],
  movimentos: Movimento[],
  agora: Date
) {
  const nome = (email: string) =>
    pessoas.find((p) => p.id === email)?.nome ?? email;
  const nomes = (t: Trabalho) => t.responsaveis.map(nome).join(", ");

  const fechados = trabalhos.filter(
    (t) => estaConcluida(t.fase) && fechadoNaSemana(t, agora)
  );
  const abertos = trabalhos.filter((t) => !estaConcluida(t.fase));
  const atrasados = abertos.filter((t) => contaComoAtraso(t, pessoas, agora));
  const parados = abertos.filter((t) => t.bloqueada);
  const emAprovacao = abertos.filter((t) => t.fase === "aprovacao");

  const linhas: string[] = [];
  const d = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "long" });

  linhas.push(`Divisão de Atividades Económicas e Turismo — semana de ${d.format(agora)}`);
  linhas.push("");

  linhas.push(`FECHADO (${fechados.length})`);
  if (fechados.length === 0) linhas.push("  — nada fechado esta semana");
  for (const t of fechados) {
    linhas.push(`  · ${t.titulo} — ${nomes(t)}${t.tarefa ? ` (${nomeTarefa(tarefas, t.tarefa)})` : ""}`);
  }
  linhas.push("");

  linhas.push(`À ESPERA DE APROVAÇÃO (${emAprovacao.length})`);
  if (emAprovacao.length === 0) linhas.push("  — nada pendente");
  for (const t of emAprovacao) linhas.push(`  · ${t.titulo} — ${nomes(t)}`);
  linhas.push("");

  linhas.push(`PARADO À ESPERA DE TERCEIROS (${parados.length})`);
  if (parados.length === 0) linhas.push("  — nada bloqueado");
  for (const t of parados) {
    linhas.push(`  · ${t.titulo} — ${nomes(t)} — à espera de ${t.esperaPor || t.motivo}`);
  }
  linhas.push("");

  linhas.push(`EM ATRASO (${atrasados.length})`);
  if (atrasados.length === 0) linhas.push("  — nada em atraso");
  for (const t of atrasados) linhas.push(`  · ${t.titulo} — ${nomes(t)}`);
  linhas.push("");

  linhas.push(`Em curso: ${abertos.length} trabalhos.`);

  return { texto: linhas.join("\n"), fechados, atrasados, parados, emAprovacao, abertos };
}
