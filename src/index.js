// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { ref, getDatabase, set, onDisconnect } from "firebase/database";
import "./gameLogic.js";
import portalsLogo from "./png/portalsLogo.png";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmZof3RV_jymfGMjv_QQKaSS6w9Agb1nA",
  authDomain: "portalsmultiplayer.firebaseapp.com",
  databaseURL: "https://portalsmultiplayer-default-rtdb.firebaseio.com",
  projectId: "portalsmultiplayer",
  storageBucket: "portalsmultiplayer.firebasestorage.app",
  messagingSenderId: "787412223391",
  appId: "1:787412223391:web:3c82a46004603c94f1a9aa",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export let playerID;
export let currentUser;

document.addEventListener("DOMContentLoaded", () => {
  lobbyFormat();
});

//buttons
const signUpButton = document.getElementById(`signUp`);
const resetPassword = document.getElementById(`resetPassword`);
const signInForm = document.getElementById(`signInForm`);
const signUpForm = document.getElementById(`signUpForm`);
const guestLogins = document.getElementsByClassName("guestLogin");
const signInButton = document.getElementById(`signIn`);

//action listeners

resetPassword.addEventListener("click", () => {
  const email = prompt("Enter email to reset password");
  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Password reset email sent!");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode + errorMessage);
      alert("Could not send email!");
    });
});

signInButton.addEventListener("click", () => {
  switchView("signIn");
});

signUpButton.addEventListener("click", () => {
  switchView("signUp");
});

signInForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById(`signInEmail`).value;
  const password = document.getElementById(`signInPassword`).value;
  handleSignInDataBase(email, password);
});

signUpForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById(`signUpEmail`).value;
  const password = document.getElementById(`signUpPassword`).value;
  handleSignUp(email, password);
});

for (let i = 0; i < guestLogins.length; i++) {
  guestLogins[i].addEventListener("click", () => {
    anonymousSignIn();
    alert("sign in as guest");
    switchView("waiting");
  });
}
//general authentication functions

function handleSignInDataBase(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      alert("Successful signIn");
      switchView("waiting");
      setupAuthListener();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode + errorMessage);
      alert("Invalid sign In");
    });
}

function handleSignUp(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      alert("successful signUp");
      switchView("signIn");
      setupAuthListener();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode + errorMessage);
      alert("Could not sign up, look at console");
    });
}

function setupAuthListener() {
  auth.onAuthStateChanged((user) => {
    console.log(user);
    if (user) {
      //your logged in
      playerID = user.uid;
      console.log(playerID);
      const playerRef = ref(database, `anonymousPlayers/${playerID}`);
      console.log(playerRef);

      set(playerRef, {
        name: "Luke",
        id: playerID,
        elo: 0,
      });

      onDisconnect(playerRef).remove();
    } else {
      console.log("User is signed out.");
    }
  });
}

function anonymousSignIn() {
  signInAnonymously(auth)
    .then(() => {
      console.log("Signed in anonymously");
      setupAuthListener();
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
}

function lobbyFormat() {
  const img = document.createElement("img");
  img.src = portalsLogo;
  img.alt = "Portals Logo";

  document.getElementById("PortalsTitle").appendChild(img);
}

export function switchView(view) {
  const lobbyView = document.getElementById("lobbyView");
  const gameCenterView = document.getElementById("gameCenterView");
  const signIn = document.querySelector(".signIn");
  const signUp = document.querySelector(".signUp");

  // Hide all views and inner sections first
  lobbyView.style.display = "none";
  gameCenterView.style.display = "none";
  signIn.style.display = "none";
  signUp.style.display = "none";

  // Show the selected view
  switch (view) {
    case "game":
      gameCenterView.style.display = "block";
      break;
    case "waiting":
      lobbyView.style.display = "block";
      break;
    case "signIn":
      signIn.style.display = "block";
      break;
    case "signUp":
      signUp.style.display = "block";
      break;
    default:
      console.warn("Unknown view:", view);
      break;
  }
}
