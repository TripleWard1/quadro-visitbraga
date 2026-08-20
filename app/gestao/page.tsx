"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import Entrada from "@/components/Entrada";
import { DOMINIO_PERMITIDO } from "@/lib/config";
import { EQUIPA } from "@/lib/dadosDemo";
import { prazoLegivel } from "@/lib/datas";
import { FASES, faseAnterior, faseSeguinte, nomeFase } from "@/lib/fases";
import { getAuthCliente, getDb } from "@/lib/firebase";
import { firebaseConfigurado } from "@/lib/firebaseConfig";
import { useTarefas } from "@/lib/useTarefas";
import type { FaseId, Pessoa } from "@/lib/tipos";

/** Onde cada pessoa põe o que anda a fazer e vai empurrando a fase.
 *  Pensada para o telemóvel: entra-se com a conta do município, escolhe-se o
 *  nome uma vez, e daí em diante é só "avançar". */
export default function Gestao() {
  const { tarefas, pessoas } = useTarefas();
  const [utilizador, setUtilizador] = useState<User | null>(null);
  const [aVerificar, setAVerificar] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [todas, setTodas] = useState(false);
  const [aGravar, setAGravar] = useState(false);
  const [novo, setNovo] = useState({ titulo: "", projeto: "", prazo: "", responsavel: "" });

  const eu: Pessoa | null =
    pessoas.find((p) => p.email && p.email === utilizador?.email) ?? null;

  const projetosConhecidos = useMemo(
    () => Array.from(new Set(tarefas.map((t) => t.projeto).filter(Boolean))).sort(),
    [tarefas]
  );

  useEffect(() => {
    const auth = getAuthCliente();
    if (!auth) {
      setAVerificar(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      // Rede de segurança: as regras do Firestore recusariam a escrita na
      // mesma, mas mais vale dizê-lo à cara.
      if (u && !u.email?.endsWith(`@${DOMINIO_PERMITIDO}`)) {
        signOut(auth);
        setErro(`Só contas @${DOMINIO_PERMITIDO} podem alterar o quadro.`);
        setUtilizador(null);
        setAVerificar(false);
        return;
      }
      setUtilizador(u);
      setAVerificar(false);
    });
  }, []);

  async function souEu(pessoa: Pessoa) {
    const db = getDb();
    if (!db || !utilizador?.email) return;
    try {
      await setDoc(
        doc(db, "pessoas", pessoa.id),
        { ...pessoa, email: utilizador.email, ativo: true },
        { merge: true }
      );
      setErro(null);
    } catch (e: any) {
      setErro(e.message);
    }
  }

  async function criarEquipa() {
    const db = getDb();
    if (!db) return;
    try {
      for (const p of EQUIPA) await setDoc(doc(db, "pessoas", p.id), p, { merge: true });
      setErro(null);
    } catch (e: any) {
      setErro(e.message);
    }
  }

  async function criar() {
    const db = getDb();
    if (!db || !eu) return;
    if (!novo.titulo.trim() || !novo.prazo) {
      setErro("Falta o título ou o prazo.");
      return;
    }
    setAGravar(true);
    try {
      await addDoc(collection(db, "tarefas"), {
        titulo: novo.titulo.trim(),
        projeto: novo.projeto.trim(),
        responsavel: novo.responsavel || eu.id,
        fase: "aceite" as FaseId,
        bloqueada: false,
        motivo: "",
        prazo: Timestamp.fromDate(new Date(novo.prazo)),
        criadaPor: utilizador?.email ?? "",
        atualizadoEm: serverTimestamp(),
      });
      setNovo({ titulo: "", projeto: "", prazo: "", responsavel: "" });
      setErro(null);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setAGravar(false);
    }
  }

  async function mudarFase(id: string, fase: FaseId) {
    const db = getDb();
    if (!db) return;
    try {
      await updateDoc(doc(db, "tarefas", id), { fase, atualizadoEm: serverTimestamp() });
    } catch (e: any) {
      setErro(e.message);
    }
  }

  async function alternarBloqueio(id: string, bloqueada: boolean) {
    const db = getDb();
    if (!db) return;
    const motivo = bloqueada ? "" : (window.prompt("À espera de quê?") ?? "").trim();
    if (!bloqueada && !motivo) return;
    try {
      await updateDoc(doc(db, "tarefas", id), {
        bloqueada: !bloqueada,
        motivo,
        atualizadoEm: serverTimestamp(),
      });
    } catch (e: any) {
      setErro(e.message);
    }
  }

  async function apagar(id: string, titulo: string) {
    const db = getDb();
    if (!db) return;
    if (!window.confirm(`Apagar "${titulo}"?`)) return;
    try {
      await deleteDoc(doc(db, "tarefas", id));
    } catch (e: any) {
      setErro(e.message);
    }
  }

  /* ── ecrãs ─────────────────────────────────────────────────── */

  if (!firebaseConfigurado) {
    return (
      <main className="gestao">
        <h1>Gestão do quadro</h1>
        <p className="nota">Sem ligação configurada</p>
        <p>
          Faltam as chaves em <code>lib/firebaseConfig.ts</code>.
        </p>
      </main>
    );
  }

  if (aVerificar) {
    return (
      <main className="gestao">
        <p className="nota">A verificar a sessão…</p>
      </main>
    );
  }

  if (!utilizador) {
    return (
      <main className="gestao">
        <h1>Gestão do quadro</h1>
        <p className="nota">Divisão de Atividades Económicas e Turismo</p>
        <p>
          Isto é onde acrescentas o teu trabalho ao quadro da parede. Entra com o
          teu email do município.
        </p>
        <Entrada aoFalhar={setErro} />
        {erro && <p className="gestao-erro">{erro}</p>}
      </main>
    );
  }

  if (!eu) {
    return (
      <main className="gestao">
        <div className="gestao-topo">
          <h1>Quem és tu?</h1>
          <button
            className="botao discreto"
            style={{ marginLeft: "auto" }}
            onClick={() => signOut(getAuthCliente()!)}
          >
            Sair
          </button>
        </div>
        <p className="nota">{utilizador.email} · escolhe-se uma vez</p>
        <div className="escolha">
          {pessoas.map((p) => (
            <button className="botao" key={p.id} onClick={() => souEu(p)}>
              {p.nome}
            </button>
          ))}
        </div>
        <p style={{ marginTop: 24 }}>
          <button className="botao discreto" onClick={criarEquipa}>
            Não estou na lista — criar a equipa no Firestore
          </button>
        </p>
        {erro && <p className="gestao-erro">{erro}</p>}
      </main>
    );
  }

  const agora = new Date();
  const visiveis = tarefas
    .filter((t) => (todas ? true : t.responsavel === eu.id))
    .filter((t) => t.fase !== "entregue")
    .sort((a, b) => a.prazo.getTime() - b.prazo.getTime());

  return (
    <main className="gestao">
      <div className="gestao-topo">
        <h1>Olá, {eu.nome.split(" ")[0]}</h1>
        <button
          className="botao discreto"
          style={{ marginLeft: "auto" }}
          onClick={() => signOut(getAuthCliente()!)}
        >
          Sair
        </button>
      </div>
      <p className="nota">
        {visiveis.length} {todas ? "abertas na divisão" : "abertas tuas"} · o monitor
        acompanha em direto
      </p>

      <section className="gestao-secao">
        <h2>Acrescentar trabalho</h2>
        <input
          className="campo"
          placeholder="O que é preciso fazer"
          value={novo.titulo}
          onChange={(e) => setNovo({ ...novo, titulo: e.target.value })}
        />
        <input
          className="campo"
          list="projetos"
          placeholder="Projeto"
          value={novo.projeto}
          onChange={(e) => setNovo({ ...novo, projeto: e.target.value })}
        />
        <datalist id="projetos">
          {projetosConhecidos.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        <input
          className="campo"
          type="datetime-local"
          value={novo.prazo}
          onChange={(e) => setNovo({ ...novo, prazo: e.target.value })}
        />
        <select
          className="campo"
          value={novo.responsavel}
          onChange={(e) => setNovo({ ...novo, responsavel: e.target.value })}
        >
          <option value="">Para mim</option>
          {pessoas
            .filter((p) => p.id !== eu.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                Para {p.nome}
              </option>
            ))}
        </select>
        <button className="botao principal" onClick={criar} disabled={aGravar}>
          {aGravar ? "A gravar…" : "Pôr no quadro"}
        </button>
      </section>

      <div className="gestao-filtro">
        <button className="botao discreto" onClick={() => setTodas(!todas)}>
          {todas ? "ver só as minhas" : "ver as de todos"}
        </button>
      </div>

      <div className="gestao-lista">
        {visiveis.length === 0 && (
          <p className="nota">Nada aberto — no quadro apareces como sem tarefa aberta.</p>
        )}
        {visiveis.map((t) => {
          const p = pessoas.find((x) => x.id === t.responsavel);
          const noFim = t.fase === "entregue";
          return (
            <article className={"gestao-item" + (t.bloqueada ? " bloqueada" : "")} key={t.id}>
              <h3>{t.titulo}</h3>
              <p className="meta">
                {p?.nome ?? "por atribuir"}
                {t.projeto ? ` · ${t.projeto}` : ""} · {nomeFase(t.fase)} ·{" "}
                {prazoLegivel(t.prazo, agora)}
              </p>
              {t.bloqueada && <p className="gestao-erro">Parada — {t.motivo}</p>}
              <div className="gestao-acoes">
                <button
                  className="botao discreto"
                  onClick={() => mudarFase(t.id, faseAnterior(t.fase))}
                >
                  ← recuar
                </button>
                <button
                  className="botao"
                  disabled={noFim}
                  onClick={() => mudarFase(t.id, faseSeguinte(t.fase))}
                >
                  avançar para {nomeFase(faseSeguinte(t.fase))}
                </button>
                <button
                  className="botao discreto"
                  onClick={() => alternarBloqueio(t.id, Boolean(t.bloqueada))}
                >
                  {t.bloqueada ? "destrancar" : "marcar parada"}
                </button>
                <select
                  className="botao discreto"
                  value={t.fase}
                  onChange={(e) => mudarFase(t.id, e.target.value as FaseId)}
                >
                  {FASES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
                <button className="botao discreto" onClick={() => apagar(t.id, t.titulo)}>
                  apagar
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {erro && <p className="gestao-erro">{erro}</p>}
    </main>
  );
}
