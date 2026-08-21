"use client";

import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  type User,
} from "firebase/auth";
import { MINIMO_PALAVRA_PASSE, PALAVRA_PASSE_INICIAL } from "@/lib/config";
import { traduzirErro } from "@/lib/erros";

/** Muda a palavra-passe sem sair da app: nada de emails, nada de consolas.
 *  Usa-se em dois sítios — obrigatória logo a seguir à primeira entrada, e
 *  voluntária a partir do menu. */
export default function MudarPalavra({
  utilizador,
  obrigatoria,
  aoMudar,
  aoCancelar,
}: {
  utilizador: User;
  obrigatoria: boolean;
  aoMudar: () => Promise<void> | void;
  aoCancelar?: () => void;
}) {
  const [nova, setNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [atual, setAtual] = useState("");
  const [pedeAtual, setPedeAtual] = useState(!obrigatoria);
  const [aTrabalhar, setATrabalhar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function guardar() {
    if (nova.length < MINIMO_PALAVRA_PASSE) {
      setErro(`Pelo menos ${MINIMO_PALAVRA_PASSE} caracteres.`);
      return;
    }
    if (nova === PALAVRA_PASSE_INICIAL) {
      setErro("Essa é a inicial. Escolhe outra.");
      return;
    }
    if (nova !== confirmacao) {
      setErro("As duas não coincidem.");
      return;
    }

    setATrabalhar(true);
    setErro(null);
    try {
      if (pedeAtual) {
        if (!atual) {
          setErro("Falta a palavra-passe atual.");
          setATrabalhar(false);
          return;
        }
        await reauthenticateWithCredential(
          utilizador,
          EmailAuthProvider.credential(utilizador.email!, atual)
        );
      }
      await updatePassword(utilizador, nova);
      await aoMudar();
    } catch (e: any) {
      // Sessão antiga demais para mudar a palavra-passe sem a confirmar.
      if (e?.code === "auth/requires-recent-login") {
        setPedeAtual(true);
        setErro("Confirma a palavra-passe atual para continuares.");
      } else {
        setErro(traduzirErro(e));
      }
    } finally {
      setATrabalhar(false);
    }
  }

  return (
    <div className="g-cartao">
      <h2>{obrigatoria ? "Escolhe a tua palavra-passe" : "Mudar palavra-passe"}</h2>
      {obrigatoria && (
        <p className="g-ajuda">
          Andas com a palavra-passe inicial, que toda a gente conhece. Escolhe
          uma tua para continuar.
        </p>
      )}

      {pedeAtual && (
        <input
          className="campo"
          type="password"
          autoComplete="current-password"
          placeholder="Palavra-passe atual"
          value={atual}
          onChange={(e) => setAtual(e.target.value)}
        />
      )}
      <input
        className="campo"
        type="password"
        autoComplete="new-password"
        placeholder="Nova palavra-passe"
        value={nova}
        onChange={(e) => setNova(e.target.value)}
      />
      <input
        className="campo"
        type="password"
        autoComplete="new-password"
        placeholder="Outra vez, para confirmar"
        value={confirmacao}
        onChange={(e) => setConfirmacao(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && guardar()}
      />

      <div className="g-acoes">
        <button className="botao avancar" onClick={guardar} disabled={aTrabalhar}>
          {aTrabalhar ? "A guardar…" : "Guardar"}
        </button>
        {!obrigatoria && aoCancelar && (
          <button className="botao discreto" onClick={aoCancelar}>
            cancelar
          </button>
        )}
      </div>

      {erro && <p className="g-erro">{erro}</p>}
    </div>
  );
}
