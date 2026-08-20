import type { Estado, Trabalho } from "./tipos";
import { estaConcluida } from "./fases";

const fmtHora = new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" });
const fmtDia = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short" });
const fmtCompleto = new Intl.DateTimeFormat("pt-PT", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export const horas = (d: Date) => String(d.getHours()).padStart(2, "0");
export const minutos = (d: Date) => String(d.getMinutes()).padStart(2, "0");
export const segundos = (d: Date) => String(d.getSeconds()).padStart(2, "0");

/** "quinta-feira, 20 de agosto" — só a primeira letra em maiúscula, como se
 *  escreve em português. O CSS `capitalize` punha maiúsculas em tudo. */
export function dataPorExtenso(d: Date) {
  const t = fmtCompleto.format(d);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function mesmoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function prazoLegivel(prazo: Date | null, agora: Date) {
  if (!prazo) return "sem prazo";
  const ms = prazo.getTime() - agora.getTime();
  const h = ms / 3600e3;
  if (ms < 0) {
    const atraso = Math.abs(h);
    return atraso < 24 ? `há ${Math.round(atraso)} h` : `há ${Math.round(atraso / 24)} d`;
  }
  if (mesmoDia(prazo, agora)) return `hoje, ${fmtHora.format(prazo)}`;
  if (h < 48) return `amanhã, ${fmtHora.format(prazo)}`;
  return `${fmtDia.format(prazo)}, ${fmtHora.format(prazo)}`;
}

export function estadoDe(t: Trabalho, agora: Date): Estado {
  if (estaConcluida(t.fase)) return "concluida";
  if (t.bloqueada) return "bloqueada";
  if (!t.prazo) return "continua";
  if (t.prazo < agora) return "atrasada";
  if (mesmoDia(t.prazo, agora)) return "hoje";
  return "normal";
}

/** Ordena por prazo, com o trabalho contínuo no fim — não tem data para
 *  competir com as outras, e ficaria sempre no topo ou sempre no fundo por
 *  acidente do valor nulo. */
export function porPrazo(a: Trabalho, b: Trabalho) {
  if (!a.prazo && !b.prazo) return 0;
  if (!a.prazo) return 1;
  if (!b.prazo) return -1;
  return a.prazo.getTime() - b.prazo.getTime();
}
