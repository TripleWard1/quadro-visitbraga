"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { DOMINIO_PERMITIDO, LOGO, PALAVRA_PASSE_INICIAL, SUBTITULO } from "@/lib/config";
import { getAuthCliente } from "@/lib/firebase";
import { traduzirErro } from "@/lib/erros";

/** Email e palavra-passe, e mais nada. Na primeira vez a conta cria-se sozinha
 *  com a palavra-passe inicial — ninguém tem de registar catorze pessoas à mão
 *  na consola. O ecrã seguinte obriga a escolher outra. */
export default function Entrada({ aoFalhar }: { aoFalhar: (m: string | null) => void }) {
  const [email, setEmail] = useState("");
  const [palavra, setPalavra] = useState("");
  const [aTrabalhar, setATrabalhar] = useState(false);

  async function entrar() {
    const auth = getAuthCliente();
    if (!auth) return;

    const endereco = email.trim().toLowerCase();
    if (!endereco.endsWith(`@${DOMINIO_PERMITIDO}`)) {
      aoFalhar(`O email tem de ser @${DOMINIO_PERMITIDO}.`);
      return;
    }
    if (!palavra) {
      aoFalhar("Falta a palavra-passe.");
      return;
    }

    setATrabalhar(true);
    aoFalhar(null);
    try {
      await signInWithEmailAndPassword(auth, endereco, palavra);
    } catch (e: any) {
      // O Firebase não distingue "conta não existe" de "palavra-passe errada".
      // Se a palavra-passe é a inicial, tentamos criar: se a conta já existir,
      // é porque a palavra-passe estava mesmo errada.
      if (palavra !== PALAVRA_PASSE_INICIAL) {
        aoFalhar(traduzirErro(e));
        setATrabalhar(false);
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, endereco, palavra);
      } catch (e2: any) {
        aoFalhar(
          e2?.code === "auth/email-already-in-use" ? "Palavra-passe errada." : traduzirErro(e2)
        );
      }
    } finally {
      setATrabalhar(false);
    }
  }

  return (
    <div className="g-entrada">
      <div className="g-entrada-marca">
        <img src={LOGO} alt="Visit Braga" />
      </div>
      <div className="g-cartao">
        <h2>Quadro da Divisão</h2>
        <p className="g-ajuda">{SUBTITULO}</p>

        <div className="g-campo">
          <label htmlFor="email">Email de trabalho</label>
          <input
            id="email"
            className="campo"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder={`nome@${DOMINIO_PERMITIDO}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && entrar()}
          />
        </div>

        <div className="g-campo">
          <label htmlFor="palavra">Palavra-passe</label>
          <input
            id="palavra"
            className="campo"
            type="password"
            autoComplete="current-password"
            placeholder="••••••"
            value={palavra}
            onChange={(e) => setPalavra(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && entrar()}
          />
        </div>

        <button className="botao avancar" onClick={entrar} disabled={aTrabalhar}>
          {aTrabalhar ? "Um momento…" : "Entrar"}
        </button>

        <p className="g-nota" style={{ marginTop: 16 }}>
          Primeira vez? A palavra-passe é <code>{PALAVRA_PASSE_INICIAL}</code> — escolhes
          a tua a seguir.
        </p>
      </div>
    </div>
  );
}
