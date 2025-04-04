// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously,  } from "firebase/auth";
import { ref, getDatabase, set, onDisconnect, remove, onValue, push } from "firebase/database";
import { Game, Player } from "./gameLogic.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let playerID = null;

const matchmakingButton = document.getElementById("matchmakingButton");
const statusMessage = document.getElementById("statusMessage");
const lobbyView = document.getElementById("lobbyView");
const gameCenterView = document.getElementById("gameCenterView");

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

matchmakingButton.addEventListener("click", () => {
    if(!playerID) {
        statusMessage.textContent = "Still signing in...";
        return;
    }
    const waitingRoomRef = ref(database, `waitingRoom/${playerID}`);
    set(waitingRoomRef, {
        playerID,
        joined: Date.now()
    })
        .then(() => {
            statusMessage.textContent = "You are in waiting room. Waiting for an opponent...";
            console.log("Added to waiting room");
        })
        .catch((error) => {
            console.log("Error joining waiting room: ", error);
        });
});

const waitingRoomListRef = ref(database, "waitingRoom");
onValue(waitingRoomListRef, (snapshot) => {
    const waitingPlayers = snapshot.val();
    if (!waitingPlayers) return;

    const playerIDs = Object.keys(waitingPlayers);
    console.log("Current waiting players: ", playerIDs);

    if(playerIDs.length >= 2) {
        const [player1, player2] = playerIDs;

        const newGameRef = push(ref(database, "games"));
        set(newGameRef, {
            players: {
                [player1]: waitingPlayers[player1],
                [player2]: waitingPlayers[player2]
            },
            status: "waiting"
        }).then(() => {
            remove(ref(database, `waitingRoom/${player1}`));
            remove(ref(database, `waitingRoom/${player2}`));

            if(playerID === player1 || playerID === player2) {
                statusMessage.textContent = "Match found! Starting game...";

                setTimeout(() => {
                    lobbyView.style.display = "none";
                    gameCenterView.style.display = "block";

                    switchView("game");
                    requestAnimationFrame(() => {
                    initiateGame(newGameRef.key, player1, player2);
                    });
                }, 1000);
            }
        });
    }
});

/**
 * Switches the visible view.
 * @param {string} view - The view to switch to. Either "game" or "waiting".
 */
function switchView(view) {
    const lobbyView = document.getElementById("lobbyView");
    const gameCenterView = document.getElementById("gameCenterView");
  
    if (view === "game") {
      lobbyView.style.display = "none";
      gameCenterView.style.display = "block";
    } else if (view === "waiting") {
      gameCenterView.style.display = "none";
      lobbyView.style.display = "block";
    }
  }

function initiateGame(gameID, player1, player2) {
    let newGame = new Game(player1, player2);

    console.log(`Game ${gameID} inititated with players: ${player1} and ${player2}`);
    newGame.startGame();
    return newGame;
}