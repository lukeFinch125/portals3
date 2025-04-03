import { Game } from "./gameLogic";

const topBoard = document.querySelector(".topBoard");
const bottomBoard = document.querySelector(".bottomBoard");


const game = new Game();
game.topBoard.addPortals();
game.bottomBoard.addPortals();
game.startGame();

