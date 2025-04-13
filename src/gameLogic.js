import {
  Pawn,
  Castle,
  Bishop,
  Knight,
  Queen,
  King,
  Wizard,
} from "./pieceLogic.js";
import { Square } from "./squareLogic.js";
import "./index.css";
import { database } from "./index.js";
import { ref, push, set, get, update, onValue } from "firebase/database";
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

import { playerID, switchView } from "./index.js";

const topBoardDisplay = document.querySelector(".topBoardContainer");
const bottomBoardDisplay = document.querySelector(".bottomBoardContainer");
const createGameButton = document.querySelector("#createGame");
const joinGameButton = document.querySelector("#joinGame");
const yourID = document.querySelector(".playerID");
const currentTurn = document.querySelector(".currentTurn");

joinGameButton.addEventListener("click", () => {
  let newGameID = prompt("Enter game ID");
  joinGame(newGameID);
});

createGameButton.addEventListener("click", () => {
  createGame();
});

export let curGame = null;

export async function createGame() {
  console.log("creating Game");
  const gamesRef = ref(database, "activeGames");
  const newGameRef = push(gamesRef);
  const gameID = newGameRef.key;

  const makeEmpty = () =>
    Array.from({ length: 7 }, () =>
      Array.from({ length: 7 }, () => ({
        pieceNumber: 0,
        color: null,
        isPortal: false,
        portalisActive: false,
      })),
    );

  const bottomBoard = makeEmpty();
  const topBoard = makeEmpty();

  const placements = [
    // pawns on bottom (z=0)
    { x: 6, y: 3, z: 0, piece: 1, color: 0 },
    { x: 5, y: 2, z: 0, piece: 1, color: 0 },
    { x: 4, y: 1, z: 0, piece: 1, color: 0 },
    { x: 3, y: 0, z: 0, piece: 1, color: 0 },
    // pawns on bottom but black side (z=0,color=1)
    { x: 0, y: 3, z: 0, piece: 1, color: 1 },
    { x: 1, y: 4, z: 0, piece: 1, color: 1 },
    { x: 2, y: 5, z: 0, piece: 1, color: 1 },
    { x: 3, y: 6, z: 0, piece: 1, color: 1 },

    // pawns on top (z=1)
    { x: 6, y: 3, z: 1, piece: 1, color: 1 },
    { x: 5, y: 2, z: 1, piece: 1, color: 1 },
    { x: 4, y: 1, z: 1, piece: 1, color: 1 },
    { x: 3, y: 0, z: 1, piece: 1, color: 1 },
    // pawns on top but white side (z=1,color=0)
    { x: 0, y: 3, z: 1, piece: 1, color: 0 },
    { x: 1, y: 4, z: 1, piece: 1, color: 0 },
    { x: 2, y: 5, z: 1, piece: 1, color: 0 },
    { x: 3, y: 6, z: 1, piece: 1, color: 0 },

    // kings
    { x: 6, y: 0, z: 0, piece: 7, color: 0 },
    { x: 0, y: 6, z: 1, piece: 7, color: 0 },
    { x: 0, y: 6, z: 0, piece: 7, color: 1 },
    { x: 6, y: 0, z: 1, piece: 7, color: 1 },

    // queens
    { x: 0, y: 5, z: 1, piece: 6, color: 0 },
    { x: 5, y: 0, z: 0, piece: 6, color: 0 },
    { x: 5, y: 0, z: 1, piece: 6, color: 1 },
    { x: 0, y: 5, z: 0, piece: 6, color: 1 },

    // bishops
    { x: 1, y: 6, z: 1, piece: 3, color: 0 },
    { x: 6, y: 1, z: 0, piece: 3, color: 0 },
    { x: 6, y: 1, z: 1, piece: 3, color: 1 },
    { x: 1, y: 6, z: 0, piece: 3, color: 1 },

    // castles
    { x: 1, y: 5, z: 1, piece: 2, color: 0 },
    { x: 5, y: 1, z: 0, piece: 2, color: 0 },
    { x: 5, y: 1, z: 1, piece: 2, color: 1 },
    { x: 1, y: 5, z: 0, piece: 2, color: 1 },

    // knights
    { x: 0, y: 4, z: 1, piece: 4, color: 0 },
    { x: 4, y: 0, z: 0, piece: 4, color: 0 },
    { x: 4, y: 0, z: 1, piece: 4, color: 1 },
    { x: 0, y: 4, z: 0, piece: 4, color: 1 },

    // wizards
    { x: 6, y: 2, z: 0, piece: 5, color: 0 },
    { x: 2, y: 6, z: 0, piece: 5, color: 1 },
    { x: 6, y: 2, z: 1, piece: 5, color: 1 },
    { x: 2, y: 6, z: 1, piece: 5, color: 0 },
  ];

  for (const { x, y, z, piece, color } of placements) {
    const target = z === 0 ? bottomBoard : topBoard;
    Object.assign(target[x][y], { pieceNumber: piece, color });
  }

  const portalCoords = [
    { x: 1, y: 1 },
    { x: 5, y: 5 },
  ];
  for (const { x, y } of portalCoords) {
    bottomBoard[x][y].isPortal = true;
    bottomBoard[x][y].portalisActive = true;
    topBoard[x][y].isPortal = true;
    topBoard[x][y].portalisActive = true;
  }

  const initialState = {
    player1ID: playerID,
    player2ID: null,
    currentPlayer: 0,
    status: "waiting",
    bottomBoard,
    topBoard,
    winner: null,
    loser: null,
    moveLog: {},
  };

  const playerRef = ref(database, `players/${playerID}`);
  await update(playerRef, { currentGame: gameID });

  console.log(`Created game: ID = ${gameID}`);

  alert(`Game ID: ${gameID}`);

  await set(newGameRef, initialState);
  switchView("game");
  const { game, unsubscribe } = await waitForGameStart(gameID);
  curGame = game;
}

export async function joinGame(gameID) {
  const gameRef = ref(database, `activeGames/${gameID}`);
  const snap = await get(gameRef);
  if (!snap.exists()) {
    throw new Error(`Game ${gameID} not found`);
  }

  const data = snap.val();

  if (data.player2ID) {
    throw new Error(`Game ${gameID} already has two players`);
  }

  console.log(`Joined game: ${gameID}`);

  await update(gameRef, {
    player2ID: playerID,
    status: "active",
  });

  const playerRef = ref(database, `players/${playerID}`);
  await update(playerRef, { currentGame: gameID });

  switchView("game");
  const { game, unsubscribe } = await waitForGameStart(gameID);
  curGame = game;
}

export function gameUpdates(gameID) {
  const gameRef = ref(database, `activeGames/${gameID}`);
  let localGame = null;

  const unsubscribe = onValue(gameRef, (snap) => {
    if (!snap.exists()) {
      console.warn(`Game ${gameID} was removed from the database.`);
      return;
    }
    const state = snap.val();
    if (!localGame) {
      if (state.player2ID && state.status === "active") {
        localGame = new Game(gameID, state.player1ID, state.player2ID);

        localGame.bottomBoard.applyBoardState(
          localGame.bottomBoard,
          state.bottomBoard,
        );
        localGame.topBoard.applyBoardState(localGame.topBoard, state.topBoard);
        localGame.currentPlayer =
          state.currentPlayer === localGame.player1.color
            ? localGame.player1
            : localGame.player2;
        localGame.createBoardDisplay(localGame.topBoard, topBoardDisplay);
        localGame.createBoardDisplay(localGame.bottomBoard, bottomBoardDisplay);
      }
    } else {
      if (state.status === "done") {
        alert(`Game Over! Winner: ${state.winner}`);
        switchView("waiting");
      }
      localGame.currentPlayer =
        state.currentPlayer === localGame.player1.color
          ? localGame.player1
          : localGame.player2;
      localGame.bottomBoard.applyBoardState(
        localGame.bottomBoard,
        state.bottomBoard,
      );
      localGame.topBoard.applyBoardState(localGame.topBoard, state.topBoard);
      localGame.createBoardDisplay(localGame.topBoard, topBoardDisplay);
      localGame.createBoardDisplay(localGame.bottomBoard, bottomBoardDisplay);
      currentTurn.textContent = "Current Turn: " + localGame.currentPlayer.name;
      yourID.textContent = "Your ID: " + playerID;
    }
  });

  return unsubscribe;
}

export function waitForGameStart(gameID) {
  const gameRef = ref(database, `activeGames/${gameID}`);
  let localGame = null;

  return new Promise((resolve, reject) => {
    const unsubscribe = onValue(
      gameRef,
      (snap) => {
        if (!snap.exists()) {
          reject(new Error(`Game ${gameID} no longer exists`));
          return;
        }
        const state = snap.val();

        // first time only: create & render
        if (!localGame) {
          if (state.player2ID && state.status === "active") {
            localGame = new Game(gameID, state.player1ID, state.player2ID);

            // patch in the saved boards
            localGame.bottomBoard.applyBoardState(
              localGame.bottomBoard,
              state.bottomBoard,
            );
            localGame.topBoard.applyBoardState(
              localGame.topBoard,
              state.topBoard,
            );

            // set the correct currentPlayer
            localGame.currentPlayer =
              state.currentPlayer === localGame.player1.color
                ? localGame.player1
                : localGame.player2;

            // render them
            localGame.createBoardDisplay(localGame.topBoard, topBoardDisplay);
            localGame.createBoardDisplay(
              localGame.bottomBoard,
              bottomBoardDisplay,
            );

            currentTurn.textContent = localGame.currentPlayer.name;
            yourID.textContent = playerID;

            // now the game is ready—resolve!
            resolve({ game: localGame, unsubscribe });
          }
        } else {
          // subsequent updates: just patch and re‑render
          localGame.currentPlayer =
            state.currentPlayer === localGame.player1.color
              ? localGame.player1
              : localGame.player2;

          localGame.bottomBoard.applyBoardState(
            localGame.bottomBoard,
            state.bottomBoard,
          );
          localGame.topBoard.applyBoardState(
            localGame.topBoard,
            state.topBoard,
          );

          localGame.createBoardDisplay(localGame.topBoard, topBoardDisplay);
          localGame.createBoardDisplay(
            localGame.bottomBoard,
            bottomBoardDisplay,
          );

          currentTurn.textContent = localGame.currentPlayer.name;
          yourID.textContent = playerID;
        }
      },
      (err) => {
        reject(err);
      },
    );
  });
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
      Array.from({ length: cols }, (_, col) => new Square(row, col, z, this)),
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

  getSquare(x, y) {
    if (
      x < 0 ||
      x >= this.boardArray.length ||
      y < 0 ||
      y >= this.boardArray[0].length
    ) {
      return undefined;
    }
    return this.boardArray[x][y];
  }

  getPieceAtSquare(x, y) {
    return this.getSquare(x, y).getPiece();
  }

  printBoardNice() {
    let toReturn = "";
    for (let row = 0; row < this.boardArray.length; row++) {
      let tempRow = "";
      for (let column = 0; column < this.boardArray[row].length; column++) {
        tempRow += ` ${this.getSquare(row, column).getInfoForBoard()}`;
      }
      toReturn += tempRow;
      toReturn += "\n";
    }
    return toReturn;
  }

  applyBoardState(board, boardStateArray) {
    for (let x = 0; x < boardStateArray.length; x++) {
      for (let y = 0; y < boardStateArray.length; y++) {
        const sq = board.getSquare(x, y);
        const cell = boardStateArray[x][y];

        if (cell && typeof cell.isPortal === "boolean") {
          sq.isPortal = cell.isPortal;
          sq.portalisActive = cell.portalisActive;
        }

        const exisiting = sq.getPiece();
        if (exisiting) sq.pieceExit();

        if (cell && cell.pieceNumber > 0) {
          curGame.placePiece(x, y, board.z, cell.pieceNumber, cell.color);
        }
      }
    }
  }
}

export class Game {
  constructor(gameID, player1ID, player2ID) {
    this.topBoard = new Board(1, this); //SW contains black troops
    this.bottomBoard = new Board(0, this); //SW contains white troops
    this.capturedPieces = [];
    this.player1 = new Player(player1ID, 0);
    this.player2 = new Player(player2ID, 1);
    this.currentPlayer = this.player1;
    this.gameActive = true;
    this.selectedSquare = null;
    this.gameID = gameID;
    this.winner = null;
    this.loser = null;
    curGame = this;
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
    const isMyTurn = this.currentPlayer.name === playerID;

    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const cell = document.createElement("div");
        let curSquare = board.getSquare(row, col);
        cell.isMyTurn = isMyTurn;
        cell.square = curSquare;
        cell.style.border = "1px solid #333";
        cell.style.padding = "10px";
        cell.style.textAlign = "center";
        cell.style.cursor = "pointer";
        cell.style.backgroundSize = "contain"; // or "cover" depending on your preference
        cell.style.backgroundRepeat = "no-repeat";
        cell.style.backgroundPosition = "center";

        const isLight = (row + col) % 2 === 0;
        cell.style.backgroundColor = isLight ? "#f0d9b5" : "#b58863";

        if (curSquare.isPortal && curSquare.portalisActive) {
          cell.classList.add("rainbow");
        }

        if (curSquare.isPortal) {
          cell.style.backgroundColor = `grey`;
        }

        if (this.selectedSquare) {
          // If the square is in valid moves, highlight in green
          if (
            validMoves.some(
              (move) =>
                move.x === curSquare.x &&
                move.y === curSquare.y &&
                move.z === curSquare.z,
            )
          ) {
            cell.style.backgroundColor = "lightgreen";
          }
          // If the square is in valid captures, highlight in red (this takes precedence)
          if (
            validCaptures.some(
              (move) =>
                move.x === curSquare.x &&
                move.y === curSquare.y &&
                move.z === curSquare.z,
            )
          ) {
            cell.style.backgroundColor = "lightcoral";
          }
        }

        const piece = curSquare.getPiece();
        if (piece) {
          switch (piece.pieceNumber) {
            case 1: // Pawn
              cell.style.backgroundImage =
                piece.color === 0 ? `url(${whitePawn})` : `url(${blackPawn})`;
              break;
            case 2: // Rook (Castle)
              cell.style.backgroundImage =
                piece.color === 0
                  ? `url(${whiteCastle})`
                  : `url(${blackCastle})`;
              break;
            case 3: // bishop
              cell.style.backgroundImage =
                piece.color === 0
                  ? `url(${whiteBishop})`
                  : `url(${blackBishop})`;
              break;
            case 4: // knight
              cell.style.backgroundImage =
                piece.color === 0
                  ? `url(${whiteKnight})`
                  : `url(${blackKnight})`;
              break;
            case 5: // Wizard
              cell.style.backgroundImage =
                piece.color === 0
                  ? `url(${whiteWizard})`
                  : `url(${blackWizard})`;
              break;
            case 6: // queen
              cell.style.backgroundImage =
                piece.color === 0 ? `url(${whiteQueen})` : `url(${blackQueen})`;
              break;
            case 7: // king
              cell.style.backgroundImage =
                piece.color === 0 ? `url(${whiteKing})` : `url(${blackKing})`;
              break;
            default:
              break;
          }
        }

        cell.addEventListener("click", () => {
          if (!cell.isMyTurn) {
            console.log("It's not your turn");
            return;
          }

          if (!this.selectedSquare) {
            if (
              curSquare.getPiece() &&
              curSquare.getPiece().color === this.currentPlayer.color
            ) {
              this.selectedSquare = curSquare;
              cell.style.backgroundColor = "yellow";
              console.log("selected piece at:", curSquare.getInfo());
              this.createBoardDisplay(board, container);
            } else {
              console.log("Please select your own Piece");
            }
          } else {
            const destinationSquare = curSquare;
            console.log("destination selected: ", destinationSquare.getInfo());
            this.currentPlayer.attemptMove(
              this.selectedSquare.getPiece(),
              destinationSquare,
            );
            this.selectedSquare = null;
            this.createBoardDisplay(board, container);
          }
        });
        container.appendChild(cell);
      }
    }
  }

  placePiece(x, y, z, piece, color) {
    let curBoard = this.topBoard;
    if (z === 0) {
      curBoard = this.bottomBoard;
    }
    if (piece == 1) {
      this.pieceToPlace = new Pawn(curBoard.getSquare(x, y), color);
    } else if (piece == 2) {
      this.pieceToPlace = new Castle(curBoard.getSquare(x, y), color);
    } else if (piece == 3) {
      this.pieceToPlace = new Bishop(curBoard.getSquare(x, y), color);
    } else if (piece == 4) {
      this.pieceToPlace = new Knight(curBoard.getSquare(x, y), color);
    } else if (piece == 6) {
      this.pieceToPlace = new Queen(curBoard.getSquare(x, y), color);
    } else if (piece == 7) {
      this.pieceToPlace = new King(curBoard.getSquare(x, y), color);
    } else if (piece == 5) {
      this.pieceToPlace = new Wizard(curBoard.getSquare(x, y), color);
    }
    curBoard.getSquare(x, y).pieceEntry(this.pieceToPlace);
    console.log(`${this.pieceToPlace.printPiece()} placed at ${x},${y},${z}`);
  }

  checkKingCapture() {
    // Filter the captured pieces to only include kings (pieceNumber 7)
    const capturedKings = this.capturedPieces.filter(
      (piece) => piece.pieceNumber === 7,
    );

    // Count kings by color
    const kingCountByColor = { white: 0, black: 0 };
    capturedKings.forEach((king) => {
      if (king.color === 0) {
        kingCountByColor.white++;
      } else if (king.color === 1) {
        kingCountByColor.black++;
      }
    });

    // Check if either side has lost both kings
    if (kingCountByColor.white >= 2) {
      alert("White's kings have been captured. Black wins!");
      this.gameActive = false;
      this.winner = this.player2;
      this.loser = this.player1;
      this.endGameLogic();
      return { winner: "black", reason: "White's two kings captured" };
    } else if (kingCountByColor.black >= 2) {
      alert("Black's kings have been captured. White wins!");
      this.gameActive = false;
      this.winner = this.player1;
      this.loser = this.player2;
      this.endGameLogic();
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
                if (piece && piece.pieceNumber === 5) {
                  // 5 indicates a wizard.
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

  endGameLogic() {
    const gameRef = ref(database, `activeGames/${this.gameID}`);

    let gameOverHandled = false;

    onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data.status === "done") {
        if (!gameOverHandled) {
          gameOverHandled = true;
          alert(`Winner is ${data.winner}`);
          switchView("waiting");
          alert("View switched");
          // Only the winner updates elo
          if (playerID === data.winner) {
            this.handleGameOver();
          }
        }
      }
    });
  }

  async handleGameOver() {
    const gameRef = ref(database, `activeGames/${this.gameID}`);

    try {
      const snapshot = await get(gameRef);
      const data = snapshot.val();

      if(!data) {
        console.warn("Game not found");
        return;
      }

      const winnerRef = ref(database, `players/${data.winner}`);
      const loserRef = ref(database, `${data.loser}`);

      await update(winnerRef, {
        elo: (data.elo) + 10,
        currentGame: null
      });

      await update(loserRef, {
        elo: (data.elo) - 10,
        currentGame: null
      })
    } catch (error) {
      console.error("Error handling ending game logic: ", error);
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
    //get game State
    //check portal activation
    //make sure they are the current player
    console.log(`attempt move to: ${newLocation.getInfo()}`);
    if (selectedPiece.color !== this.color) {
      console.log("Please select your piece");
      return;
    }
    const [moves, captures] = selectedPiece.validMoves();

    const isValidMove = moves.some(
      (move) =>
        move.x === newLocation.x &&
        move.y === newLocation.y &&
        move.z === newLocation.z,
    );

    const isValidCapture = captures.some(
      (move) =>
        move.x === newLocation.x &&
        move.y === newLocation.y &&
        move.z === newLocation.z,
    );

    if (isValidMove) {
      this.moveAction(selectedPiece, newLocation);
    } else if (isValidCapture) {
      this.captureAction(selectedPiece, newLocation);
    } else {
      console.log("not a valid move or capture");
    }
  }

  async moveAction(selectedPiece, newLocation) {
    let moveSucceeded = false;
    let curGame = selectedPiece.curLocation.getBoard().getGame();
    curGame.checkPortalActivation();
    // Check if the destination is a portal
    if (newLocation.getPortal()) {
      // Prevent kings (pieceNumber 7), knights (pieceNumber 4), and wizards (pieceNumber 5) from going through portals.
      if ([7, 4, 5].includes(selectedPiece.pieceNumber)) {
        console.log(`${selectedPiece.printPiece()} cannot go through portals.`);
        return;
      }
      // Only try the portal move if it's active.
      if (newLocation.portalisActive) {
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

    if (moveSucceeded) {
      curGame.currentPlayer =
        curGame.currentPlayer === curGame.player1
          ? curGame.player2
          : curGame.player1;
      curGame.createBoardDisplay(
        selectedPiece.curLocation.getBoard().getGame().topBoard,
        topBoardDisplay,
      );
      curGame.createBoardDisplay(
        selectedPiece.curLocation.getBoard().getGame().bottomBoard,
        bottomBoardDisplay,
      );
      curGame.checkKingCapture();
      await pushStateToFirebase(curGame);
    }
  }

  async captureAction(selectedPiece, newLocation) {
    let curGame = selectedPiece.curLocation.getBoard().getGame();
    if (newLocation.getPortal()) {
      curGame.checkPortalActivation();
      // Prevent kings, knights, and wizards from capturing through portals.
      if ([7, 4, 5].includes(selectedPiece.pieceNumber)) {
        console.log(
          `${selectedPiece.printPiece()} cannot capture through portals.`,
        );
        return;
      }
      this.capturePortalAction(selectedPiece, newLocation);
    } else {
      selectedPiece.curLocation.pieceExit();
      let pieceCaptured = newLocation.getPiece();
      pieceCaptured.pieceCaptured();
      selectedPiece.curLocation = newLocation;
      newLocation.pieceEntry(selectedPiece);
      console.log(
        `${selectedPiece.printPiece()} captured ${pieceCaptured.printPiece()}`,
      );
    }
    curGame.currentPlayer =
      curGame.currentPlayer === curGame.player1
        ? curGame.player2
        : curGame.player1;
    curGame.createBoardDisplay(
      selectedPiece.curLocation.getBoard().getGame().topBoard,
      topBoardDisplay,
    );
    curGame.createBoardDisplay(
      selectedPiece.curLocation.getBoard().getGame().bottomBoard,
      bottomBoardDisplay,
    );
    curGame.checkKingCapture();
    await pushStateToFirebase(curGame);
  }

  async movePortalAction(selectedPiece, newLocation) {
    let curGame = selectedPiece.curLocation.getBoard().getGame();
    curGame.checkPortalActivation();
    console.log("Portal entered");
    selectedPiece.curLocation.pieceExit();
    let newX = newLocation.x;
    let newY = newLocation.y;
    if (newLocation.z == 0) {
      let newBoard = newLocation.getBoard().getGame().topBoard;
      newLocation = newBoard.getSquare(newX, newY);
    } else {
      let newBoard = newLocation.getBoard().getGame().bottomBoard;
      newLocation = newBoard.getSquare(newX, newY);
    }
    if (newLocation.getPiece() != 0) {
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
  }

  async capturePortalAction(selectedPiece, newLocation) {
    let curGame = selectedPiece.curLocation.getBoard().getGame();
    curGame.checkPortalActivation();
    console.log("portal entered, piece killed");
    selectedPiece.curLocation.pieceExit();
    let pieceCaptured = newLocation.getPiece();
    pieceCaptured.pieceCaptured();
    let newX = newLocation.x;
    let newY = newLocation.y;
    if (newLocation.z == 0) {
      let newBoard = newLocation.getBoard().getGame().topBoard;
      newLocation = newBoard.getSquare(newX, newY);
    } else {
      let newBoard = newLocation.getBoard().getGame().bottomBoard;
      newLocation = newBoard.getSquare(newX, newY);
    }
    if (newLocation.getPiece() != 0) {
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
  }
}

function pushStateToFirebase(game) {
  console.log("pushing state to fire base");
  const gameRef = ref(database, `activeGames/${game.gameID}`);
  return update(gameRef, {
    bottomBoard: game.bottomBoard.boardArray.map((row) =>
      row.map((sq) => ({
        pieceNumber: sq.getPiece() ? sq.getPiece().pieceNumber : 0,
        color: sq.getPiece() ? sq.getPiece().color : null,
        isPortal: sq.isPortal,
        portalisActive: sq.portalisActive,
      })),
    ),
    topBoard: game.topBoard.boardArray.map((row) =>
      row.map((sq) => ({
        pieceNumber: sq.getPiece() ? sq.getPiece().pieceNumber : 0,
        color: sq.getPiece() ? sq.getPiece().color : null,
        isPortal: sq.isPortal,
        portalisActive: sq.portalisActive,
      })),
    ),
    currentPlayer: game.currentPlayer.color,
    winner: game.winner ? game.winner.name : null,
    loser: game.loser ? game.loser.name : null,
    status: game.winner ? "done" : "active",
  });
}
