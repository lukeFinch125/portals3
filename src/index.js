import { Square, Board, Game } from "./gameLogic";

const game = new Game();
game.startGame();
game.topBoard.addPortals();
game.bottomBoard.addPortals();
game.placePiece(3,3,0,3,0);



game.printBothBoards();
game.player1.attemptMove(game.bottomBoard.getPieceAtSquare(3,3), game.bottomBoard.getSquare(1,1));
console.log(game.bottomBoard.getPieceAtSquare(1,1));
console.log(game.topBoard.getPieceAtSquare(1,1));
game.printBothBoards();