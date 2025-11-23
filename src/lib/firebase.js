import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Substitua com suas configurações do Firebase
// Você pode obter essas informações no Console do Firebase > Configurações do Projeto
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCGNYZOger_JooCTKOPaJ4e-5C9oxvhP_o",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cronicas-carmesin-v1.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cronicas-carmesin-v1",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cronicas-carmesin-v1.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "691290276613",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:691290276613:web:377fbedf692c1217e96d6c"
};

console.log("Firebase Config Project ID:", firebaseConfig.projectId);
console.log("Using custom env vars:", !!import.meta.env.VITE_FIREBASE_PROJECT_ID);

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Erro ao definir persistência de autenticação:", error);
});

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)";
console.log(`[firebase] Initializing Firestore with databaseId: ${databaseId}`);
export const db = getFirestore(app, databaseId);
