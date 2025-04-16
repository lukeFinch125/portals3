import { playerID, database } from "./index";
import { ref, onValue, push } from "firebase/database";

export function accountView() {
  const nameContainer = document.querySelector(".nameAndID");
  const friendsContainer = document.querySelector(".friendsList");
  const addFriendsButton = document.querySelector(".addFriends");
  const eloSection = document.querySelector(".elo");
  const pastGamesContainer = document.querySelector(".pastGamesContainer");

  // Set up the add friend listener (once)
  addFriendsButton.onclick = async () => {
    const newFriendID = prompt("Enter new friend's ID:");
    await addFriend(playerID, newFriendID);
  };

  // Firebase real-time listener for the player
  const playerRef = ref(database, `players/${playerID}`);
  onValue(playerRef, (snapshot) => {
    const playerData = snapshot.val();
    if (!playerData) {
      nameContainer.textContent = "Failed to load data.";
      return;
    }

    // Clear previous contents
    nameContainer.textContent = "";
    eloSection.textContent = "";
    pastGamesContainer.textContent = "";
    friendsContainer.textContent = "";

    // Name + ID
    const [playerName, playerNumber] = nameData(playerData);
    nameContainer.appendChild(
      createP("Name: " + playerName, "nameContainerName"),
    );
    nameContainer.appendChild(
      createP("ID: " + playerNumber, "nameContainerNumber"),
    );

    // Elo and past games
    const [elo, pastGames] = gamesData(playerData);

    eloSection.textContent = "ELO: " + elo;

    if (pastGames && Object.keys(pastGames).length > 0) {
      const ul = document.createElement("ul");
      ul.classList.add("pastGamesList");

      Object.values(pastGames).forEach((game) => {
        const li = document.createElement("li");
        li.textContent = `Game ID: ${game.gameID} | Winner: ${game.winner} | Loser: ${game.loser}`;
        ul.appendChild(li);
      });

      pastGamesContainer.appendChild(ul);
    } else {
      pastGamesContainer.appendChild(createP("No past games", "pastGames"));
    }

    // Friends
    const friends = friendsData(playerData);
    if (friends && Object.keys(friends).length > 0) {
      const ul = document.createElement("ul");
      Object.values(friends).forEach((f) => {
        const li = document.createElement("li");
        li.textContent = `Friend: ${f.player1ID || f.player2ID}`;
        ul.appendChild(li);
      });
      friendsContainer.appendChild(ul);
    } else {
      friendsContainer.appendChild(createP("No friends yet", "friends"));
    }
  });
}

// Utility to create a <p> element with optional id
function createP(text, id) {
  const p = document.createElement("p");
  p.textContent = text;
  if (id) p.id = id;
  return p;
}

function nameData(playerData) {
  return [playerData.name, playerData.id];
}

function gamesData(playerData) {
  return [playerData.elo, playerData.pastgames];
}

function friendsData(playerData) {
  return playerData.friends;
}

async function addFriend(player1ID, player2ID) {
  const player1FriendsRef = ref(database, `players/${player1ID}/friends`);
  await push(player1FriendsRef, { player2ID });

  const player2FriendsRef = ref(database, `players/${player2ID}/friends`);
  await push(player2FriendsRef, { player1ID });
}
