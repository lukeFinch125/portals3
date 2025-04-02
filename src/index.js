import { Square, Board, Game } from "./gameLogic";

const game = new Game();
console.log(game.topBoard.boardArray);
game.printBothBoards();
game.placePiece(3,3,0,1,1);
game.printBothBoards();
game.player2.attemptMove(game.bottomBoard.getPieceAtSquare(3,3), game.bottomBoard.getSquare(4,2));
game.printBothBoards();