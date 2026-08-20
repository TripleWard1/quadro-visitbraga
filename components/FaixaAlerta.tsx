import { prazoLegivel } from "@/lib/datas";
import type { Pessoa, Trabalho } from "@/lib/tipos";

/** Só existe quando há alguma coisa errada. Um painel de alerta permanentemente
 *  vazio ensina as pessoas a ignorá-lo; este, quando aparece, quer dizer
 *  qualquer coisa. */
export default function FaixaAlerta({
  atrasados,
  parados,
  pessoas,
  agora,
}: {
  atrasados: Trabalho[];
  parados: Trabalho[];
  pessoas: Pessoa[];
  agora: Date;
}) {
  if (atrasados.length === 0 && parados.length === 0) return null;

  const nome = (email: string) =>
    pessoas.find((p) => p.id === email)?.nome.split(" ")[0] ?? "alguém";

  return (
    <section className="alerta">
      {atrasados.length > 0 && (
        <div className="alerta-linha atraso">
          <span className="alerta-rotulo">
            {atrasados.length} em atraso
          </span>
          <div className="alerta-itens">
            {atrasados.slice(0, 4).map((t) => (
              <span className="alerta-item" key={t.id}>
                <b>{nome(t.responsavel)}</b> {t.titulo}
                <em>{prazoLegivel(t.prazo, agora)}</em>
              </span>
            ))}
            {atrasados.length > 4 && (
              <span className="alerta-item mais">+{atrasados.length - 4}</span>
            )}
          </div>
        </div>
      )}

      {parados.length > 0 && (
        <div className="alerta-linha parado">
          <span className="alerta-rotulo">
            {parados.length} {parados.length === 1 ? "parado" : "parados"}
          </span>
          <div className="alerta-itens">
            {parados.slice(0, 4).map((t) => (
              <span className="alerta-item" key={t.id}>
                <b>{nome(t.responsavel)}</b> {t.titulo}
                <em>{t.motivo}</em>
              </span>
            ))}
            {parados.length > 4 && (
              <span className="alerta-item mais">+{parados.length - 4}</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
