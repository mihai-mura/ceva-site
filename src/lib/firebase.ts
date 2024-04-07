// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyClqmaNFpUzuZMwdnfvM84lQ0jk0p7Ldr4",
	authDomain: "ceva-site-7b8fc.firebaseapp.com",
	projectId: "ceva-site-7b8fc",
	storageBucket: "ceva-site-7b8fc.appspot.com",
	messagingSenderId: "638986913429",
	appId: "1:638986913429:web:13ec5135862c51f15abd9c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
