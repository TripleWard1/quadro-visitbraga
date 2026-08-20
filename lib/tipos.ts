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

export interface Pessoa {
  /** o id do documento É o email de trabalho — assim as regras do Firestore
   *  sabem quem está a escrever sem terem de andar à procura */
  id: string;
  nome: string;
  iniciais: string;
  papel?: Papel;
  ativo?: boolean;
  ordem?: number;
  /** `false` enquanto ainda anda com a palavra-passe da primeira entrada */
  senhaDefinida?: boolean;
  /** vê o separador com o trabalho de toda a divisão */
  veDivisao?: boolean;
}

/** Uma frente de trabalho.
 *
 *  Com `dono` preenchido é pessoal: só aparece a quem a criou. Sem `dono` é da
 *  divisão, aparece a toda a gente — e só o chefe de divisão as cria. */
export interface Tarefa {
  id: string;
  nome: string;
  dono?: string | null;
  ativo?: boolean;
  ordem?: number;
}

/** Um trabalho concreto: o que uma pessoa está a fazer, e em que fase. */
export interface Trabalho {
  id: string;
  titulo: string;
  /** id do documento em `tarefas` — pode ficar vazio */
  tarefa: string;
  /** email de quem faz — em `pessoas` é o id do documento */
  responsavel: string;
  fase: FaseId;
  /** parada por causa externa — independente da fase */
  bloqueada?: boolean;
  motivo?: string;
  /** `null` = trabalho contínuo, sem data para fechar */
  prazo: Date | null;
  atualizadoEm?: Date;
  criadoPor?: string;
}

export type FonteDados = "demo" | "firestore";
