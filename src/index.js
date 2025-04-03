import { Game } from "./gameLogic";
import "./index.css";
import blackBishop from "./svg/blackBishop.svg";
import blackCastle from "./svg/blackCastle.svg";
import blackKing from "./svg/blackKing.svg";
import blackKnight from "./svg/blackHorse.svg";
import blackPawn from "./svg/blackPawn.svg";
import blackQueen from "./svg/blackQueen.svg";
import blackWizard from "./svg/blackWizard.svg";
import whiteBishop from "./svg/whiteBishop.svg";
import whiteCastle from "./svg/whiteCastle.svg";
import whiteKing from "./svg/whiteKing.svg";
import whiteKnight from "./svg/whiteHorse.svg";
import whitePawn from "./svg/whitePawn.svg";
import whiteQueen from "./svg/whiteQueen.svg";
import whiteWizard from "./svg/whiteWizard.svg";

let selectedSquare = null;

const topBoardDisplay = document.querySelector(".topBoardContainer");
const bottomBoardDisplay = document.querySelector(".bottomBoardContainer");

export function createBoardDisplay(board, container) {
        // Clear any existing content
    container.innerHTML = "";
    
    // Set up CSS Grid styling
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(7, 1fr)";
    container.style.gridTemplateRows = "repeat(7, 1fr)";

    let validMoves = [];
    let validCaptures = [];
    if (selectedSquare) {
        const piece = selectedSquare.getPiece();
        if (piece) {
          [validMoves, validCaptures] = piece.validMoves();
        } else {
          // If no piece is found, clear the selected square.
          selectedSquare = null;
        }
      }


    for(let row = 0; row < 7; row++) {
        for(let col = 0; col < 7; col++) {
            const cell = document.createElement('div');
            let curSquare = board.getSquare(row,col);
            cell.square = curSquare
            cell.style.border = "1px solid #333";
            cell.style.padding = "10px";
            cell.style.textAlign = "center";
            cell.style.cursor = "pointer";
            cell.style.backgroundSize = "contain";   // or "cover" depending on your preference
            cell.style.backgroundRepeat = "no-repeat";
            cell.style.backgroundPosition = "center";

            cell.style.backgroundColor = "grey";

            if(curSquare.isPortal) {
                cell.classList.add('rainbow');
            }

            if (selectedSquare) {
                // If the square is in valid moves, highlight in green
                if (validMoves.some(move => move.x === curSquare.x && move.y === curSquare.y && move.z === curSquare.z)) {
                  cell.style.backgroundColor = "lightgreen";
                }
                // If the square is in valid captures, highlight in red (this takes precedence)
                if (validCaptures.some(move => move.x === curSquare.x && move.y === curSquare.y && move.z === curSquare.z)) {
                  cell.style.backgroundColor = "lightcoral";
                }
              }

            const piece = curSquare.getPiece();
            if (piece) {
                switch(piece.pieceNumber) {
                    case 1: // Pawn
                        cell.style.backgroundImage = piece.color === 0 
                            ? `url(${whitePawn})` 
                            : `url(${blackPawn})`;
                        break;
                    case 2: // Rook (Castle)
                        cell.style.backgroundImage = piece.color === 0 
                            ? `url(${whiteCastle})` 
                            : `url(${blackCastle})`;
                        break;
                    case 3: // bishop
                        cell.style.backgroundImage = piece.color === 0 
                            ? `url(${whiteBishop})` 
                            : `url(${blackBishop})`;
                        break;
                    case 4: // knight
                        cell.style.backgroundImage = piece.color === 0 
                            ? `url(${whiteKnight})` 
                            : `url(${blackKnight})`;
                        break;
                    case 5: // Wizard
                        cell.style.backgroundImage = piece.color === 0 
                            ? `url(${whiteWizard})` 
                            : `url(${blackWizard})`;
                        break;
                    case 6: // queen
                        cell.style.backgroundImage = piece.color === 0 
                            ? `url(${whiteQueen})` 
                            : `url(${blackQueen})`;
                        break;
                    case 7: // king
                        cell.style.backgroundImage = piece.color === 0 
                            ? `url(${whiteKing})` 
                            : `url(${blackKing})`;
                        break;
                    default:
                        break;
                }
            }
            cell.addEventListener("click", () => {
                if(!selectedSquare) {
                    if(curSquare.getPiece() && curSquare.getPiece().color === game.currentPlayer.color) {
                        selectedSquare = curSquare;
                        cell.style.backgroundColor = "yellow";
                        console.log("selected piece at:", curSquare.getInfo());
                        createBoardDisplay(board,container);
                    } else {
                        console.log("Please select your own Piece");
                    }
                } else {
                        const destinationSquare = curSquare;
                        console.log("destination selected: ", destinationSquare.getInfo());
                        game.currentPlayer.attemptMove(selectedSquare.getPiece(), destinationSquare);
                        selectedSquare = null;
                        createBoardDisplay(board, container);
                    }
            })
            container.appendChild(cell);
        }
    }
}




const game = new Game();
game.topBoard.addPortals();
game.bottomBoard.addPortals();
game.startGame();

createBoardDisplay(game.topBoard, topBoardDisplay);
createBoardDisplay(game.bottomBoard, bottomBoardDisplay);
