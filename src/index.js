// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously,  } from "firebase/auth";
import { ref, getDatabase, set, onDisconnect, remove, onValue, push } from "firebase/database";
import { Game, Player } from "./gameLogic.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmZof3RV_jymfGMjv_QQKaSS6w9Agb1nA",
  authDomain: "portalsmultiplayer.firebaseapp.com",
  databaseURL: "https://portalsmultiplayer-default-rtdb.firebaseio.com",
  projectId: "portalsmultiplayer",
  storageBucket: "portalsmultiplayer.firebasestorage.app",
  messagingSenderId: "787412223391",
  appId: "1:787412223391:web:3c82a46004603c94f1a9aa"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

const lobbyView = document.getElementById("lobbyView");
const gameCenterView = document.getElementById("gameCenterView");
const portalsTitle = document.querySelector("#portalsTitle");

export let playerID;

signInAnonymously(auth)
.then(() => {
    console.log("Signed in anonymously");
})
.catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode, errorMessage);
});

auth.onAuthStateChanged((user) => {
    console.log(user);
    if(user) {
        //your logged in
        playerID = user.uid;
        console.log(playerID);
        const playerRef = ref(database, `players/${playerID}`);
        console.log(playerRef);

        set(playerRef, {
            name: "Luke",
            id: playerID,
            elo: 0
        })

        onDisconnect(playerRef).remove();

    } else {
        console.log("User is signed out.");
    }
});

import portalsLogo from './png/portalsLogo.png';

const img = document.createElement("img");
img.src = portalsLogo;
img.alt = "Portals Logo";

document.getElementById("PortalsTitle").appendChild(img);

