import { Square, Board, Game } from "./gameLogic";

const game = new Game();
game.startGame();



game.printBothBoards();
game.player1.attemptMove(game.topBoard.getPieceAtSquare(2,5), game.bottomBoard.getSquare(1,1));
game.printBothBoards();