import { Raios } from "./MarcaDeAgua";
import { LOGO, SUBTITULO, TITULO } from "@/lib/config";
import { dataPorExtenso, horas, minutos, segundos } from "@/lib/datas";

/** Faixa escura no topo, com a textura de raios da marca por trás. É o que dá
 *  peso ao quadro: sem ela, o ecrã é uma folha branca com coisas em cima. */
export default function Cabecalho({ agora }: { agora: Date }) {
  return (
    <header className="cabecalho">
      <Raios />

      <div className="marca">
        <img src={LOGO} alt="Visit Braga" />
      </div>

      <div className="titulos">
        <h1>{TITULO}</h1>
        <p>{SUBTITULO}</p>
      </div>

      <div className="relogio">
        <span className="horas">
          {horas(agora)}:{minutos(agora)}
          <span className="segundos">{segundos(agora)}</span>
        </span>
        <span className="data">{dataPorExtenso(agora)}</span>
      </div>
    </header>
  );
}
