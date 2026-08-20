"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import Carril from "@/components/Carril";
import CriarTarefa from "@/components/CriarTarefa";
import Entrada from "@/components/Entrada";
import FormularioTrabalho from "@/components/FormularioTrabalho";
import MudarPalavra from "@/components/MudarPalavra";
import PainelTarefas from "@/components/PainelTarefas";
import { DOMINIO_PERMITIDO, LOGO, SUBTITULO, TITULO } from "@/lib/config";
import { EQUIPA } from "@/lib/dadosDemo";
import { estadoDe, mesmoDia, porPrazo, prazoLegivel } from "@/lib/datas";
import { traduzirErro } from "@/lib/erros";
import {
  FASES,
  estaConcluida,
  faseAnterior,
  faseSeguinte,
  idxFase,
  nomeFase,
} from "@/lib/fases";
import { getAuthCliente, getDb } from "@/lib/firebase";
import { firebaseConfigurado } from "@/lib/firebaseConfig";
import { idDeTarefa, nomeTarefa } from "@/lib/tarefas";
import { useQuadro } from "@/lib/useQuadro";
import type { FaseId, Pessoa, Tarefa } from "@/lib/tipos";

type Aba = "minhas" | "divisao" | "tarefas";

export default function Gestao() {
  const { trabalhos, pessoas, tarefas } = useQuadro();
  const [utilizador, setUtilizador] = useState<User | null>(null);
  const [aVerificar, setAVerificar] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>("minhas");
  const [aMudarPalavra, setAMudarPalavra] = useState(false);

  const eu: Pessoa | null =
    pessoas.find((p) => p.id.toLowerCase() === utilizador?.email?.toLowerCase()) ?? null;
  const souChefe = eu?.papel === "chefe";
  const vejoDivisao = Boolean(eu?.veDivisao);

  /** As da divisão (sem dono) mais as minhas. As dos outros não me dizem nada. */
  const minhasTarefas = tarefas.filter((t) => !t.dono || t.dono === eu?.id);

  useEffect(() => {
    const auth = getAuthCliente();
    if (!auth) {
      setAVerificar(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      if (u && !u.email?.endsWith(`@${DOMINIO_PERMITIDO}`)) {
        signOut(auth);
        setErro(`Só emails @${DOMINIO_PERMITIDO} podem alterar o quadro.`);
        setUtilizador(null);
        setAVerificar(false);
        return;
      }
      setUtilizador(u);
      setAVerificar(false);
    });
  }, []);

  /** Cada pessoa cria o seu próprio registo à primeira entrada — as regras do
   *  Firestore não deixam ninguém escrever o registo de outro. */
  useEffect(() => {
    const db = getDb();
    if (!utilizador?.email || !db) return;
    (async () => {
      const modelo = EQUIPA.find((p) => p.id === utilizador.email);
      if (!modelo) return;
      try {
        const existente = await getDoc(doc(db, "pessoas", modelo.id));
        if (existente.exists()) return;
        await setDoc(doc(db, "pessoas", modelo.id), modelo, { merge: true });
      } catch (e: any) {
        setErro(traduzirErro(e));
      }
    })();
  }, [utilizador]);

  async function marcarPalavraDefinida() {
    const db = getDb();
    if (!db || !eu) return;
    await setDoc(doc(db, "pessoas", eu.id), { senhaDefinida: true }, { merge: true });
    setAMudarPalavra(false);
  }

  async function criarTrabalho(dados: {
    titulo: string;
    tarefa: string;
    prazo: Date | null;
    responsavel: string;
  }) {
    const db = getDb();
    if (!db || !eu) return false;
    try {
      await addDoc(collection(db, "trabalhos"), {
        titulo: dados.titulo,
        tarefa: dados.tarefa,
        responsavel: dados.responsavel,
        prazo: dados.prazo ? Timestamp.fromDate(dados.prazo) : null,
        fase: "porfazer" as FaseId,
        bloqueada: false,
        motivo: "",
        criadoPor: eu.id,
        atualizadoEm: serverTimestamp(),
      });
      setErro(null);
      return true;
    } catch (e: any) {
      setErro(traduzirErro(e));
      return false;
    }
  }

  async function criarTarefa(nome: string, daDivisao: boolean) {
    const db = getDb();
    if (!db || !eu) return false;
    // As pessoais levam o email no id, para duas pessoas poderem ter uma
    // frente com o mesmo nome sem se atropelarem.
    const id = daDivisao ? idDeTarefa(nome) : `${idDeTarefa(nome)}--${eu.id}`;
    try {
      await setDoc(doc(db, "tarefas", id), {
        nome,
        dono: daDivisao ? null : eu.id,
        ativo: true,
        ordem: tarefas.length + 1,
      });
      setErro(null);
      return true;
    } catch (e: any) {
      setErro(traduzirErro(e));
      return false;
    }
  }

  async function arquivarTarefa(t: Tarefa) {
    const db = getDb();
    if (!db) return;
    if (!window.confirm(`Arquivar "${t.nome}"? Deixa de aparecer na lista.`)) return;
    try {
      await updateDoc(doc(db, "tarefas", t.id), { ativo: false });
    } catch (e: any) {
      setErro(traduzirErro(e));
    }
  }

  async function mudarFase(id: string, fase: FaseId) {
    const db = getDb();
    if (!db) return;
    try {
      await updateDoc(doc(db, "trabalhos", id), { fase, atualizadoEm: serverTimestamp() });
    } catch (e: any) {
      setErro(traduzirErro(e));
    }
  }

  async function alternarBloqueio(id: string, bloqueada: boolean) {
    const db = getDb();
    if (!db) return;
    const motivo = bloqueada ? "" : (window.prompt("À espera de quê?") ?? "").trim();
    if (!bloqueada && !motivo) return;
    try {
      await updateDoc(doc(db, "trabalhos", id), {
        bloqueada: !bloqueada,
        motivo,
        atualizadoEm: serverTimestamp(),
      });
    } catch (e: any) {
      setErro(traduzirErro(e));
    }
  }

  async function apagar(id: string, titulo: string) {
    const db = getDb();
    if (!db) return;
    if (!window.confirm(`Apagar "${titulo}"?`)) return;
    try {
      await deleteDoc(doc(db, "trabalhos", id));
    } catch (e: any) {
      setErro(traduzirErro(e));
    }
  }

  /* ── ecrãs de acesso ───────────────────────────────────────── */

  if (!firebaseConfigurado) {
    return (
      <main className="gestao">
        <div className="g-entrada">
          <div className="g-cartao">
            <h2>Sem ligação configurada</h2>
            <p className="g-ajuda">
              Faltam as chaves em <code>lib/firebaseConfig.ts</code>.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (aVerificar) {
    return (
      <main className="gestao">
        <div className="g-entrada">
          <p className="g-nota" style={{ textAlign: "center" }}>
            A verificar a sessão…
          </p>
        </div>
      </main>
    );
  }

  if (!utilizador) {
    return (
      <main className="gestao">
        <Entrada aoFalhar={setErro} />
        {erro && (
          <div className="g-entrada">
            <p className="g-erro">{erro}</p>
          </div>
        )}
      </main>
    );
  }

  if (!eu) {
    return (
      <main className="gestao">
        <div className="g-entrada">
          <div className="g-cartao">
            <h2>Email por reconhecer</h2>
            <p className="g-ajuda">{utilizador.email}</p>
            <p className="g-nota">
              Este email não corresponde a ninguém na equipa. Ou está escrito de
              outra maneira em <code>lib/dadosDemo.ts</code>, ou falta lá a pessoa.
            </p>
            <div className="g-acoes" style={{ marginTop: 18 }}>
              <button className="botao" onClick={() => signOut(getAuthCliente()!)}>
                Sair
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (eu.senhaDefinida !== true) {
    return (
      <main className="gestao">
        <div className="g-entrada">
          <MudarPalavra utilizador={utilizador} obrigatoria aoMudar={marcarPalavraDefinida} />
        </div>
      </main>
    );
  }

  /* ── ecrã principal ────────────────────────────────────────── */

  const agora = new Date();
  const abertos = trabalhos.filter((t) => !estaConcluida(t.fase));
  const meus = abertos.filter((t) => t.responsavel === eu.id);
  const emAtraso = meus.filter((t) => t.prazo && t.prazo < agora);
  const paraHoje = meus.filter((t) => t.prazo && t.prazo >= agora && mesmoDia(t.prazo, agora));

  const lista = (aba === "divisao" && vejoDivisao ? abertos : meus).slice().sort(porPrazo);

  return (
    <main className="gestao">
      <header className="g-cabecalho">
        <div className="g-cabecalho-interior">
          <div className="g-marca">
            <img src={LOGO} alt="Visit Braga" />
          </div>
          <div className="g-titulo">
            <h1>{TITULO}</h1>
            <p>{SUBTITULO}</p>
          </div>
          <div className="g-utilizador">
            <span className={"g-chip" + (souChefe ? " chefe" : "")}>
              {souChefe ? "Chefe de divisão" : eu.nome.split(" ")[0]}
            </span>
            <button className="botao discreto" onClick={() => setAMudarPalavra(!aMudarPalavra)}>
              palavra-passe
            </button>
            <button className="botao discreto" onClick={() => signOut(getAuthCliente()!)}>
              sair
            </button>
          </div>
        </div>
      </header>

      <div className="g-corpo">
        {aMudarPalavra && (
          <MudarPalavra
            utilizador={utilizador}
            obrigatoria={false}
            aoMudar={marcarPalavraDefinida}
            aoCancelar={() => setAMudarPalavra(false)}
          />
        )}

        <div className="g-resumo">
          <div className={"g-numero" + (meus.length ? " bom" : "")}>
            <b>{meus.length}</b>
            <span>{meus.length === 1 ? "trabalho teu" : "trabalhos teus"}</span>
          </div>
          <div className={"g-numero" + (paraHoje.length ? " aviso" : "")}>
            <b>{paraHoje.length}</b>
            <span>a fechar hoje</span>
          </div>
          <div className={"g-numero" + (emAtraso.length ? " alerta" : "")}>
            <b>{emAtraso.length}</b>
            <span>em atraso</span>
          </div>
        </div>

        <div className="g-abas">
          <button
            className={"g-aba" + (aba === "minhas" ? " ativa" : "")}
            onClick={() => setAba("minhas")}
          >
            O meu trabalho
          </button>
          {vejoDivisao && (
          <button
            className={"g-aba" + (aba === "divisao" ? " ativa" : "")}
            onClick={() => setAba("divisao")}
          >
            A divisão
          </button>
          )}
          <button
            className={"g-aba" + (aba === "tarefas" ? " ativa" : "")}
            onClick={() => setAba("tarefas")}
          >
            Frentes de trabalho
          </button>
        </div>

        {aba === "tarefas" ? (
          <PainelTarefas
            tarefas={minhasTarefas}
            trabalhos={trabalhos}
            souChefe={souChefe}
            aoCriar={criarTarefa}
            aoArquivar={arquivarTarefa}
          />
        ) : (
          <>
            {aba === "minhas" && (
              <CriarTarefa
                quantas={minhasTarefas.length}
                souChefe={souChefe}
                aoCriar={criarTarefa}
              />
            )}

            {aba === "minhas" && (
              <FormularioTrabalho
                eu={eu}
                pessoas={pessoas}
                tarefas={minhasTarefas}
                souChefe={souChefe}
                aoCriar={criarTrabalho}
              />
            )}

            <div className="g-lista">
              {lista.length === 0 && (
                <p className="g-vazio">
                  {aba === "minhas"
                    ? "Nada aberto. No monitor apareces como sem trabalho aberto."
                    : "A divisão não tem trabalho aberto."}
                </p>
              )}

              {lista.map((t) => {
                const dono = pessoas.find((p) => p.id === t.responsavel);
                const posso = souChefe || t.responsavel === eu.id;
                const estado = estadoDe(t, agora);
                const atual = idxFase(t.fase);
                const naFimDaLinha = estaConcluida(t.fase);

                return (
                  <article className={`g-tarefa estado-${estado}`} key={t.id}>
                    <h3>{t.titulo}</h3>
                    <div className="g-meta">
                      <span>{dono?.nome ?? "por atribuir"}</span>
                      {t.tarefa && (
                        <>
                          <span className="ponto-sep">·</span>
                          <span>{nomeTarefa(tarefas, t.tarefa)}</span>
                        </>
                      )}
                      <span className="ponto-sep">·</span>
                      <span
                        className={
                          estado === "atrasada"
                            ? "atraso"
                            : estado === "hoje"
                              ? "hoje"
                              : estado === "continua"
                                ? "continua"
                                : ""
                        }
                      >
                        {t.prazo ? prazoLegivel(t.prazo, agora) : "trabalho contínuo"}
                      </span>
                    </div>

                    <div className="g-carril">
                      <Carril fase={t.fase} bloqueada={t.bloqueada} />
                      <div className="g-carril-etiquetas">
                        {FASES.map((f, i) => (
                          <span key={f.id} className={i === atual ? "agora" : ""}>
                            {f.nome}
                          </span>
                        ))}
                      </div>
                    </div>

                    {t.bloqueada && <p className="g-bloqueio">Parada — {t.motivo}</p>}

                    {posso ? (
                      <div className="g-acoes">
                        <button
                          className="botao principal"
                          disabled={naFimDaLinha}
                          onClick={() => mudarFase(t.id, faseSeguinte(t.fase))}
                        >
                          {naFimDaLinha
                            ? "Concluída"
                            : `Avançar para ${nomeFase(faseSeguinte(t.fase))}`}
                        </button>
                        <button
                          className="botao discreto"
                          onClick={() => mudarFase(t.id, faseAnterior(t.fase))}
                        >
                          recuar
                        </button>
                        <button
                          className="botao discreto"
                          onClick={() => alternarBloqueio(t.id, Boolean(t.bloqueada))}
                        >
                          {t.bloqueada ? "destrancar" : "marcar parada"}
                        </button>
                        <button className="botao discreto" onClick={() => apagar(t.id, t.titulo)}>
                          apagar
                        </button>
                      </div>
                    ) : (
                      <p className="g-so-leitura">
                        Só {dono?.nome.split(" ")[0] ?? "o responsável"} ou o chefe de
                        divisão podem mexer neste.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}

        {erro && <p className="g-erro">{erro}</p>}
      </div>
    </main>
  );
}
