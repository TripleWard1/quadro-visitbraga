import { Timestamp, addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { FaseId } from "./tipos";

/** Escreve uma linha no histórico sempre que uma fase muda.
 *
 *  É deliberadamente à parte da atualização do trabalho: se falhar, o trabalho
 *  avança na mesma. Perder uma linha de histórico é chato; impedir alguém de
 *  avançar uma fase por causa disso seria pior. */
export async function registarMovimento(
  db: Firestore,
  dados: { trabalho: string; titulo: string; de: FaseId | null; para: FaseId; quem: string }
) {
  try {
    await addDoc(collection(db, "movimentos"), {
      ...dados,
      quando: serverTimestamp(),
    });
  } catch {
    /* histórico é melhor-esforço */
  }
}

/** Quantos dias um trabalho está na fase atual, pelo último movimento. */
export function diasNaFase(desde: Date | undefined, agora: Date) {
  if (!desde) return null;
  return Math.floor((agora.getTime() - desde.getTime()) / 864e5);
}

export const paraTimestamp = (d: Date) => Timestamp.fromDate(d);
