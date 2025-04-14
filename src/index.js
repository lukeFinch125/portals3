// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { ref, getDatabase, set, onDisconnect, get } from "firebase/database";
import "./gameLogic.js";
import "./accountPage.js";
import { accountView } from "./accountPage.js";
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
const accountViewButton = document.getElementById('accountView');
const matchMakingViewButton = document.getElementById(`matchMaking`);
const rankingsViewButton = document.getElementById('leaderBoard');

//action listeners

accountViewButton.addEventListener("click", () => {
  switchView("account");
})

matchMakingViewButton.addEventListener("click", () => {
  switchView("waiting");
})

rankingsViewButton.addEventListener("click", () => {
  switchView("leaderBoard");
})

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
  auth.onAuthStateChanged(async (user) => {
    console.log(user);
    if (user) {
      //your logged in
      playerID = user.uid;
      currentUser = user;
      console.log(playerID);

      const playerRef = ref(database, `players/${playerID}`);

      const accountType = user.isAnonymous ? "anonymous" : "registered";

      const snapshot = await get(playerRef);
      let playerData = snapshot.exists() ? snapshot.val() : {};

      let playerName = playerData.name;

      if (
        accountType === "registered" &&
        (!playerName || playerName.trim() === "")
      ) {
        while (!playerName || playerName.trim() === "") {
          playerName = prompt("Welcome! Please enter a username: ");
        }
      }

      set(playerRef, {
        name: playerName || "Guest",
        id: playerID,
        elo: playerData.elo || 0,
        accountType: accountType,
        online: true,
        currentGame: null,
        pastGames: null,
        friends: null
      });

      onDisconnect(playerRef).update({ online: false });
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
  const account = document.querySelector(".account");
  const leaderBoard = document.querySelector(".leaderBoard");
  const navBar = document.querySelector("#navBar");

  // Hide all views and inner sections first
  lobbyView.style.display = "none";
  gameCenterView.style.display = "none";
  signIn.style.display = "none";
  signUp.style.display = "none";
  account.style.display = "none";
  leaderBoard.style.display = "none";
  navBar.style.display = "none";
  

  // Show the selected view
  switch (view) {
    case "game":
      gameCenterView.style.display = "block";
      break;
    case "waiting":
      navBar.style.display = "flex";
      lobbyView.style.display = "block";
      break;
    case "signIn":
      signIn.style.display = "block";
      break;
    case "signUp":
      signUp.style.display = "block";
      break;
    case "account":
      navBar.style.display = "flex";
      account.style.display = "block";
      accountView();
      break;
    case "leaderBoard":
      leaderBoard.style.display = "block";
      navBar.style.display = "flex";
      break;
    default:
      console.warn("Unknown view:", view);
      break;
  }
}
