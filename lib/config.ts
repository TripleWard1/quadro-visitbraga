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

/** Acima deste número de pessoas por cena, os cartões passam a linhas
 *  compactas. É o que faz o quadro aguentar a divisão toda a registar. */
export const LIMITE_DENSO = 6;

/** Como o quadro está a ser visto.
 *  "parede" — 55" a quatro metros, corpo grande (o uso real).
 *  "perto"  — portátil a 60 cm, corpo reduzido a 70% (para desenvolver).
 *  Alterna-se com a tecla T sem mexer no código. */
export const VISTA_PADRAO: "parede" | "perto" = "parede";

/** Afinação fina do tamanho do texto no monitor.
 *
 *  A escala está calibrada para um televisor de 55" a 1080p, lido a quatro
 *  metros — o que num portátil, a meio metro, parece enorme, e é suposto
 *  parecer. Se no monitor real ficar grande ou pequena de mais, mexe-se aqui:
 *  0.85 encolhe 15%, 1.15 aumenta 15%. Não mexer na escala em globals.css.
 *
 *  A escala é agora FIXA e compacta, como um painel normal — deixou de crescer
 *  com o tamanho do ecrã, que era o que fazia tudo ficar gigante num monitor
 *  grande. Se na parede se ler mal a quatro metros, sobe-se aqui (1.2, 1.4)
 *  ou usa-se o zoom do browser no monitor. */
export const ESCALA_MONITOR = 1;

/** Onde a equipa regista o trabalho. Aparece no rodapé do monitor — se
 *  ninguém souber o endereço, ninguém regista. */
export const ENDERECO_GESTAO = "quadro-visitbraga.vercel.app/gestao";
