"use client";

import { useEffect, useMemo, useState } from "react";
import Cabecalho from "./Cabecalho";
import CartaoPessoa from "./CartaoPessoa";
import Fluxo from "./Fluxo";
import Legenda from "./Legenda";
import ListaLateral from "./ListaLateral";
import Rodape from "./Rodape";
import {
  COLUNAS_GRELHA,
  HORIZONTE_DIAS,
  PESSOAS_POR_PAGINA,
  ROTACAO_MS,
} from "@/lib/config";
import { useTarefas } from "@/lib/useTarefas";
import type { Pessoa } from "@/lib/tipos";

type Ecra = { tipo: "pessoas"; gente: Pessoa[] } | { tipo: "fluxo" };

export default function Quadro() {
  const { tarefas, pessoas, fonte, erro } = useTarefas();
  const [agora, setAgora] = useState(() => new Date());
  const [passo, setPasso] = useState(0);
  const [pausa, setPausa] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const ecras: Ecra[] = useMemo(() => {
    const lista: Ecra[] = [];
    // Páginas equilibradas: 14 pessoas dão 7+7, e não 7+7+0; 15 dariam 5+5+5.
    const paginas = Math.max(1, Math.ceil(pessoas.length / PESSOAS_POR_PAGINA));
    const porPagina = Math.ceil(pessoas.length / paginas);
    for (let i = 0; i < pessoas.length; i += porPagina) {
      lista.push({ tipo: "pessoas", gente: pessoas.slice(i, i + porPagina) });
    }
    lista.push({ tipo: "fluxo" });
    return lista;
  }, [pessoas]);

  useEffect(() => {
    if (pausa || ecras.length < 2) return;
    const t = setInterval(() => setPasso((p) => (p + 1) % ecras.length), ROTACAO_MS);
    return () => clearInterval(t);
  }, [pausa, ecras.length]);

  useEffect(() => {
    if (passo >= ecras.length) setPasso(0);
  }, [ecras.length, passo]);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "v") setPasso((p) => (p + 1) % ecras.length);
      if (k === "p") setPausa((x) => !x);
      if (k === "f") {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [ecras.length]);

  const abertas = tarefas.filter((t) => t.fase !== "entregue");
  const atrasadas = abertas
    .filter((t) => t.prazo < agora)
    .sort((a, b) => a.prazo.getTime() - b.prazo.getTime());
  const aSeguir = abertas
    .filter(
      (t) =>
        t.prazo >= agora &&
        t.prazo < new Date(agora.getTime() + HORIZONTE_DIAS * 864e5)
    )
    .sort((a, b) => a.prazo.getTime() - b.prazo.getTime());
  const paradas = abertas.filter((t) => t.bloqueada).length;
  const entregues = tarefas.filter((t) => t.fase === "entregue").length;

  const ecra = ecras[passo] ?? ecras[0];

  return (
    <div className="quadro">
      <div
        className="barra-tempo"
        key={passo}
        style={{
          animationDuration: `${ROTACAO_MS}ms`,
          animationPlayState: pausa ? "paused" : "running",
        }}
      />

      <Cabecalho agora={agora} />
      <Legenda />

      {erro && <p className="aviso">Sem ligação ao Firestore — {erro}</p>}

      <main className="corpo">
        <div className="principal">
          {ecra.tipo === "pessoas" ? (
            <div
              className="grelha"
              style={{ ["--colunas" as any]: COLUNAS_GRELHA }}
            >
              {ecra.gente.map((p) => (
                <CartaoPessoa key={p.id} pessoa={p} tarefas={tarefas} agora={agora} />
              ))}
            </div>
          ) : (
            <Fluxo tarefas={abertas} pessoas={pessoas} agora={agora} />
          )}
        </div>

        <aside className="lateral">
          <ListaLateral
            titulo="Em atraso"
            subtitulo={String(atrasadas.length)}
            itens={atrasadas.slice(0, 4)}
            pessoas={pessoas}
            agora={agora}
            vazio="Nada em atraso. Aproveitem."
            urgente
          />
          <ListaLateral
            titulo="Entra a seguir"
            subtitulo={`próximos ${HORIZONTE_DIAS} dias`}
            itens={aSeguir.slice(0, 4)}
            pessoas={pessoas}
            agora={agora}
            vazio="Agenda limpa."
          />
        </aside>
      </main>

      <Rodape
        abertas={abertas.length}
        atrasadas={atrasadas.length}
        paradas={paradas}
        entregues={entregues}
        ecras={ecras.length}
        passo={passo}
        pausa={pausa}
        fonte={fonte}
      />
    </div>
  );
}
