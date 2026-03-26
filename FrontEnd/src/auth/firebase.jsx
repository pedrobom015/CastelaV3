// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyBDhZ1LkYLaO16VsMD8x9rO30_wIagNyo0",
	authDomain: "Sapp-serv-e1ca0.firebaseapp.com",
	projectId: "app-serv-e1ca0",
	storageBucket: "app-serv-e1ca0.firebasestorage.app",
	messagingSenderId: "485797772008",
	appId: "1:485797772008:web:1092edc2baae033a23675d",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
