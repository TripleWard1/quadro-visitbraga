import type { Pessoa } from "@/lib/tipos";

/** Quem não tem trabalho aberto não precisa de um cartão do tamanho de um
 *  cartaz — precisa de estar listado. Uma tira no fundo chega, e devolve o
 *  espaço todo a quem tem alguma coisa a acontecer. */
export default function TiraLivres({ pessoas }: { pessoas: Pessoa[] }) {
  if (pessoas.length === 0) return null;

  return (
    <section className="tira-livres">
      <span className="tira-rotulo">Sem trabalho aberto</span>
      <div className="tira-gente">
        {pessoas.map((p) => (
          <span className="tira-pessoa" key={p.id} title={p.nome}>
            <span className="tira-cracha">{p.iniciais}</span>
            {p.nome.split(" ")[0]}
          </span>
        ))}
      </div>
      <span className="tira-conta">{pessoas.length}</span>
    </section>
  );
}
