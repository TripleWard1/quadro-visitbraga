"use client";

import { useEffect, useState } from "react";
import { firebaseConfigurado } from "./firebaseConfig";
import { EQUIPA, TAREFAS_INICIAIS, TRABALHOS_INICIAIS } from "./dadosDemo";
import { normalizarFase } from "./fases";
import type { FonteDados, Pessoa, Tarefa, Trabalho } from "./tipos";

function paraData(valor: any): Date | null {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor?.toDate === "function") return valor.toDate();
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** A equipa vem do código; o Firestore só acrescenta o que souber de cada um
 *  (o papel, se está ativo, se já definiu a palavra-passe). Sem isto, o
 *  monitor só mostrava quem já tivesse entrado alguma vez na aplicação. */
function juntarEquipa(daBase: Pessoa[]): Pessoa[] {
  const mapa = new Map<string, Pessoa>();
  for (const p of EQUIPA) mapa.set(p.id, p);
  for (const p of daBase) mapa.set(p.id, { ...mapa.get(p.id), ...p });
  return [...mapa.values()]
    .filter((p) => p.id.includes("@") && p.ativo !== false)
    .sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99));
}

export function useQuadro() {
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>(TRABALHOS_INICIAIS);
  const [pessoas, setPessoas] = useState<Pessoa[]>(juntarEquipa([]));
  const [tarefas, setTarefas] = useState<Tarefa[]>(TAREFAS_INICIAIS);
  const [fonte, setFonte] = useState<FonteDados>("demo");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseConfigurado) return;

    let vivo = true;
    const paragens: Array<() => void> = [];

    (async () => {
      try {
        const [{ getDb }, fs] = await Promise.all([
          import("./firebase"),
          import("firebase/firestore"),
        ]);
        const db = getDb();
        if (!db || !vivo) return;

        const { collection, onSnapshot, query, orderBy } = fs;

        paragens.push(
          onSnapshot(
            collection(db, "trabalhos"),
            (snap) => {
              if (!vivo) return;
              setFonte("firestore");
              setTrabalhos(
                snap.docs.map((d) => {
                  const x = d.data();
                  return {
                    id: d.id,
                    titulo: x.titulo ?? "(sem título)",
                    tarefa: x.tarefa ?? "",
                    responsavel: x.responsavel ?? "",
                    fase: normalizarFase(x.fase ?? "porfazer"),
                    bloqueada: x.bloqueada ?? false,
                    motivo: x.motivo ?? "",
                    prazo: paraData(x.prazo),
                    atualizadoEm: paraData(x.atualizadoEm) ?? undefined,
                    criadoPor: x.criadoPor ?? "",
                  } as Trabalho;
                })
              );
            },
            (e) => vivo && setErro(e.message)
          )
        );

        paragens.push(
          onSnapshot(
            collection(db, "pessoas"),
            (snap) => {
              if (!vivo) return;
              setPessoas(
                juntarEquipa(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Pessoa))
              );
            },
            (e) => vivo && setErro(e.message)
          )
        );

        paragens.push(
          onSnapshot(
            query(collection(db, "tarefas"), orderBy("ordem")),
            (snap) => {
              if (!vivo) return;
              setTarefas(
                snap.docs
                  .map((d) => ({ ...d.data(), id: d.id }) as Tarefa)
                  .filter((t) => t.ativo !== false)
              );
            },
            (e) => vivo && setErro(e.message)
          )
        );
      } catch (e: any) {
        if (vivo) setErro(e?.message ?? "não foi possível carregar o Firebase");
      }
    })();

    return () => {
      vivo = false;
      paragens.forEach((parar) => parar());
    };
  }, []);

  return { trabalhos, pessoas, tarefas, fonte, erro };
}
