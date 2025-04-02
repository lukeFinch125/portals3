import { Square, Board, Game } from "./gameLogic";

const game = new Game();
console.log(game.topBoard.boardArray);
game.printBothBoards();
game.placePiece(0,6,0,1,1);
game.placePiece(0,5,0,1,0);
game.placePiece(1,6,0,1,0);
game.placePiece(1,5,0,1,0);

game.printBothBoards();
game.player2.attemptMove(game.bottomBoard.getPieceAtSquare(0,6), game.bottomBoard.getSquare(0,5));
game.printBothBoards();