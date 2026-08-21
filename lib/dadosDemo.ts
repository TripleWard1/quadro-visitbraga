import type { Pessoa, Tarefa, Trabalho } from "./tipos";

/** A equipa da Divisão, pela ordem hierárquica com que aparece no monitor.
 *
 *  O id é o email de trabalho: é ele que liga a pessoa à sua conta e é sobre
 *  ele que as regras do Firestore decidem quem pode mexer em quê.
 *
 *  `papel: "chefe"` dá acesso a criar frentes da divisão e a distribuir
 *  trabalho por toda a gente. Se o chefe de divisão mudar, muda-se aqui **e**
 *  em firestore.rules.
 *
 *  `veDivisao: true` mostra o separador com o trabalho de todos. Não é uma
 *  barreira de segurança — o monitor da parede mostra tudo a quem passar —
 *  é para não encher o telemóvel de quem só precisa do seu.
 *
 *  `carreira` agrupa na barra do rodapé. O CIAC não é um degrau da hierarquia:
 *  é um serviço à parte, e por isso aparece separado no fim. */
export const EQUIPA: Pessoa[] = [
  {
    id: "luis.ferreira@cm-braga.pt", nome: "Luís Ferreira", iniciais: "LF",
    papel: "chefe", veDivisao: true, carreira: "CD",
    cargo: "Chefe de Divisão", ativo: true, ordem: 1,
  },
  {
    id: "joana.situ@cm-braga.pt", nome: "Joana Situ", iniciais: "JS",
    papel: "tecnico", carreira: "TS",
    cargo: "Técnica Superior", ativo: true, ordem: 2,
  },
  {
    id: "ana.esteves@cm-braga.pt", nome: "Ana Esteves", iniciais: "AE",
    papel: "tecnico", carreira: "TS",
    cargo: "Técnica Superior", ativo: true, ordem: 3,
  },
  {
    id: "hugo.barros@cm-braga.pt", nome: "Hugo Barros", iniciais: "HB",
    papel: "tecnico", veDivisao: true, carreira: "TS",
    cargo: "Técnico Superior", ativo: true, ordem: 4,
  },
  {
    id: "tiago.pinto@cm-braga.pt", nome: "Tiago Pinto", iniciais: "TP",
    papel: "tecnico", carreira: "TS",
    cargo: "Técnico Superior", ativo: true, ordem: 5,
  },
  {
    id: "vitor.afonso@cm-braga.pt", nome: "Vitor Afonso", iniciais: "VA",
    papel: "tecnico", carreira: "TS",
    cargo: "Técnico Superior", ativo: true, ordem: 6,
  },
  {
    id: "paula.rodrigues@cm-braga.pt", nome: "Paula Rodrigues", iniciais: "PR",
    papel: "tecnico", carreira: "TS",
    cargo: "Técnica Superior", ativo: true, ordem: 7,
  },
  {
    id: "soraia.pinto@cm-braga.pt", nome: "Soraia Pinto", iniciais: "SP",
    papel: "tecnico", carreira: "AT",
    cargo: "Assistente Técnica", ativo: true, ordem: 8,
  },
  {
    id: "pedro.abreu@cm-braga.pt", nome: "Pedro Abreu", iniciais: "PA",
    papel: "tecnico", carreira: "AT",
    cargo: "Assistente Técnico", ativo: true, ordem: 9,
  },
  {
    id: "carla.vides@cm-braga.pt", nome: "Carla Vides", iniciais: "CV",
    papel: "tecnico", carreira: "AT",
    cargo: "Assistente Técnica", ativo: true, ordem: 10,
  },
  {
    id: "serafim.torres@cm-braga.pt", nome: "Serafim Torres", iniciais: "ST",
    papel: "tecnico", carreira: "AT",
    cargo: "Assistente Técnico", ativo: true, ordem: 11,
  },
  {
    id: "vera.gomes@cm-braga.pt", nome: "Vera Gomes", iniciais: "VG",
    papel: "tecnico", carreira: "AT",
    cargo: "Assistente Técnica", ativo: true, ordem: 12,
  },
  {
    id: "mario.malheiro@cm-braga.pt", nome: "Mário Malheiro", iniciais: "MM",
    papel: "tecnico", carreira: "AO",
    cargo: "Assistente Operacional", ativo: true, ordem: 13,
  },
  {
    id: "carlos.malheiro@cm-braga.pt", nome: "Carlos Malheiro", iniciais: "CM",
    papel: "tecnico", carreira: "CIAC",
    cargo: "Centro de Informação Autárquico ao Consumidor de Braga",
    ativo: true, ordem: 14,
  },
];

/** As frentes de trabalho escrevem-se na aplicação. */
export const TAREFAS_INICIAIS: Tarefa[] = [];

export const TRABALHOS_INICIAIS: Trabalho[] = [];
