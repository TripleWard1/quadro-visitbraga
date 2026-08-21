"use client";

import { useEffect, useState } from "react";
import { firebaseConfigurado } from "./firebaseConfig";
import { EQUIPA, TAREFAS_INICIAIS, TRABALHOS_INICIAIS } from "./dadosDemo";
import { normalizarFase } from "./fases";
import type { FonteDados, Movimento, Pessoa, Tarefa, Trabalho } from "./tipos";

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
  return Array.from(mapa.values())
    .filter((p) => p.id.includes("@") && p.ativo !== false)
    .sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99));
}

export function useQuadro() {
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>(TRABALHOS_INICIAIS);
  const [pessoas, setPessoas] = useState<Pessoa[]>(juntarEquipa([]));
  const [tarefas, setTarefas] = useState<Tarefa[]>(TAREFAS_INICIAIS);
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  /** Estado da reunião, comandado do telemóvel. O monitor só lê. */
  const [reuniao, setReuniao] = useState<{ ativa: boolean; indice: number }>({
    ativa: false,
    indice: 0,
  });
  const [ultimaReuniao, setUltimaReuniao] = useState<Date | null>(null);
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

        const { collection, doc, onSnapshot, query, orderBy } = fs;

        paragens.push(
          onSnapshot(
            collection(db, "trabalhos"),
            (snap) => {
              if (!vivo) return;
              setFonte("firestore");
              const limiteArquivo = Date.now() - 7 * 864e5;
              setTrabalhos(
                snap.docs.map((d) => {
                  const x = d.data();
                  return {
                    id: d.id,
                    titulo: x.titulo ?? "(sem título)",
                    tarefa: x.tarefa ?? "",
                    fase: normalizarFase(x.fase ?? "porfazer"),
                    bloqueada: x.bloqueada ?? false,
                    motivo: x.motivo ?? "",
                    prazo: paraData(x.prazo),
                    // compatibilidade: registos antigos têm `responsavel`
                    responsaveis: x.responsaveis ?? (x.responsavel ? [x.responsavel] : []),
                    peso: x.peso ?? 2,
                    origem: x.origem ?? "iniciativa",
                    esperaPor: x.esperaPor ?? "",
                    criadoEm: paraData(x.criadoEm) ?? undefined,
                    atualizadoEm: paraData(x.atualizadoEm) ?? undefined,
                    fechadoEm: paraData(x.fechadoEm),
                    arquivado: x.arquivado ?? false,
                    criadoPor: x.criadoPor ?? "",
                  } as Trabalho;
                })
                  // fora do monitor: arquivado, ou fechado há mais de 7 dias.
                  // O histórico fica em `movimentos`, que a parede não carrega.
                  .filter((t) => {
                    if (t.arquivado) return false;
                    if (t.fechadoEm && t.fechadoEm.getTime() < limiteArquivo) return false;
                    return true;
                  })
              );
            },
            (e) => vivo && setErro(e.message)
          )
        );

        paragens.push(
          onSnapshot(
            collection(db, "movimentos"),
            (snap) => {
              if (!vivo) return;
              setMovimentos(
                snap.docs
                  .map((d) => ({
                    id: d.id,
                    ...d.data(),
                    quando: paraData(d.data().quando) ?? new Date(),
                  }) as Movimento)
                  .sort((a, b) => b.quando.getTime() - a.quando.getTime())
                  .slice(0, 200)
              );
            },
            () => {
              /* sem histórico o quadro funciona à mesma */
            }
          )
        );

        // Comando da reunião: o chefe carrega no telemóvel, a parede obedece.
        paragens.push(
          onSnapshot(
            doc(db, "controlo", "reuniao"),
            (d) => {
              if (!vivo) return;
              const x = d.data();
              setReuniao({ ativa: Boolean(x?.ativa), indice: Number(x?.indice ?? 0) });
            },
            () => {}
          )
        );

        paragens.push(
          onSnapshot(
            collection(db, "reunioes"),
            (snap) => {
              if (!vivo) return;
              const datas = snap.docs
                .map((d) => paraData(d.data().quando))
                .filter(Boolean) as Date[];
              datas.sort((a, b) => b.getTime() - a.getTime());
              setUltimaReuniao(datas[0] ?? null);
            },
            () => {}
          )
        );

        paragens.push(
          onSnapshot(
            collection(db, "pessoas"),
            (snap) => {
              if (!vivo) return;
              setPessoas(
                juntarEquipa(
                  snap.docs.map((d) => {
                    const x = d.data();
                    return {
                      ...x,
                      id: d.id,
                      ausenteAte: paraData(x.ausenteAte),
                    } as Pessoa;
                  })
                )
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

  return { trabalhos, pessoas, tarefas, movimentos, reuniao, ultimaReuniao, fonte, erro };
}
