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
import ComandoReuniao from "@/components/ComandoReuniao";
import CriarTarefa from "@/components/CriarTarefa";
import Entrada from "@/components/Entrada";
import FormularioTrabalho from "@/components/FormularioTrabalho";
import MudarPalavra from "@/components/MudarPalavra";
import PainelCapacidade from "@/components/PainelCapacidade";
import PainelTarefas from "@/components/PainelTarefas";
import { DOMINIO_PERMITIDO, LOGO, SUBTITULO, TITULO } from "@/lib/config";
import { EQUIPA } from "@/lib/dadosDemo";
import { estadoDe, mesmoDia, porPrazo, prazoLegivel } from "@/lib/datas";
import { contaComoAtraso, estaAusente } from "@/lib/tempo";
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
import { registarMovimento } from "@/lib/movimentos";
import { useQuadro } from "@/lib/useQuadro";
import type { FaseId, Origem, Peso, Pessoa, Tarefa } from "@/lib/tipos";

type Aba = "minhas" | "divisao" | "tarefas" | "capacidade";

export default function Gestao() {
  const { trabalhos, pessoas, tarefas, reuniao } = useQuadro();
  const [utilizador, setUtilizador] = useState<User | null>(null);
  const [aVerificar, setAVerificar] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>("minhas");
  const [aMudarPalavra, setAMudarPalavra] = useState(false);
  /** O formulário deixou de estar em cima: a ação diária é avançar fase,
   *  não criar trabalho. Criar abre-se quando é preciso. */
  const [aRegistar, setARegistar] = useState(false);
  /** Apagar em dois toques, com possibilidade de voltar atrás. */
  const [aApagar, setAApagar] = useState<string | null>(null);
  const [aBloquear, setABloquear] = useState<string | null>(null);
  const [motivoBloqueio, setMotivoBloqueio] = useState("");

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

  async function comandarReuniao(ativa: boolean, indice: number) {
    const db = getDb();
    if (!db) return;
    try {
      await setDoc(doc(db, "controlo", "reuniao"), {
        ativa,
        indice,
        atualizadoEm: serverTimestamp(),
      });
    } catch (e: any) {
      setErro(traduzirErro(e));
    }
  }

  async function terminarReuniao() {
    const db = getDb();
    if (!db || !eu) return;
    try {
      // O marcador é o que define o "desde a última reunião" da próxima vez.
      await addDoc(collection(db, "reunioes"), {
        quando: serverTimestamp(),
        conduzida_por: eu.id,
      });
      await comandarReuniao(false, 0);
    } catch (e: any) {
      setErro(traduzirErro(e));
    }
  }

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
    responsaveis: string[];
    peso: Peso;
    origem: Origem;
  }) {
    const db = getDb();
    if (!db || !eu) return false;
    try {
      const novo = await addDoc(collection(db, "trabalhos"), {
        titulo: dados.titulo,
        tarefa: dados.tarefa,
        responsaveis: dados.responsaveis,
        peso: dados.peso,
        origem: dados.origem,
        prazo: dados.prazo ? Timestamp.fromDate(dados.prazo) : null,
        fase: "porfazer" as FaseId,
        bloqueada: false,
        motivo: "",
        esperaPor: "",
        arquivado: false,
        fechadoEm: null,
        criadoPor: eu.id,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });
      await registarMovimento(db, {
        trabalho: novo.id,
        titulo: dados.titulo,
        de: null,
        para: "porfazer",
        quem: eu.id,
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
    try {
      await updateDoc(doc(db, "tarefas", t.id), { ativo: false });
    } catch (e: any) {
      setErro(traduzirErro(e));
    }
  }

  async function mudarFase(id: string, fase: FaseId) {
    const db = getDb();
    if (!db || !eu) return;
    const antes = trabalhos.find((t) => t.id === id);
    try {
      await updateDoc(doc(db, "trabalhos", id), {
        fase,
        atualizadoEm: serverTimestamp(),
        // fechar guarda a data; é o que faz o trabalho sair do monitor ao fim
        // de uma semana e alimenta o "feito esta semana"
        fechadoEm: estaConcluida(fase) ? serverTimestamp() : null,
      });
      await registarMovimento(db, {
        trabalho: id,
        titulo: antes?.titulo ?? "",
        de: antes?.fase ?? null,
        para: fase,
        quem: eu.id,
      });
    } catch (e: any) {
      setErro(traduzirErro(e));
    }
  }

  async function alternarBloqueio(id: string, bloqueada: boolean, motivo = "") {
    const db = getDb();
    if (!db) return;
    if (!bloqueada && !motivo.trim()) return;
    try {
      await updateDoc(doc(db, "trabalhos", id), {
        bloqueada: !bloqueada,
        motivo: motivo.trim(),
        // quem está a atrasar. Nem sempre é o chefe de divisão — muitas vezes
        // é o jurídico, o Turismo de Portugal, a Braval.
        esperaPor: bloqueada ? "" : motivo.trim(),
        atualizadoEm: serverTimestamp(),
      });
    } catch (e: any) {
      setErro(traduzirErro(e));
    }
  }

  async function apagar(id: string) {
    const db = getDb();
    if (!db) return;
    try {
      await deleteDoc(doc(db, "trabalhos", id));
      setAApagar(null);
    } catch (e: any) {
      setErro(traduzirErro(e));
    }
  }

  /** Ausência: um estado de ecrã, não gestão de férias. O calendário continua
   *  a ser a fonte de verdade; isto só evita que o quadro chame ocioso quem
   *  está fora e acuse de atraso quem não está cá para responder. */
  async function marcarAusencia(ate: Date | null) {
    const db = getDb();
    if (!db || !eu) return;
    try {
      await setDoc(
        doc(db, "pessoas", eu.id),
        { ausenteAte: ate ? Timestamp.fromDate(ate) : null },
        { merge: true }
      );
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
  const meus = abertos.filter((t) => t.responsaveis.includes(eu.id));
  const emAtraso = meus.filter((t) => contaComoAtraso(t, pessoas, agora));
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

        {aba === "capacidade" && vejoDivisao ? (
          <PainelCapacidade pessoas={pessoas} trabalhos={trabalhos} agora={new Date()} />
        ) : aba === "tarefas" ? (
          <PainelTarefas
            tarefas={minhasTarefas}
            trabalhos={trabalhos}
            souChefe={souChefe}
            aoCriar={criarTarefa}
            aoArquivar={arquivarTarefa}
          />
        ) : (
          <>
            {aba === "minhas" && vejoDivisao && (
              <ComandoReuniao
                pessoas={pessoas}
                ativa={reuniao.ativa}
                indice={reuniao.indice}
                aoMudar={comandarReuniao}
                aoTerminar={terminarReuniao}
              />
            )}

            {aba === "minhas" && (
              <div className="g-barra-acao">
                <button
                  className={"botao" + (aRegistar ? "" : " avancar")}
                  onClick={() => setARegistar(!aRegistar)}
                >
                  {aRegistar ? "fechar" : "+ Registar trabalho"}
                </button>
                <button
                  className="botao discreto"
                  onClick={() =>
                    eu.ausenteAte
                      ? marcarAusencia(null)
                      : marcarAusencia(new Date(Date.now() + 7 * 864e5))
                  }
                >
                  {eu.ausenteAte ? "voltei" : "vou estar ausente"}
                </button>
              </div>
            )}

            {aba === "minhas" && aRegistar && (
              <>
                <CriarTarefa
                  quantas={minhasTarefas.length}
                  souChefe={souChefe}
                  aoCriar={criarTarefa}
                />
                <FormularioTrabalho
                  eu={eu}
                  pessoas={pessoas}
                  tarefas={minhasTarefas}
                  souChefe={souChefe}
                  aoCriar={criarTrabalho}
                />
              </>
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
                const donos = t.responsaveis
                  .map((e) => pessoas.find((p) => p.id === e))
                  .filter(Boolean) as Pessoa[];
                const posso = souChefe || t.responsaveis.includes(eu.id);
                const estado = estadoDe(t, agora, estaAusente(donos[0], agora));
                const atual = idxFase(t.fase);
                const naFimDaLinha = estaConcluida(t.fase);

                return (
                  <article className={`g-tarefa estado-${estado}`} key={t.id}>
                    <h3>{t.titulo}</h3>
                    <div className="g-meta">
                      <span>
                        {donos.length === 0
                          ? "por atribuir"
                          : donos.map((d) => d.nome).join(", ")}
                      </span>
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

                    {aBloquear === t.id && (
                      <div className="g-inline">
                        <label htmlFor={`m-${t.id}`}>À espera de quê ou de quem?</label>
                        <input
                          id={`m-${t.id}`}
                          className="campo"
                          autoFocus
                          placeholder="resposta da Braval"
                          value={motivoBloqueio}
                          onChange={(e) => setMotivoBloqueio(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              alternarBloqueio(t.id, false, motivoBloqueio);
                              setABloquear(null);
                            }
                          }}
                        />
                        <div className="g-acoes">
                          <button
                            className="botao avancar"
                            disabled={!motivoBloqueio.trim()}
                            onClick={() => {
                              alternarBloqueio(t.id, false, motivoBloqueio);
                              setABloquear(null);
                            }}
                          >
                            Marcar parada
                          </button>
                          <button
                            className="botao discreto"
                            onClick={() => setABloquear(null)}
                          >
                            cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {posso ? (
                      <div className="g-acoes">
                        <button
                          className="botao avancar"
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
                          onClick={() => {
                            if (t.bloqueada) alternarBloqueio(t.id, true);
                            else {
                              setABloquear(aBloquear === t.id ? null : t.id);
                              setMotivoBloqueio("");
                            }
                          }}
                        >
                          {t.bloqueada ? "destrancar" : "marcar parada"}
                        </button>
                        {aApagar === t.id ? (
                          <>
                            <button
                              className="botao destrutivo"
                              onClick={() => apagar(t.id)}
                            >
                              apagar mesmo
                            </button>
                            <button
                              className="botao discreto"
                              onClick={() => setAApagar(null)}
                            >
                              afinal não
                            </button>
                          </>
                        ) : (
                          <button
                            className="botao discreto"
                            onClick={() => setAApagar(t.id)}
                          >
                            apagar
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="g-so-leitura">
                        Só {donos[0]?.nome.split(" ")[0] ?? "o responsável"} ou o chefe
                        de divisão podem mexer neste.
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
