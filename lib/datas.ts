import type { Estado, Tarefa } from "./tipos";

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
export const dataPorExtenso = (d: Date) => fmtCompleto.format(d);

export function mesmoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function prazoLegivel(prazo: Date, agora: Date) {
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

export function estadoDe(t: Tarefa, agora: Date): Estado {
  if (t.fase === "entregue") return "entregue";
  if (t.bloqueada) return "bloqueada";
  if (t.prazo < agora) return "atrasada";
  if (mesmoDia(t.prazo, agora)) return "hoje";
  return "normal";
}
