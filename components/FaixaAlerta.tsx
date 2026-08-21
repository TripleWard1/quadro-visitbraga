import { prazoLegivel } from "@/lib/datas";
import type { Pessoa, Trabalho } from "@/lib/tipos";

/** Só existe quando há alguma coisa errada. Um painel de alerta permanentemente
 *  vazio ensina as pessoas a ignorá-lo; este, quando aparece, quer dizer
 *  qualquer coisa — e traz o sino da marca, que para isto serve mesmo. */
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

  const nome = (t: Trabalho) => {
    const gente = t.responsaveis
      .map((e) => pessoas.find((p) => p.id === e)?.nome.split(" ")[0])
      .filter(Boolean);
    if (gente.length === 0) return "alguém";
    if (gente.length === 1) return gente[0];
    return `${gente[0]} +${gente.length - 1}`;
  };

  return (
    <section className="alerta">
      <img className="alerta-sino" src="/sino-branco.png" alt="" />

      <div className="alerta-conteudo">
        {atrasados.length > 0 && (
          <div className="alerta-linha">
            <span className="alerta-rotulo">
              {atrasados.length} em atraso
            </span>
            <div className="alerta-itens">
              {atrasados.slice(0, 5).map((t) => (
                <span className="alerta-item" key={t.id}>
                  <b>{nome(t)}</b> {t.titulo}
                  <em>{prazoLegivel(t.prazo, agora)}</em>
                </span>
              ))}
              {atrasados.length > 5 && (
                <span className="alerta-item mais">+{atrasados.length - 5}</span>
              )}
            </div>
          </div>
        )}

        {parados.length > 0 && (
          <div className="alerta-linha">
            <span className="alerta-rotulo">
              {parados.length} {parados.length === 1 ? "parado" : "parados"}
            </span>
            <div className="alerta-itens">
              {parados.slice(0, 5).map((t) => (
                <span className="alerta-item" key={t.id}>
                  <b>{nome(t)}</b> {t.titulo}
                  <em>{t.motivo}</em>
                </span>
              ))}
              {parados.length > 5 && (
                <span className="alerta-item mais">+{parados.length - 5}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
