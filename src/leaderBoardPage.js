import { ref, get } from "firebase/database";
import { database } from "./index";

const leaderBoard = document.querySelector(".leaderBoardList");

export async function leaderBoardView() {
  leaderBoard.textContent = "";

  const playersRef = ref(database, "players");
  const snapshot = await get(playersRef);

  if (!snapshot.exists()) {
    console.log("No player data found");
    return [];
  }

  const allPlayers = snapshot.val();

  const registeredPlayers = Object.values(allPlayers).filter(
    (player) => player.accountType === "registered",
  );

  const sorted = registeredPlayers.sort((a, b) => (b.elo || 0) - (a.elo || 0));

  const top25 = sorted.slice(0, 25);

  const ul = document.createElement("ul");
  ul.classList.add("leaderBoardList");

  Object.values(top25).forEach((player) => {
    const li = document.createElement("li");
    li.textContent = `Name: ${player.name} Elo: ${player.elo}`;
    ul.appendChild(li);
  });
  leaderBoard.appendChild(ul);
}
