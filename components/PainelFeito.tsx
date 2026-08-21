import { nomeTarefa } from "@/lib/tarefas";
import type { Pessoa, Tarefa, Trabalho } from "@/lib/tipos";

/** O quadro só sabia falar de dívida. Isto é a outra metade: o que a divisão
 *  fechou nos últimos sete dias, com nome. Serve de reforço positivo, preenche
 *  o ecrã quando há pouco em curso, e é o que um vereador vê se passar num
 *  dia mau. */
export default function PainelFeito({
  trabalhos,
  pessoas,
  tarefas,
}: {
  trabalhos: Trabalho[];
  pessoas: Pessoa[];
  tarefas: Tarefa[];
}) {
  return (
    <div className="painel-lista">
      {trabalhos.map((t) => {
        const quem = pessoas.find((p) => p.id === t.responsaveis[0]);
        return (
          <div className="pl-linha feito" key={t.id}>
            <span className="pl-visto">✓</span>
            <span className="pl-titulo">{t.titulo}</span>
            <span className="pl-lado">
              {quem?.nome.split(" ")[0] ?? ""}
              {t.responsaveis.length > 1 && ` +${t.responsaveis.length - 1}`}
              {t.tarefa && ` · ${nomeTarefa(tarefas, t.tarefa)}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
