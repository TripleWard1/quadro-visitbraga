/** Configuração do projeto Firebase `quadro-visitbraga`.
 *
 *  Estas chaves são públicas por natureza — vão no bundle de qualquer app web
 *  com Firebase. Quem protege os dados são as regras do Firestore
 *  (ver `firestore.rules`), não o segredo da chave.
 *
 *  As variáveis de ambiente, se existirem, ganham — dá jeito para apontar a
 *  app a um projeto de testes sem tocar no código. */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY ?? "AIzaSyDVTCFUbVyQ08YNH2pzIn49pFHtFGMuSmk",
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN ?? "quadro-visitbraga.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID ?? "quadro-visitbraga",
  storageBucket:
    process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET ?? "quadro-visitbraga.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FB_SENDER_ID ?? "276616793465",
  appId: process.env.NEXT_PUBLIC_FB_APP_ID ?? "1:276616793465:web:c2ee596f7e575f049873a8",
};

export const firebaseConfigurado = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
