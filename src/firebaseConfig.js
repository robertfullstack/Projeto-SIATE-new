// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    // apiKey: "AIzaSyAaQ2F9uGHm_Z6jnahYeOjxnEgDqlXbeZg",
    // authDomain: "tec-serv-468b7.firebaseapp.com",
    // databaseURL: "https://tec-serv-468b7-default-rtdb.firebaseio.com", // ✅ CORRETO
    // projectId: "tec-serv-468b7",
    // storageBucket: "tec-serv-468b7.appspot.com",
    // messagingSenderId: "577413763329",
    // appId: "1:577413763329:web:3709be19efba59de7b0b00"

    apiKey: "AIzaSyBi-Q0-lPCynqSiK3DtzJfIbKsagTy2lwA",
    authDomain: "siate-aea-df-96eb3.firebaseapp.com",
    projectId: "siate-aea-df-96eb3",
    storageBucket: "siate-aea-df-96eb3.firebasestorage.app",
    messagingSenderId: "570286517946",
    appId: "1:570286517946:web:b2636b5ec9e8cd9d8c1c83"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
