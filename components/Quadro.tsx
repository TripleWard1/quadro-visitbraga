"use client";

import { useEffect, useMemo, useState } from "react";
import Atividade from "./Atividade";
import BarraEquipa from "./BarraEquipa";
import Cabecalho from "./Cabecalho";
import CartaoPessoa from "./CartaoPessoa";
import CenaFrentes from "./CenaFrentes";
import CenaSemana from "./CenaSemana";
import FaixaAlerta from "./FaixaAlerta";
import FaixaEstado from "./FaixaEstado";
import MarcaDeAgua from "./MarcaDeAgua";
import Rodape from "./Rodape";
import { LIMITE_DENSO, PESSOAS_POR_PAGINA, ROTACAO_MS } from "@/lib/config";
import { mesmoDia, porPrazo } from "@/lib/datas";
import { FASES, estaConcluida } from "@/lib/fases";
import { useQuadro } from "@/lib/useQuadro";
import type { FaseId, Pessoa } from "@/lib/tipos";

type Cena =
  | { id: string; nome: string; tipo: "equipa"; gente: Pessoa[] }
  | { id: string; nome: string; tipo: "semana" }
  | { id: string; nome: string; tipo: "frentes" };

/** Um cartaz que respira. O cabeçalho, os números, o alerta e a equipa estão
 *  sempre lá; só o miolo muda de cena — e cada cena responde a uma pergunta
 *  diferente, em vez de mostrar o mesmo de outra maneira. */
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

  const ocupados = useMemo(() => new Set(abertos.map((t) => t.responsavel)), [abertos]);
  const comTrabalho = useMemo(
    () => pessoas.filter((p) => ocupados.has(p.id)),
    [pessoas, ocupados]
  );

  const frentesComTrabalho = useMemo(
    () => new Set(abertos.filter((t) => t.tarefa).map((t) => t.tarefa)).size,
    [abertos]
  );

  /** Só entram em rotação as cenas que os dados justificam. */
  const cenas: Cena[] = useMemo(() => {
    const lista: Cena[] = [];

    if (comTrabalho.length <= PESSOAS_POR_PAGINA) {
      lista.push({ id: "equipa", nome: "Equipa", tipo: "equipa", gente: comTrabalho });
    } else {
      const quantas = Math.ceil(comTrabalho.length / PESSOAS_POR_PAGINA);
      const porPagina = Math.ceil(comTrabalho.length / quantas);
      for (let i = 0; i < comTrabalho.length; i += porPagina) {
        lista.push({
          id: `equipa-${i}`,
          nome: "Equipa",
          tipo: "equipa",
          gente: comTrabalho.slice(i, i + porPagina),
        });
      }
    }

    if (abertos.length > 0) lista.push({ id: "semana", nome: "A semana", tipo: "semana" });
    if (frentesComTrabalho >= 2)
      lista.push({ id: "frentes", nome: "Frentes de trabalho", tipo: "frentes" });

    return lista;
  }, [comTrabalho, abertos.length, frentesComTrabalho]);

  useEffect(() => {
    if (pausa || cenas.length < 2) return;
    const t = setInterval(() => setPasso((p) => (p + 1) % cenas.length), ROTACAO_MS);
    return () => clearInterval(t);
  }, [pausa, cenas.length]);

  useEffect(() => {
    if (passo >= cenas.length) setPasso(0);
  }, [cenas.length, passo]);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "v") setPasso((p) => (p + 1) % cenas.length);
      if (k === "p") setPausa((x) => !x);
      if (k === "f") {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [cenas.length]);

  const cena = cenas[passo] ?? cenas[0];

  /** Poucas pessoas: cartões largos. Muitas: cartões compactos, para caber
   *  a divisão inteira sem letra ilegível. */
  const gente = cena?.tipo === "equipa" ? cena.gente : [];
  const denso = gente.length > LIMITE_DENSO;
  const colunas = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(gente.length * 1.4))));

  return (
    <div className="quadro">
      <MarcaDeAgua />

      {cenas.length > 1 && (
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

      <FaixaAlerta atrasados={atrasados} parados={parados} pessoas={pessoas} agora={agora} />

      {erro && <p className="aviso">Sem ligação ao Firestore — {erro}</p>}

      <main className="corpo">
        {cenas.length > 1 && (
          <div className="cena-titulo">
            <span className="cena-nome">{cena?.nome}</span>
            <div className="pontos">
              {cenas.map((c, i) => (
                <span key={c.id} className={"ponto" + (i === passo ? " ativo" : "")} />
              ))}
            </div>
          </div>
        )}

        <div className="cena" key={cena?.id}>
          {!cena || abertos.length === 0 ? (
            <div className="sem-nada">
              <img src="/sino-vermelho.png" alt="" />
              <p>Ninguém tem trabalho registado no quadro.</p>
            </div>
          ) : cena.tipo === "equipa" ? (
            <div
              className={"grelha" + (denso ? " densa" : "")}
              style={{ ["--colunas" as any]: colunas }}
            >
              {cena.gente.map((p) => (
                <CartaoPessoa
                  key={p.id}
                  pessoa={p}
                  trabalhos={trabalhos}
                  tarefas={tarefas}
                  agora={agora}
                  denso={denso}
                />
              ))}
            </div>
          ) : cena.tipo === "semana" ? (
            <CenaSemana
              trabalhos={abertos}
              pessoas={pessoas}
              tarefas={tarefas}
              agora={agora}
            />
          ) : (
            <CenaFrentes tarefas={tarefas} trabalhos={trabalhos} pessoas={pessoas} />
          )}
        </div>
      </main>

      <BarraEquipa pessoas={pessoas} ocupados={ocupados} />

      <Rodape
        pausa={pausa}
        fonte={fonte}
        concluidos={trabalhos.filter((t) => estaConcluida(t.fase)).length}
      />

      <Atividade trabalhos={trabalhos} pessoas={pessoas} agora={agora} />
    </div>
  );
}
