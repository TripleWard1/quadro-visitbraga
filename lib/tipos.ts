export type FaseId = "aceite" | "curso" | "revisao" | "aprovacao" | "entregue";

export type Estado = "normal" | "hoje" | "atrasada" | "bloqueada" | "entregue" | "livre";

export interface Pessoa {
  id: string;
  nome: string;
  iniciais: string;
  ativo?: boolean;
  ordem?: number;
  /** conta Google que esta pessoa usa em /gestao — preenchida na primeira entrada */
  email?: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  projeto: string;
  /** id do documento em `pessoas` */
  responsavel: string;
  fase: FaseId;
  /** parada por causa externa — independente da fase */
  bloqueada?: boolean;
  motivo?: string;
  prazo: Date;
  atualizadoEm?: Date;
  criadaPor?: string;
}

export type FonteDados = "demo" | "firestore";
