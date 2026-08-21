/** Logótipo mostrado no cabeçalho. */
export const LOGO = "https://i.imgur.com/Yakcz6G.png";

/** `true` assenta o logótipo numa chapa escura — só é preciso se o ficheiro
 *  do logótipo for branco. Em fundo de papel, o normal é `false`. */
export const LOGO_EM_CHAPA_CLARA = false;

/** Milissegundos que cada ecrã fica visível antes de rodar. */
export const ROTACAO_MS = 16000;

/** Cartões por ecrã — só entram nesta conta as pessoas COM trabalho aberto.
 *  A grelha escolhe o número de colunas conforme quantos cartões há, para não
 *  deixar três quartos do monitor em branco. */
export const PESSOAS_POR_PAGINA = 8;

/** Quantos dias à frente entram no painel "Entra a seguir". */
export const HORIZONTE_DIAS = 3;

export const TITULO = "Quadro da Divisão";
export const SUBTITULO = "Atividades Económicas e Turismo · Município de Braga";

export const DOMINIO_PERMITIDO =
  process.env.NEXT_PUBLIC_DOMINIO_PERMITIDO ?? "cm-braga.pt";

/** Palavra-passe da primeira entrada. Quem entra com ela é obrigado a
 *  escolher outra antes de chegar ao quadro. */
export const PALAVRA_PASSE_INICIAL = "123456";

/** Mínimo exigido pelo Firebase. */
export const MINIMO_PALAVRA_PASSE = 6;

/** Email do chefe de divisão. Tem de coincidir com o que está escrito em
 *  firestore.rules — aqui manda no que se vê, lá manda no que se pode fazer. */
export const EMAIL_CHEFE = "luis.ferreira@cm-braga.pt";
