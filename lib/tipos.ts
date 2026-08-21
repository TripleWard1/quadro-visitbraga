export type FaseId = "porfazer" | "curso" | "aprovacao" | "concluida";

export type Estado =
  | "normal"
  | "hoje"
  | "atrasada"
  | "bloqueada"
  | "concluida"
  | "continua"
  | "livre";

export type Papel = "chefe" | "tecnico";

/** Carreira, para a barra da equipa. A ordem desta lista é a ordem em que
 *  os grupos aparecem no monitor. */
export const CARREIRAS = [
  { sigla: "CD", nome: "Chefe de Divisão" },
  { sigla: "TS", nome: "Técnicos Superiores" },
  { sigla: "AT", nome: "Assistentes Técnicos" },
  { sigla: "AO", nome: "Assistente Operacional" },
  { sigla: "CIAC", nome: "CIAC" },
] as const;

export type Carreira = (typeof CARREIRAS)[number]["sigla"];

/** Peso grosseiro, três níveis, escolhido em meio segundo. Serve para a
 *  leitura de carga não tratar oito emails como o plano estratégico.
 *  Comparar dentro da mesma pessoa ao longo do tempo, não entre pessoas. */
export const PESOS = [
  { valor: 1 as const, nome: "Pequeno", dica: "horas" },
  { valor: 2 as const, nome: "Normal", dica: "dias" },
  { valor: 3 as const, nome: "Grande", dica: "semanas" },
];

export type Peso = 1 | 2 | 3;

/** De onde vem o trabalho. Separa prazo legal de "prometi para quinta", que
 *  até agora tinham a mesma cor, e serve para defender a divisão para cima. */
export const ORIGENS = [
  { id: "iniciativa", nome: "Iniciativa da divisão" },
  { id: "despacho", nome: "Despacho" },
  { id: "legal", nome: "Prazo legal" },
  { id: "candidatura", nome: "Candidatura" },
  { id: "pedido", nome: "Pedido de outro serviço" },
] as const;

export type Origem = (typeof ORIGENS)[number]["id"];

export interface Pessoa {
  /** o id do documento É o email de trabalho */
  id: string;
  nome: string;
  iniciais: string;
  papel?: Papel;
  carreira?: Carreira;
  cargo?: string;
  ativo?: boolean;
  ordem?: number;
  senhaDefinida?: boolean;
  veDivisao?: boolean;
  /** ausente até esta data — sai da conta de atrasos e aparece como tal */
  ausenteAte?: Date | null;
}

/** Uma frente de trabalho. Com `dono` é pessoal; sem `dono` é da divisão. */
export interface Tarefa {
  id: string;
  nome: string;
  dono?: string | null;
  ativo?: boolean;
  ordem?: number;
}

/** Um trabalho concreto: o que se faz, quem faz, e em que fase está. */
export interface Trabalho {
  id: string;
  titulo: string;
  /** id do documento em `tarefas` — pode ficar vazio */
  tarefa: string;
  /** emails de quem faz. Uma feira ou uma visita têm quatro pessoas. */
  responsaveis: string[];
  fase: FaseId;
  peso: Peso;
  origem: Origem;
  bloqueada?: boolean;
  motivo?: string;
  /** quem está a atrasar: nem sempre é o chefe de divisão */
  esperaPor?: string;
  /** `null` = trabalho contínuo, sem data para fechar */
  prazo: Date | null;
  criadoEm?: Date;
  atualizadoEm?: Date;
  fechadoEm?: Date | null;
  /** sai de circulação no monitor, fica no histórico */
  arquivado?: boolean;
  criadoPor?: string;
}

/** Uma mudança de fase. É a peça que permite saber onde as coisas encalham,
 *  e o que mudou desde a última reunião. Sem isto, metade do quadro é cega. */
export interface Movimento {
  id: string;
  trabalho: string;
  titulo: string;
  de: FaseId | null;
  para: FaseId;
  quem: string;
  quando: Date;
}

export type FonteDados = "demo" | "firestore";
