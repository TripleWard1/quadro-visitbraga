import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { firebaseConfig, firebaseConfigurado } from "./firebaseConfig";

export { firebaseConfigurado };

function app() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getDb(): Firestore | null {
  return firebaseConfigurado ? getFirestore(app()) : null;
}

export function getAuthCliente(): Auth | null {
  return firebaseConfigurado ? getAuth(app()) : null;
}
