import { Square, Board, Game } from "./gameLogic";

const game = new Game();
game.placePiece(3,3,0,6,1);
game.placePiece(4,5,0,1,0);
game.placePiece(2,5,0,1,0);
game.placePiece(2,3,0,1,0);



game.printBothBoards();
game.player2.attemptMove(game.bottomBoard.getPieceAtSquare(3,3), game.bottomBoard.getSquare(1,1));
game.printBothBoards();