import { Piece, Pawn, Castle, Bishop, Knight, Queen, King, Wizard } from "./pieceLogic.js";

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

const topBoardDisplay = document.querySelector(".topBoardContainer");
const bottomBoardDisplay = document.querySelector(".bottomBoardContainer");
const log = document.querySelector(".log");

// Save a reference to the original console.log
const originalConsoleLog = console.log;

// Get reference to the div
const logDiv = document.querySelector(".log");

// Override console.log
console.log = function(...args) {
  // Call the original console.log to still log to the browser console
  originalConsoleLog.apply(console, args);
  
  // Format the message (join the args with a space)
  const message = args.join(" ");
  
  // Create a new paragraph element for this message
  const p = document.createElement("p");
  p.textContent = message;
  
  // Append the paragraph to the log div
  logDiv.appendChild(p);
  
  // Optionally, scroll to the bottom of the div
  logDiv.scrollTop = logDiv.scrollHeight;
};

export class Square {
    constructor(x, y, z, board) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.board = board;
        this.pieceOnSquare = 0;
        this.isPortal = false;
        this.portalisActive = false;
    }

    /*piece on square logic:
    0 = none
    1 = pawn
    2 = castle
    3 = bishop
    4 = knight
    5 = wizard
    6 = queen
    7 = king
    */

    getPortal() {
        return this.isPortal;
    }

    getBoard() {
        return this.board;
    }

    getPiece() {
        return this.pieceOnSquare;
    }

    pieceEntry(piece) {
        this.pieceOnSquare = piece;
    }

    pieceExit() {
        this.pieceOnSquare = 0;
    }

    getInfo() {
        const pieceInfo = (this.pieceOnSquare && typeof this.pieceOnSquare === "object")
            ? this.pieceOnSquare.pieceNumber
            : this.pieceOnSquare;
        return `x: ${this.x} y: ${this.y} z: ${this.z} piece: ${pieceInfo}`;
    }

    getInfoForBoard() {
        if (this.getPortal() && this.pieceOnSquare && typeof this.pieceOnSquare === "object" && typeof this.pieceOnSquare.getInfoForBoardUI === "function") {
            return `<span class="portal-piece">${this.pieceOnSquare.getInfoForBoardUI()}</span>`;
        } else if (this.getPortal()) {
            return `<span class="portal">0</span>`;
        }
        
        if (this.pieceOnSquare && typeof this.pieceOnSquare === "object" && typeof this.pieceOnSquare.getInfoForBoardUI === "function") {
            return this.pieceOnSquare.getInfoForBoardUI();
        }
        return `${this.pieceOnSquare}`;
    }        
}

export class Board {
    constructor(z, game) {
        this.z = z;
        this.game = game;
        //z = 0; board is on the bottom, SW contains white troops
        //z = 1; board is on the top, SW contains black troops
        const rows = 7;
        const cols = 7;
        this.boardArray = Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) =>
                new Square(row, col, z, this)
            )
        );
    }

    getGame() {
        return this.game;
    }

    addPortals() {
        this.boardArray[1][1].isPortal = true;
        this.boardArray[1][1].portalisActive = true;
        this.boardArray[5][5].isPortal = true;
        this.boardArray[5][5].portalisActive = true;

    }

    getSquare(x,y) {
        if (x < 0 || x >= this.boardArray.length || y < 0 || y >= this.boardArray[0].length) {
            return undefined;
        }
        return this.boardArray[x][y];
    }

    getPieceAtSquare(x,y) {
        return this.getSquare(x,y).getPiece();
    }

    printBoardNice() {
        let toReturn = "";
        for(let row = 0; row < this.boardArray.length; row++) {
            let tempRow = "";
            for(let column = 0; column < this.boardArray[row].length; column++) {
                tempRow += ` ${this.getSquare(row, column).getInfoForBoard()}`;
            }
            toReturn += tempRow;
            toReturn += '\n';
        }
        return toReturn;
    }
}

export class Game {
    constructor() {
        this.topBoard = new Board(1, this); //SW contains black troops
        this.bottomBoard = new Board(0, this); //SW contains white troops
        this.capturedPieces = [];
        this.player1 = new Player("Luke", 0);
        this.player2 = new Player("Aaron", 1);
        this.currentPlayer = this.player1;
        this.gameActive = true;
        this.selectedSquare = null;
    }


    printBothBoards() {
        console.log("top board: ");
        console.log(this.topBoard.printBoardNice());
        console.log("bottom board: ");
        console.log(this.bottomBoard.printBoardNice());
    }

    createBoardDisplay(board, container) {
            // Clear any existing content
        container.innerHTML = "";
        
        // Set up CSS Grid styling
        container.style.display = "grid";
        container.style.gridTemplateColumns = "repeat(7, 1fr)";
        container.style.gridTemplateRows = "repeat(7, 1fr)";

        let validMoves = [];
        let validCaptures = [];
        if (this.selectedSquare) {
            const piece = this.selectedSquare.getPiece();
            if (piece) {
                [validMoves, validCaptures] = piece.validMoves();
            } else {
                // If no piece is found, clear the selected square.
                this.selectedSquare = null;
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

                if (this.selectedSquare) {
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
                    if(!this.selectedSquare) {
                        if(curSquare.getPiece() && curSquare.getPiece().color === this.currentPlayer.color) {
                            this.selectedSquare = curSquare;
                            cell.style.backgroundColor = "yellow";
                            console.log("selected piece at:", curSquare.getInfo());
                            this.createBoardDisplay(board,container);
                        } else {
                            console.log("Please select your own Piece");
                        }
                    } else {
                            const destinationSquare = curSquare;
                            console.log("destination selected: ", destinationSquare.getInfo());
                            this.currentPlayer.attemptMove(this.selectedSquare.getPiece(), destinationSquare);
                            this.selectedSquare = null;
                            this.createBoardDisplay(board, container);
                        }
                })
                container.appendChild(cell);
            }
        }
    }


    startGame() {
        console.log("Game starting");

        //place pawns
        this.placePiece(6,3,0,1,0);
        this.placePiece(5,2,0,1,0);
        this.placePiece(4,1,0,1,0);
        this.placePiece(3,0,0,1,0);

        this.placePiece(0,3,0,1,1);
        this.placePiece(1,4,0,1,1);
        this.placePiece(2,5,0,1,1);
        this.placePiece(3,6,0,1,1);

        this.placePiece(6,3,1,1,1);
        this.placePiece(5,2,1,1,1);
        this.placePiece(4,1,1,1,1);
        this.placePiece(3,0,1,1,1);
        
        this.placePiece(0,3,1,1,0);
        this.placePiece(1,4,1,1,0);
        this.placePiece(2,5,1,1,0);
        this.placePiece(3,6,1,1,0);

        //place kings
        this.placePiece(6,0,0,7,0);
        this.placePiece(0,6,1,7,0);
        this.placePiece(0,6,0,7,1);
        this.placePiece(6,0,1,7,1);

        //place queens
        this.placePiece(0,5,1,6,0);
        this.placePiece(5,0,0,6,0);
        this.placePiece(5,0,1,6,1);
        this.placePiece(0,5,0,6,1);

        //places bishops
        this.placePiece(1,6,1,3,0);
        this.placePiece(6,1,0,3,0);
        this.placePiece(6,1,1,3,1);
        this.placePiece(1,6,0,3,1);

        //places castle
        this.placePiece(1,5,1,2,0);
        this.placePiece(5,1,0,2,0);
        this.placePiece(5,1,1,2,1);
        this.placePiece(1,5,0,2,1);

        //places knights
        this.placePiece(0,4,1,4,0);
        this.placePiece(4,0,0,4,0);
        this.placePiece(4,0,1,4,1);
        this.placePiece(0,4,0,4,1);

        //place Wizards
        this.placePiece(6,2,0,5,0);
        this.placePiece(2,6,0,5,1);
        this.placePiece(6,2,1,5,1);
        this.placePiece(2,6,1,5,0);

    }
    
    placePiece(x,y,z,piece, color) {
        let curBoard = this.topBoard;
        if(z === 0) {
            curBoard = this.bottomBoard;
        }
        if(piece == 1) {
            this.pieceToPlace = new Pawn(curBoard.getSquare(x,y), color);
        } else if (piece == 2) {
            this.pieceToPlace = new Castle(curBoard.getSquare(x,y), color);
        } else if (piece == 3) {
            this.pieceToPlace = new Bishop(curBoard.getSquare(x,y), color);
        } else if (piece == 4) {
            this.pieceToPlace = new Knight(curBoard.getSquare(x,y), color);
        } else if (piece == 6) {
            this.pieceToPlace = new Queen(curBoard.getSquare(x,y), color);
        } else if (piece == 7) {
            this.pieceToPlace = new King(curBoard.getSquare(x,y), color);
        } else if (piece == 5) {
            this.pieceToPlace = new Wizard(curBoard.getSquare(x,y), color);
        }
        curBoard.getSquare(x,y).pieceEntry(this.pieceToPlace);
        console.log(`${this.pieceToPlace.printPiece()} placed at ${x},${y},${z}`);
    }

    checkKingCapture() {
        // Filter the captured pieces to only include kings (pieceNumber 7)
        const capturedKings = this.capturedPieces.filter(piece => piece.pieceNumber === 7);
        
        // Count kings by color
        const kingCountByColor = { white: 0, black: 0 };
        capturedKings.forEach(king => {
            if (king.color === 0) {
                kingCountByColor.white++;
            } else if (king.color === 1) {
                kingCountByColor.black++;
            }
        });
        
        // Check if either side has lost both kings
        if (kingCountByColor.white >= 2) {
            console.log("White's kings have been captured. Black wins!");
            this.gameActive = false;
            return { winner: "black", reason: "White's two kings captured" };
        } else if (kingCountByColor.black >= 2) {
            console.log("Black's kings have been captured. White wins!");
            this.gameActive = false;
            return { winner: "white", reason: "Black's two kings captured" };
        } else {
            console.log("The game continues. Not enough kings captured.");
            this.gameActive = true;
        }
    }

    checkPortalActivation() {
        // Assume boards are 7x7 and portal pairs share the same (x, y) coordinates.
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 7; j++) {
            let bottomSquare = this.bottomBoard.getSquare(i, j);
            let topSquare = this.topBoard.getSquare(i, j);
            
            // Process only if both squares are portals.
            if (bottomSquare.isPortal && topSquare.isPortal) {
              let wizardFoundBottom = false;
              let wizardFoundTop = false;
      
              // Check for a wizard within radius 2 in the bottom board for bottomSquare.
              for (let x = bottomSquare.x - 2; x <= bottomSquare.x + 2; x++) {
                for (let y = bottomSquare.y - 2; y <= bottomSquare.y + 2; y++) {
                  let neighbor = this.bottomBoard.getSquare(x, y);
                  if (neighbor) {
                    let piece = neighbor.getPiece();
                    if (piece && piece.pieceNumber === 5) { // 5 indicates a wizard.
                      wizardFoundBottom = true;
                      break;
                    }
                  }
                }
                if (wizardFoundBottom) break;
              }
      
              // Check for a wizard within radius 2 in the top board for topSquare.
              for (let x = topSquare.x - 2; x <= topSquare.x + 2; x++) {
                for (let y = topSquare.y - 2; y <= topSquare.y + 2; y++) {
                  let neighbor = this.topBoard.getSquare(x, y);
                  if (neighbor) {
                    let piece = neighbor.getPiece();
                    if (piece && piece.pieceNumber === 5) {
                      wizardFoundTop = true;
                      break;
                    }
                  }
                }
                if (wizardFoundTop) break;
              }
      
              // If a wizard is found near either portal, both portal squares become inactive.
              if (wizardFoundBottom || wizardFoundTop) {
                bottomSquare.portalisActive = false;
                topSquare.portalisActive = false;
              } else {
                // Otherwise, set both portals active.
                bottomSquare.portalisActive = true;
                topSquare.portalisActive = true;
              }
            }
          }
        }
      }
}      

export class Player {
    constructor(name, color) {
        this.name = name;
        this.pieces = [];
        this.color = color;
    }

    attemptMove(selectedPiece, newLocation) {
        console.log(`attempt move to: ${newLocation.getInfo()}`);
        if(selectedPiece.color !== this.color) {
            console.log("Please select your piece");
            return;
        }
        const [moves, captures] = selectedPiece.validMoves();

        const isValidMove = moves.some(
            (move) => move.x === newLocation.x && move.y === newLocation.y && move.z === newLocation.z
          );

        const isValidCapture = captures.some(
            (move) => move.x === newLocation.x && move.y === newLocation.y && move.z === newLocation.z
        );
          
          if (isValidMove) {
            this.moveAction(selectedPiece, newLocation);
          } else if(isValidCapture) {
            this.captureAction(selectedPiece, newLocation);
          } else {
            console.log("not a valid move or capture");
          }      
    }

    moveAction(selectedPiece, newLocation) {
        let moveSucceeded = false;
        let curGame = selectedPiece.curLocation.getBoard().getGame();
        curGame.checkPortalActivation();
        // Check if the destination is a portal
        if(newLocation.getPortal()) {
            // Prevent kings (pieceNumber 7), knights (pieceNumber 4), and wizards (pieceNumber 5) from going through portals.
            if ([7, 4, 5].includes(selectedPiece.pieceNumber)) {
                console.log(`${selectedPiece.printPiece()} cannot go through portals.`);
                return;
            }
            // Only try the portal move if it's active.
            if(newLocation.portalisActive) {
                this.movePortalAction(selectedPiece, newLocation);
                moveSucceeded = true;
            } else {
                console.log("Portal is not active. Try again");
                return;
            }
        } else {
            // Normal move if not a portal square
            selectedPiece.curLocation.pieceExit();
            selectedPiece.curLocation = newLocation;
            newLocation.pieceEntry(selectedPiece);
            console.log(`moved to: ${newLocation.getInfo()}`);
            moveSucceeded = true;
        }
        
        if(moveSucceeded) {
            curGame.currentPlayer = curGame.currentPlayer === curGame.player1 ? curGame.player2 : curGame.player1;
        }
    }
    

    captureAction(selectedPiece, newLocation) {
        let curGame = selectedPiece.curLocation.getBoard().getGame();
        if(newLocation.getPortal()) {
            curGame.checkPortalActivation();
            // Prevent kings, knights, and wizards from capturing through portals.
            if ([7, 4, 5].includes(selectedPiece.pieceNumber)) {
                console.log(`${selectedPiece.printPiece()} cannot capture through portals.`);
                return;
            }
            this.capturePortalAction(selectedPiece, newLocation);
        } else {
            selectedPiece.curLocation.pieceExit();
            let pieceCaptured = newLocation.getPiece();
            pieceCaptured.pieceCaptured();
            selectedPiece.curLocation = newLocation;
            newLocation.pieceEntry(selectedPiece);
            console.log(`${selectedPiece.printPiece()} captured ${pieceCaptured.printPiece()}`);
        }
        curGame.currentPlayer = curGame.currentPlayer === curGame.player1 ? curGame.player2 : curGame.player1;
    }
    

    movePortalAction(selectedPiece, newLocation) {
        let curGame = selectedPiece.curLocation.getBoard().getGame();
        curGame.checkPortalActivation();
        console.log("Portal entered");
        selectedPiece.curLocation.pieceExit();
        let newX = newLocation.x;
        let newY = newLocation.y;
        if(newLocation.z == 0) {
            let newBoard = newLocation.getBoard().getGame().topBoard;
            newLocation = newBoard.getSquare(newX, newY);
        } else {
            let newBoard = newLocation.getBoard().getGame().bottomBoard;
            newLocation = newBoard.getSquare(newX, newY);
        }
        if(newLocation.getPiece() != 0) {
            console.log("Killing piece on other side of portal");
            let pieceCaptured = newLocation.getPiece();
            pieceCaptured.pieceCaptured();
            selectedPiece.curLocation = newLocation;
            newLocation.pieceExit();
            newLocation.pieceEntry(selectedPiece);
        } else {
            selectedPiece.curLocation.pieceExit();
            selectedPiece.curLocation = newLocation;
            newLocation.pieceEntry(selectedPiece);
            console.log(`piece moved through portal to ${newLocation.getInfo()}`);
        }
        curGame.createBoardDisplay(selectedPiece.curLocation.getBoard().getGame().topBoard, topBoardDisplay);
        curGame.createBoardDisplay(selectedPiece.curLocation.getBoard().getGame().bottomBoard, bottomBoardDisplay);
    }

    capturePortalAction(selectedPiece, newLocation) {
        let curGame = selectedPiece.curLocation.getBoard().getGame();
        curGame.checkPortalActivation();
        console.log("portal entered, piece killed");
        selectedPiece.curLocation.pieceExit();
        let pieceCaptured = newLocation.getPiece();
        pieceCaptured.pieceCaptured();
        let newX = newLocation.x;
        let newY = newLocation.y;
        if(newLocation.z == 0) {
            let newBoard = newLocation.getBoard().getGame().topBoard;
            newLocation = newBoard.getSquare(newX, newY);
        } else {
            let newBoard = newLocation.getBoard().getGame().bottomBoard;
            newLocation = newBoard.getSquare(newX, newY);
        }
        if(newLocation.getPiece() != 0) {
            console.log("Killing piece on other side of portal");
            let pieceCaptured = newLocation.getPiece();
            pieceCaptured.pieceCaptured();
            selectedPiece.curLocation = newLocation;
            newLocation.pieceExit();
            newLocation.pieceEntry(selectedPiece);
        } else {
            selectedPiece.curLocation.pieceExit();
            selectedPiece.curLocation = newLocation;
            newLocation.pieceEntry(selectedPiece);
            console.log(`piece moved through portal to ${newLocation.getInfo()}`);
        }
        curGame.createBoardDisplay(selectedPiece.curLocation.getBoard().getGame().topBoard, topBoardDisplay);
        curGame.createBoardDisplay(selectedPiece.curLocation.getBoard().getGame().bottomBoard, bottomBoardDisplay);

    }
}