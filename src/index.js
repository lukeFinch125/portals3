import { Game } from "./gameLogic";

import "./index.css";

const topBoardDisplay = document.querySelector(".topBoardContainer");
const bottomBoardDisplay = document.querySelector(".bottomBoardContainer");

const game = new Game();
game.topBoard.addPortals();
game.bottomBoard.addPortals();
game.startGame();

game.createBoardDisplay(game.topBoard, topBoardDisplay);
game.createBoardDisplay(game.bottomBoard, bottomBoardDisplay);
