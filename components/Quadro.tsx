"use client";

import { useEffect, useMemo, useState } from "react";
import Atividade from "./Atividade";
import BarraEquipa from "./BarraEquipa";
import Cabecalho from "./Cabecalho";
import CartaoPessoa from "./CartaoPessoa";
import CenaReuniao from "./CenaReuniao";
import CenaSemana from "./CenaSemana";
import FaixaAlerta from "./FaixaAlerta";
import FaixaEstado from "./FaixaEstado";
import MarcaDeAgua from "./MarcaDeAgua";
import PainelAprovacao from "./PainelAprovacao";
import PainelFeito from "./PainelFeito";
import Rodape from "./Rodape";
import { ESCALA_MONITOR, LIMITE_DENSO, ROTACAO_MS } from "@/lib/config";
import { mesmoDia, porPrazo } from "@/lib/datas";
import { FASES, estaConcluida } from "@/lib/fases";
import {
  desvioAntiQueimadura,
  foraDeHoras,
  momentoDe,
  ordemDosPaineis,
  saudacao,
} from "@/lib/momento";
import { inicioDaJanela, pontoDeSituacao } from "@/lib/reuniao";
import { contaComoAtraso, estaAusente, fechadoNaSemana } from "@/lib/tempo";
import { useQuadro } from "@/lib/useQuadro";
import type { FaseId } from "@/lib/tipos";

/** O quadro é uma primeira página de jornal, não uma grelha.
 *
 *  As pessoas ocupam sempre o corpo principal e nunca são paginadas — paginar
 *  pessoas esconde exactamente aquilo que faz alguém olhar para o quadro. O
 *  que roda é a faixa de baixo, e só entram nela os painéis que têm conteúdo:
 *  com pouca coisa registada eles crescem e a página fica cheia; com a divisão
 *  toda a registar, encolhem e depois saem. */
export default function Quadro() {
  const { trabalhos, pessoas, tarefas, movimentos, reuniao, ultimaReuniao, fonte, erro } =
    useQuadro();
  const [agora, setAgora] = useState(() => new Date());
  const [passo, setPasso] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [reuniaoLocal, setReuniaoLocal] = useState<number | null>(null);
  /** Um monitor que mostra dados velhos com ar de certos é pior do que um
   *  monitor apagado. */
  const [ligado, setLigado] = useState(true);

  useEffect(() => {
    const acima = () => setLigado(true);
    const abaixo = () => setLigado(false);
    setLigado(navigator.onLine);
    window.addEventListener("online", acima);
    window.addEventListener("offline", abaixo);
    return () => {
      window.removeEventListener("online", acima);
      window.removeEventListener("offline", abaixo);
    };
  }, []);

  const emReuniao = reuniao.ativa || reuniaoLocal !== null;

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const abertos = useMemo(
    () => trabalhos.filter((t) => !estaConcluida(t.fase)),
    [trabalhos]
  );

  const atrasados = abertos.filter((t) => contaComoAtraso(t, pessoas, agora)).sort(porPrazo);
  const parados = abertos.filter((t) => t.bloqueada);
  const hoje = abertos.filter((t) => t.prazo && t.prazo >= agora && mesmoDia(t.prazo, agora));
  const emAprovacao = abertos.filter((t) => t.fase === "aprovacao");
  const feitos = trabalhos.filter((t) => estaConcluida(t.fase) && fechadoNaSemana(t, agora));
  const ausentes = pessoas.filter((p) => estaAusente(p, agora));

  const porFase = useMemo(() => {
    const conta = {} as Record<FaseId, number>;
    for (const f of FASES) conta[f.id] = 0;
    for (const t of abertos) conta[t.fase] = (conta[t.fase] ?? 0) + 1;
    return conta;
  }, [abertos]);

  const ocupados = useMemo(
    () => new Set(abertos.flatMap((t) => t.responsaveis)),
    [abertos]
  );
  const comTrabalho = useMemo(
    () => pessoas.filter((p) => ocupados.has(p.id)),
    [pessoas, ocupados]
  );

  const denso = comTrabalho.length > LIMITE_DENSO;

  const momento = momentoDe(agora);

  /** Cada cena ocupa o ecrã inteiro e transita para a seguinte. Só entram as
   *  que têm conteúdo: no dia-a-dia são duas — a Equipa e a Semana — e as
   *  outras aparecem quando houver aprovações pendentes ou trabalho fechado.
   *  A ordem depende da hora a que se olha para o quadro. */
  const cenas = useMemo(() => {
    const disponiveis: Record<string, string> = { equipa: "Equipa" };
    if (abertos.some((t) => t.prazo)) disponiveis.semana = "A semana";
    if (emAprovacao.length > 0) disponiveis.aprovacao = "À espera de aprovação";
    if (feitos.length > 0) disponiveis.feito = "Feito esta semana";

    const ordem = ["equipa", ...ordemDosPaineis(momento)];
    return ordem
      .filter((id, i) => disponiveis[id] && ordem.indexOf(id) === i)
      .map((id) => ({ id, nome: disponiveis[id] }));
  }, [emAprovacao.length, feitos.length, abertos, momento]);

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
      if (k === "v") setPasso((p) => (p + 1) % Math.max(1, cenas.length));
      if (k === "p") setPausa((x) => !x);
      if (k === "r") setReuniaoLocal((r) => (r === null ? 0 : null));
      if (k === "arrowright" && emReuniao)
        setReuniaoLocal((r) => Math.min((r ?? reuniao.indice) + 1, pessoas.length - 1));
      if (k === "arrowleft" && emReuniao)
        setReuniaoLocal((r) => Math.max((r ?? reuniao.indice) - 1, 0));
      if (k === "escape") setReuniaoLocal(null);
      if (k === "f") {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [cenas.length, emReuniao, pessoas.length, reuniao.indice]);

  /* ── modo reunião: rotação parada, uma pessoa de cada vez ─────── */
  if (emReuniao && pessoas.length > 0) {
    const indice = Math.min(reuniaoLocal ?? reuniao.indice, pessoas.length - 1);
    const ponto = pontoDeSituacao(
      pessoas[indice],
      trabalhos,
      movimentos,
      inicioDaJanela(ultimaReuniao, agora),
      agora
    );

    return (
      <div className="quadro em-reuniao" style={{ ["--escala" as any]: ESCALA_MONITOR }}>
        <Cabecalho agora={agora} />
        <CenaReuniao
          ponto={ponto}
          tarefas={tarefas}
          agora={agora}
          posicao={indice + 1}
          total={pessoas.length}
        />
      </div>
    );
  }

  const cena = cenas[passo] ?? cenas[0];
  const colunas = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(comTrabalho.length * 1.4))));

  const desvio = desvioAntiQueimadura(agora);
  const dorme = foraDeHoras(momento);
  const nota = saudacao(momento);

  return (
    <div
      className={
        "quadro" +
        (atrasados.length > 0 ? " tenso" : "") +
        (dorme ? " a-dormir" : "")
      }
      style={{
        ["--escala" as any]: ESCALA_MONITOR,
        transform: `translate(${desvio.x}px, ${desvio.y}px)`,
      }}
    >
      <MarcaDeAgua />

      {!ligado && (
        <div className="sem-ligacao">
          Sem ligação à rede — o que está no ecrã pode estar desatualizado
        </div>
      )}

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

      {nota && <p className="momento">{nota}</p>}

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
          {cena?.id === "equipa" &&
            (comTrabalho.length === 0 ? (
              <div className="sem-nada">
                <img src="/sino-vermelho.png" alt="" />
                <p>Ninguém tem trabalho registado no quadro.</p>
              </div>
            ) : (
              <div
                className={"grelha" + (denso ? " densa" : "")}
                style={{ ["--colunas" as any]: colunas }}
              >
                {comTrabalho.map((p) => (
                  <CartaoPessoa
                    key={p.id}
                    pessoa={p}
                    trabalhos={trabalhos}
                    tarefas={tarefas}
                    agora={agora}
                    denso={denso}
                    ausente={estaAusente(p, agora)}
                  />
                ))}
              </div>
            ))}

          {cena?.id === "semana" && (
            <CenaSemana
              trabalhos={abertos}
              pessoas={pessoas}
              tarefas={tarefas}
              agora={agora}
            />
          )}

          {cena?.id === "aprovacao" && (
            <PainelAprovacao
              trabalhos={emAprovacao}
              pessoas={pessoas}
              movimentos={movimentos}
              agora={agora}
            />
          )}

          {cena?.id === "feito" && (
            <PainelFeito trabalhos={feitos} pessoas={pessoas} tarefas={tarefas} />
          )}
        </div>
      </main>

      <BarraEquipa pessoas={pessoas} ocupados={ocupados} ausentes={ausentes} />

      <Rodape pausa={pausa} fonte={fonte} concluidos={feitos.length} />

      <Atividade trabalhos={trabalhos} pessoas={pessoas} agora={agora} />
    </div>
  );
}
