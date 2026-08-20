"use client";

import { useEffect, useState } from "react";
import {
  isSignInWithEmailLink,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
} from "firebase/auth";
import { DOMINIO_PERMITIDO } from "@/lib/config";
import { getAuthCliente } from "@/lib/firebase";

const CHAVE_EMAIL = "quadro:email";

/** Entrada sem Google: o município usa Microsoft 365, por isso a prova de que
 *  alguém é da casa é conseguir abrir um email em @cm-braga.pt.
 *
 *  Caminho normal: escreve o email, recebe um link no Outlook, carrega, entrou.
 *  Se o link não chegar (filtros de correio), há a palavra-passe. */
export default function Entrada({ aoFalhar }: { aoFalhar: (m: string | null) => void }) {
  const [email, setEmail] = useState("");
  const [palavra, setPalavra] = useState("");
  const [modo, setModo] = useState<"link" | "palavra">("link");
  const [enviado, setEnviado] = useState(false);
  const [aTrabalhar, setATrabalhar] = useState(false);

  /* Quem chega aqui vindo do link do email termina a entrada. */
  useEffect(() => {
    const auth = getAuthCliente();
    if (!auth || !isSignInWithEmailLink(auth, window.location.href)) return;

    const guardado = window.localStorage.getItem(CHAVE_EMAIL);
    const endereco = guardado ?? window.prompt("Confirma o teu email:") ?? "";
    if (!endereco) return;

    signInWithEmailLink(auth, endereco, window.location.href)
      .then(() => {
        window.localStorage.removeItem(CHAVE_EMAIL);
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch((e) => aoFalhar(traduzir(e)));
  }, [aoFalhar]);

  function validar() {
    const limpo = email.trim().toLowerCase();
    if (!limpo.endsWith(`@${DOMINIO_PERMITIDO}`)) {
      aoFalhar(`O email tem de ser @${DOMINIO_PERMITIDO}.`);
      return null;
    }
    return limpo;
  }

  async function enviarLink() {
    const auth = getAuthCliente();
    const endereco = validar();
    if (!auth || !endereco) return;
    setATrabalhar(true);
    try {
      await sendSignInLinkToEmail(auth, endereco, {
        url: `${window.location.origin}/gestao`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(CHAVE_EMAIL, endereco);
      setEnviado(true);
      aoFalhar(null);
    } catch (e: any) {
      aoFalhar(traduzir(e));
    } finally {
      setATrabalhar(false);
    }
  }

  async function entrarComPalavra() {
    const auth = getAuthCliente();
    const endereco = validar();
    if (!auth || !endereco) return;
    setATrabalhar(true);
    try {
      await signInWithEmailAndPassword(auth, endereco, palavra);
      aoFalhar(null);
    } catch (e: any) {
      aoFalhar(traduzir(e));
    } finally {
      setATrabalhar(false);
    }
  }

  async function recuperar() {
    const auth = getAuthCliente();
    const endereco = validar();
    if (!auth || !endereco) return;
    try {
      await sendPasswordResetEmail(auth, endereco);
      aoFalhar("Enviámos um email para definires uma palavra-passe nova.");
    } catch (e: any) {
      aoFalhar(traduzir(e));
    }
  }

  if (enviado) {
    return (
      <div className="gestao-secao">
        <h2>Vê o teu email</h2>
        <p>
          Foi um link para <strong>{email.trim().toLowerCase()}</strong>. Abre-o
          neste mesmo browser e entras direto — não é preciso palavra-passe.
        </p>
        <p className="nota" style={{ marginTop: 12 }}>
          Nada na caixa de entrada? Espreita o lixo eletrónico.
        </p>
        <button className="botao discreto" onClick={() => setEnviado(false)}>
          voltar
        </button>
      </div>
    );
  }

  return (
    <div className="gestao-secao">
      <h2>{modo === "link" ? "Entrar" : "Entrar com palavra-passe"}</h2>
      <input
        className="campo"
        type="email"
        inputMode="email"
        autoComplete="username"
        placeholder={`nome@${DOMINIO_PERMITIDO}`}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {modo === "palavra" && (
        <input
          className="campo"
          type="password"
          autoComplete="current-password"
          placeholder="Palavra-passe"
          value={palavra}
          onChange={(e) => setPalavra(e.target.value)}
        />
      )}

      <button
        className="botao principal"
        disabled={aTrabalhar}
        onClick={modo === "link" ? enviarLink : entrarComPalavra}
      >
        {aTrabalhar ? "Um momento…" : modo === "link" ? "Receber link no email" : "Entrar"}
      </button>

      <div className="gestao-acoes" style={{ marginTop: 14 }}>
        <button
          className="botao discreto"
          onClick={() => setModo(modo === "link" ? "palavra" : "link")}
        >
          {modo === "link" ? "tenho palavra-passe" : "prefiro o link no email"}
        </button>
        {modo === "palavra" && (
          <button className="botao discreto" onClick={recuperar}>
            esqueci-me da palavra-passe
          </button>
        )}
      </div>
    </div>
  );
}

function traduzir(e: any): string {
  switch (e?.code) {
    case "auth/unauthorized-domain":
      return `O Firebase não reconhece o endereço ${window.location.hostname}. Acrescenta-o em Authentication → Settings → Authorized domains.`;
    case "auth/operation-not-allowed":
      return "Falta ativar este método em Authentication → Sign-in method, na consola do Firebase.";
    case "auth/invalid-email":
      return "Esse email não parece válido.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email ou palavra-passe errados. Se nunca definiste uma, pede o link no email.";
    case "auth/too-many-requests":
      return "Demasiadas tentativas. Espera uns minutos.";
    case "auth/invalid-action-code":
      return "Esse link já foi usado ou expirou. Pede outro.";
    default:
      return e?.message ?? "Não foi possível entrar.";
  }
}
