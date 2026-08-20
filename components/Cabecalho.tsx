import { LOGO, LOGO_EM_CHAPA_CLARA, SUBTITULO, TITULO } from "@/lib/config";
import { dataPorExtenso, horas, minutos, segundos } from "@/lib/datas";

export default function Cabecalho({ agora }: { agora: Date }) {
  return (
    <header className="cabecalho">
      <div className={"marca" + (LOGO_EM_CHAPA_CLARA ? " chapa" : "")}>
        {/* <img> em vez de next/image: evita configurar domínios remotos */}
        <img src={LOGO} alt="Visit Braga" />
      </div>
      <div className="titulos">
        <h1>{TITULO}</h1>
        <p>{SUBTITULO}</p>
      </div>
      <div className="relogio">
        <span className="horas">
          {horas(agora)}:{minutos(agora)}
          <span className="segundos">:{segundos(agora)}</span>
        </span>
        <span className="data">{dataPorExtenso(agora)}</span>
      </div>
    </header>
  );
}
