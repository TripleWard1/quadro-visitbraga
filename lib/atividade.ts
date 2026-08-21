import { nomeFase } from "./fases";
import type { Pessoa, Trabalho } from "./tipos";

/** Segundos durante os quais uma alteração conta como "acabada de acontecer".
 *  É o tempo em que o cartão fica aceso na parede. */
export const JANELA_RECENTE = 90_000;

export function ehRecente(t: Trabalho, agora: Date) {
  if (!t.atualizadoEm) return false;
  return agora.getTime() - t.atualizadoEm.getTime() < JANELA_RECENTE;
}

/** A última coisa que aconteceu na divisão, em português corrente.
 *  É isto que faz o quadro parecer vivo: quem mexe no telemóvel vê o seu
 *  nome aparecer na parede. */
export function ultimaAtividade(trabalhos: Trabalho[], pessoas: Pessoa[], agora: Date) {
  const recentes = trabalhos
    .filter((t) => t.atualizadoEm)
    .sort((a, b) => b.atualizadoEm!.getTime() - a.atualizadoEm!.getTime());

  const ultimo = recentes[0];
  if (!ultimo || !ehRecente(ultimo, agora)) return null;

  const quem =
    pessoas.find((p) => p.id === ultimo.responsaveis[0])?.nome.split(" ")[0] ?? "Alguém";
  const segundos = Math.max(1, Math.round((agora.getTime() - ultimo.atualizadoEm!.getTime()) / 1000));
  const quando = segundos < 60 ? `há ${segundos} s` : `há ${Math.round(segundos / 60)} min`;

  const acao = ultimo.bloqueada
    ? "marcou como parado"
    : `pôs em ${nomeFase(ultimo.fase).toLowerCase()}`;

  return { quem, acao, titulo: ultimo.titulo, quando, id: ultimo.id };
}
