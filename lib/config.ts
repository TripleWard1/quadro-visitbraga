/** Logótipo mostrado no cabeçalho. */
export const LOGO = "https://i.imgur.com/Yakcz6G.png";

/** `true` assenta o logótipo numa chapa clara (para logótipos escuros).
 *  Põe `false` se o ficheiro for branco ou muito claro. */
export const LOGO_EM_CHAPA_CLARA = true;

/** Milissegundos que cada ecrã fica visível antes de rodar. */
export const ROTACAO_MS = 22000;

/** Cartões de pessoa por ecrã. Com 14 pessoas, 7 dá dois ecrãs certinhos.
 *  As páginas são equilibradas: 15 pessoas dariam 5+5+5, não 7+7+1. */
export const PESSOAS_POR_PAGINA = 7;

/** Colunas da grelha de pessoas. 4 colunas × 2 linhas comporta 7 cartões. */
export const COLUNAS_GRELHA = 4;

/** Quantos dias à frente entram no painel "Entra a seguir". */
export const HORIZONTE_DIAS = 3;

export const TITULO = "Quadro da Divisão";
export const SUBTITULO = "Atividades Económicas e Turismo · Município de Braga";

export const DOMINIO_PERMITIDO =
  process.env.NEXT_PUBLIC_DOMINIO_PERMITIDO ?? "cm-braga.pt";
