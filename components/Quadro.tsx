"use client";

import { useEffect, useMemo, useState } from "react";
import BarraEquipa from "./BarraEquipa";
import Cabecalho from "./Cabecalho";
import CartaoPessoa from "./CartaoPessoa";
import FaixaAlerta from "./FaixaAlerta";
import FaixaEstado from "./FaixaEstado";
import MarcaDeAgua from "./MarcaDeAgua";
import PainelFrentes from "./PainelFrentes";
import Rodape from "./Rodape";
import { PESSOAS_POR_PAGINA, ROTACAO_MS } from "@/lib/config";
import { mesmoDia, porPrazo } from "@/lib/datas";
import { FASES, estaConcluida } from "@/lib/fases";
import { useQuadro } from "@/lib/useQuadro";
import type { FaseId } from "@/lib/tipos";

/** Um cartaz, não um painel de controlo. Cabe tudo num ecrã; só pagina se
 *  houver mais gente ocupada do que a grelha comporta. */
export default function Quadro() {
  const { trabalhos, pessoas, tarefas, fonte, erro } = useQuadro();
  const [agora, setAgora] = useState(() => new Date());
  const [passo, setPasso] = useState(0);
  const [pausa, setPausa] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const abertos = useMemo(
    () => trabalhos.filter((t) => !estaConcluida(t.fase)),
    [trabalhos]
  );

  const atrasados = abertos.filter((t) => t.prazo && t.prazo < agora).sort(porPrazo);
  const parados = abertos.filter((t) => t.bloqueada);
  const hoje = abertos.filter((t) => t.prazo && t.prazo >= agora && mesmoDia(t.prazo, agora));

  const porFase = useMemo(() => {
    const conta = {} as Record<FaseId, number>;
    for (const f of FASES) conta[f.id] = 0;
    for (const t of abertos) conta[t.fase] = (conta[t.fase] ?? 0) + 1;
    return conta;
  }, [abertos]);

  const ocupados = useMemo(
    () => new Set(abertos.map((t) => t.responsavel)),
    [abertos]
  );

  const comTrabalho = useMemo(
    () => pessoas.filter((p) => ocupados.has(p.id)),
    [pessoas, ocupados]
  );

  /** Páginas só quando são precisas — e equilibradas quando o são. */
  const paginas = useMemo(() => {
    if (comTrabalho.length <= PESSOAS_POR_PAGINA) return [comTrabalho];
    const quantas = Math.ceil(comTrabalho.length / PESSOAS_POR_PAGINA);
    const porPagina = Math.ceil(comTrabalho.length / quantas);
    const lista = [];
    for (let i = 0; i < comTrabalho.length; i += porPagina) {
      lista.push(comTrabalho.slice(i, i + porPagina));
    }
    return lista;
  }, [comTrabalho]);

  useEffect(() => {
    if (pausa || paginas.length < 2) return;
    const t = setInterval(() => setPasso((p) => (p + 1) % paginas.length), ROTACAO_MS);
    return () => clearInterval(t);
  }, [pausa, paginas.length]);

  useEffect(() => {
    if (passo >= paginas.length) setPasso(0);
  }, [paginas.length, passo]);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "v") setPasso((p) => (p + 1) % paginas.length);
      if (k === "p") setPausa((x) => !x);
      if (k === "f") {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [paginas.length]);

  const pagina = paginas[passo] ?? paginas[0] ?? [];
  /** Poucas pessoas ocupadas: cartões largos. Muitas: cartões estreitos.
   *  A grelha adapta-se em vez de deixar três quartos do ecrã em branco. */
  const colunas = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(pagina.length * 1.4))));

  return (
    <div className="quadro">
      <MarcaDeAgua />

      {paginas.length > 1 && (
        <div
          className="barra-tempo"
          key={passo}
          style={{
            animationDuration: `${ROTACAO_MS}ms`,
            animationPlayState: pausa ? "paused" : "running",
          }}
        />
      )}

      <Cabecalho agora={agora} />

      <FaixaEstado
        abertos={abertos.length}
        atrasados={atrasados.length}
        hoje={hoje.length}
        parados={parados.length}
        porFase={porFase}
      />

      <FaixaAlerta
        atrasados={atrasados}
        parados={parados}
        pessoas={pessoas}
        agora={agora}
      />

      {erro && <p className="aviso">Sem ligação ao Firestore — {erro}</p>}

      <main className="corpo">
        <div className="principal">
          {pagina.length === 0 ? (
            <div className="sem-nada">
              <img src="/sino-vermelho.png" alt="" />
              <p>Ninguém tem trabalho registado no quadro.</p>
            </div>
          ) : (
            <div className="grelha" style={{ ["--colunas" as any]: colunas }}>
              {pagina.map((p) => (
                <CartaoPessoa
                  key={p.id}
                  pessoa={p}
                  trabalhos={trabalhos}
                  tarefas={tarefas}
                  agora={agora}
                />
              ))}
            </div>
          )}
        </div>

        <PainelFrentes tarefas={tarefas} trabalhos={trabalhos} />
      </main>

      <BarraEquipa pessoas={pessoas} ocupados={ocupados} />

      <Rodape
        paginas={paginas.length}
        passo={passo}
        pausa={pausa}
        fonte={fonte}
        concluidos={trabalhos.filter((t) => estaConcluida(t.fase)).length}
      />
    </div>
  );
}
