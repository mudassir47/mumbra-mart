// lib/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { getDatabase, ref, get, set, push, update } from 'firebase/database'
import { getStorage } from 'firebase/storage'

// Your Firebase configuration (ensure these are stored securely, e.g., in environment variables)
const firebaseConfig = {
    apiKey: "AIzaSyCJxcfU-1AUegxzKph5poBgVwszRvxOARw",
    authDomain: "mumbramart-4d8eb.firebaseapp.com",
    databaseURL: "https://mumbramart-4d8eb-default-rtdb.firebaseio.com",
    projectId: "mumbramart-4d8eb",
    storageBucket: "mumbramart-4d8eb.appspot.com",
    messagingSenderId: "45169334210",
    appId: "1:45169334210:web:f65930674e27927ac3285b",
    measurementId: "G-T1N7TP32S1"
}

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const database = getDatabase(app)
const storage = getStorage(app) // Initialize Firebase Storage

export { auth, provider, signInWithPopup, database, ref, get, set, push, update, storage }
