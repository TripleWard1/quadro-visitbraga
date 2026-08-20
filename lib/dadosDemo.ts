import type { Pessoa, Tarefa, Trabalho } from "./tipos";

/** A equipa da Divisão.
 *
 *  O id é o email de trabalho: é ele que liga a pessoa à sua conta e é sobre
 *  ele que as regras do Firestore decidem quem pode mexer em quê.
 *
 *  Esta lista é a fonte da grelha do monitor — toda a gente aparece lá, tenha
 *  ou não entrado alguma vez na aplicação.
 *
 *  `papel: "chefe"` dá acesso a criar tarefas da divisão e a distribuir
 *  trabalho por toda a gente. Se o chefe de divisão mudar, muda-se aqui **e**
 *  em firestore.rules.
 *
 *  `veDivisao: true` mostra o separador com o trabalho de todos. Não é uma
 *  barreira de segurança — o monitor da parede mostra tudo a quem passar —
 *  é para não encher o telemóvel de quem só precisa do seu. */
export const EQUIPA: Pessoa[] = [
  { id: "luis.ferreira@cm-braga.pt", nome: "Luís Ferreira", iniciais: "LF", papel: "chefe", veDivisao: true, ativo: true, ordem: 1 },
  { id: "hugo.barros@cm-braga.pt", nome: "Hugo Barros", iniciais: "HB", papel: "tecnico", veDivisao: true, ativo: true, ordem: 2 },
  { id: "ana.esteves@cm-braga.pt", nome: "Ana Esteves", iniciais: "AE", papel: "tecnico", ativo: true, ordem: 3 },
  { id: "carla.vides@cm-braga.pt", nome: "Carla Vides", iniciais: "CV", papel: "tecnico", ativo: true, ordem: 4 },
  { id: "carlos.malheiro@cm-braga.pt", nome: "Carlos Malheiro", iniciais: "CM", papel: "tecnico", ativo: true, ordem: 5 },
  { id: "joana.situ@cm-braga.pt", nome: "Joana Situ", iniciais: "JS", papel: "tecnico", ativo: true, ordem: 6 },
  { id: "mario.malheiro@cm-braga.pt", nome: "Mário Malheiro", iniciais: "MM", papel: "tecnico", ativo: true, ordem: 7 },
  { id: "paula.rodrigues@cm-braga.pt", nome: "Paula Rodrigues", iniciais: "PR", papel: "tecnico", ativo: true, ordem: 8 },
  { id: "pedro.abreu@cm-braga.pt", nome: "Pedro Abreu", iniciais: "PA", papel: "tecnico", ativo: true, ordem: 9 },
  { id: "serafim.torres@cm-braga.pt", nome: "Serafim Torres", iniciais: "ST", papel: "tecnico", ativo: true, ordem: 10 },
  { id: "soraia.pinto@cm-braga.pt", nome: "Soraia Pinto", iniciais: "SP", papel: "tecnico", ativo: true, ordem: 11 },
  { id: "tiago.pinto@cm-braga.pt", nome: "Tiago Pinto", iniciais: "TP", papel: "tecnico", ativo: true, ordem: 12 },
  { id: "vera.gomes@cm-braga.pt", nome: "Vera Gomes", iniciais: "VG", papel: "tecnico", ativo: true, ordem: 13 },
  { id: "vitor.afonso@cm-braga.pt", nome: "Vitor Afonso", iniciais: "VA", papel: "tecnico", ativo: true, ordem: 14 },
];

/** As tarefas da divisão escrevem-se na aplicação, no separador Tarefas.
 *  Fica vazio de propósito: a lista é vossa, não minha. */
export const TAREFAS_INICIAIS: Tarefa[] = [];

export const TRABALHOS_INICIAIS: Trabalho[] = [];
