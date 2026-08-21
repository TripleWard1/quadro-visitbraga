import { CARREIRAS } from "@/lib/tipos";
import type { Carreira, Pessoa } from "@/lib/tipos";

/** A divisão inteira, por carreira. Quem tem trabalho registado fica a cheio;
 *  quem não tem fica esbatido. Assim a barra diz duas coisas ao mesmo tempo:
 *  quem cá está, e quanto da equipa está no quadro. */
export default function BarraEquipa({
  pessoas,
  ocupados,
}: {
  pessoas: Pessoa[];
  ocupados: Set<string>;
}) {
  const grupos = CARREIRAS.map((c) => ({
    ...c,
    gente: pessoas.filter((p) => (p.carreira ?? "TS") === (c.sigla as Carreira)),
  })).filter((g) => g.gente.length > 0);

  return (
    <section className="equipa">
      {grupos.map((g) => (
        <div className="equipa-grupo" key={g.sigla}>
          <span className="equipa-titulo">{g.nome}</span>
          <div className="equipa-gente">
            {g.gente.map((p) => {
              const ativo = ocupados.has(p.id);
              return (
                <span
                  className={"pessoa-chip" + (ativo ? " ativo" : "")}
                  key={p.id}
                  title={`${p.nome} — ${p.cargo ?? ""}`}
                >
                  <span className="chip-cracha">{p.iniciais}</span>
                  <span className="chip-nome">{p.nome}</span>
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
