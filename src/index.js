import { Square, Board, Game } from "./gameLogic";

const game = new Game();
console.log(game.topBoard.boardArray);
game.printBothBoards();
game.placePiece(0,0,0,1,0);
game.placePiece(0,1,1,1,1);
game.printBothBoards();
game.player1.attemptMove(game.bottomBoard.getPieceAtSquare(0,0), game.bottomBoard.getSquare(1,0));
game.printBothBoards();