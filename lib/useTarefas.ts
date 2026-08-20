"use client";

import { useEffect, useState } from "react";
import { firebaseConfigurado } from "./firebaseConfig";
import { EQUIPA, TAREFAS_INICIAIS } from "./dadosDemo";
import type { FonteDados, Pessoa, Tarefa } from "./tipos";

/** Converte Timestamp do Firestore, string ISO ou Date num Date. */
function paraData(valor: any): Date {
  if (!valor) return new Date();
  if (typeof valor?.toDate === "function") return valor.toDate();
  return new Date(valor);
}

/** O Firebase entra por `import()` dentro do efeito, não no topo do ficheiro.
 *  Assim o quadro pinta-se primeiro e só depois se liga à base — se a ligação
 *  falhar, fica de pé com os dados de demonstração em vez de ficar preso. */
export function useTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>(TAREFAS_INICIAIS);
  const [pessoas, setPessoas] = useState<Pessoa[]>(EQUIPA);
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

        const { collection, onSnapshot, orderBy, query } = fs;

        paragens.push(
          onSnapshot(
            query(collection(db, "tarefas"), orderBy("prazo")),
            (snap) => {
              if (!vivo) return;
              setFonte("firestore");
              setTarefas(
                snap.docs.map((d) => {
                  const x = d.data();
                  return {
                    id: d.id,
                    titulo: x.titulo ?? "(sem título)",
                    projeto: x.projeto ?? "",
                    responsavel: x.responsavel ?? "",
                    fase: x.fase ?? "aceite",
                    bloqueada: x.bloqueada ?? false,
                    motivo: x.motivo ?? "",
                    prazo: paraData(x.prazo),
                    atualizadoEm: x.atualizadoEm ? paraData(x.atualizadoEm) : undefined,
                  } as Tarefa;
                })
              );
            },
            (e) => vivo && setErro(e.message)
          )
        );

        // Sem `where` de propósito: filtrar aqui evita ter de criar um índice
        // composto no Firestore só para esconder quem está inativo.
        paragens.push(
          onSnapshot(
            query(collection(db, "pessoas"), orderBy("ordem")),
            (snap) => {
              // Sem ninguém na base, fica a equipa de lib/dadosDemo.ts.
              if (!vivo || snap.empty) return;
              setPessoas(
                snap.docs
                  .map((d) => ({ id: d.id, ...d.data() }) as Pessoa)
                  .filter((p) => p.ativo !== false)
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

  return { tarefas, pessoas, fonte, erro };
}
