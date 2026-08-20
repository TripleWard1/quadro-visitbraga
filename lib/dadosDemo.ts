import type { Pessoa, Tarefa } from "./tipos";

/** A equipa da Divisão. Serve para dois fins: povoar o quadro antes de a
 *  coleção `pessoas` existir, e semear essa coleção a partir de /gestao.
 *
 *  O `id` é o que as tarefas guardam em `responsavel` — se mudares um id
 *  depois de haver tarefas, elas ficam órfãs. Nomes e iniciais podem mudar
 *  à vontade.
 *
 *  A `ordem` decide a posição na grelha: 7 por ecrã, dois ecrãs. */
export const EQUIPA: Pessoa[] = [
  { id: "luis", nome: "Luís Ferreira", iniciais: "LF", ativo: true, ordem: 1 },
  { id: "hugo", nome: "Hugo Barros", iniciais: "HB", ativo: true, ordem: 2 },
  { id: "ana", nome: "Ana Esteves", iniciais: "AE", ativo: true, ordem: 3 },
  { id: "carla", nome: "Carla Vides", iniciais: "CV", ativo: true, ordem: 4 },
  { id: "carlos", nome: "Carlos Malheiro", iniciais: "CM", ativo: true, ordem: 5 },
  { id: "joana", nome: "Joana Situ", iniciais: "JS", ativo: true, ordem: 6 },
  { id: "mario", nome: "Mário Malheiro", iniciais: "MM", ativo: true, ordem: 7 },
  { id: "paula", nome: "Paula Rodrigues", iniciais: "PR", ativo: true, ordem: 8 },
  { id: "pedro", nome: "Pedro Abreu", iniciais: "PA", ativo: true, ordem: 9 },
  { id: "serafim", nome: "Serafim Torres", iniciais: "ST", ativo: true, ordem: 10 },
  { id: "soraia", nome: "Soraia Pinto", iniciais: "SP", ativo: true, ordem: 11 },
  { id: "tiago", nome: "Tiago Pinto", iniciais: "TP", ativo: true, ordem: 12 },
  { id: "vera", nome: "Vera Gomes", iniciais: "VG", ativo: true, ordem: 13 },
  { id: "vitor", nome: "Vitor Afonso", iniciais: "VA", ativo: true, ordem: 14 },
];

/** O quadro arranca vazio: as tarefas são as que cada um criar em /gestao. */
export const TAREFAS_INICIAIS: Tarefa[] = [];
