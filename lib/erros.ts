/** Os códigos do Firebase em português, para ninguém ficar a olhar para
 *  `auth/invalid-credential` sem saber o que fazer. */
export function traduzirErro(e: any): string {
  switch (e?.code) {
    case "auth/operation-not-allowed":
      return "Falta ativar Email/Password em Authentication → Sign-in method, na consola do Firebase.";
    case "auth/invalid-email":
      return "Esse email não parece válido.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email ou palavra-passe errados.";
    case "auth/weak-password":
      return "A palavra-passe tem de ter pelo menos 6 caracteres.";
    case "auth/requires-recent-login":
      return "Por segurança, confirma a palavra-passe atual.";
    case "auth/too-many-requests":
      return "Demasiadas tentativas. Espera uns minutos.";
    case "auth/network-request-failed":
      return "Sem ligação ao Firebase.";
    case "permission-denied":
      return "As regras do Firestore recusaram esta alteração.";
    default:
      return e?.message ?? "Alguma coisa correu mal.";
  }
}
