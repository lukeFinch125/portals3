import chalk from 'chalk';

export class Square {
    constructor(x, y, z, board) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.board = board;
        this.pieceOnSquare = 0;
        this.isPortal = false;
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
        if (this.pieceOnSquare && typeof this.pieceOnSquare === "object" && typeof this.pieceOnSquare.printPiece === "function") {
          return this.pieceOnSquare.printPiece();
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
        this.curPlayer = 0; //0 = white, 1 = black
        this.player1 = new Player("Luke", 0);
        this.player2 = new Player("Aaron", 1);
    }

    printBothBoards() {
        console.log("top board: ");
        console.log(this.topBoard.printBoardNice());
        console.log("bottom board: ");
        console.log(this.bottomBoard.printBoardNice());
    }

    startGame() {
        console.log("Game starting");
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
        }
        curBoard.getSquare(x,y).pieceEntry(this.pieceToPlace);
        console.log(`${this.pieceToPlace.printPiece()} placed at ${x},${y},${z}`);
    }
}


export class Piece {
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
    constructor(pieceNumber, square, color) {
        this.pieceNumber = pieceNumber;
        this.status = 0; //status: 0 = alive 1 = dead
        this.curLocation = square;
        this.color = color //color: 0 = white, 1 = black
    }

    printPiece() {
        if(this.color === 0) {
            return chalk.blue(this.pieceNumber);
        } else {
            return chalk.red(this.pieceNumber);
        }
    }

    getCurLocation() {
        return this.curLocation.getInfo();
    }

    pieceCaptured() {
        this.status = 1; //piece died;
        this.curLocation.getBoard().getGame().capturedPieces.push(this);
        console.log(this.curLocation.getBoard().getGame().capturedPieces);
    }
}

/*
each piece class extended from piece will have a valid movement array which will be passed to the 
player function when it wants to move it. The movement logic will be held in player but we need
to pass in what movement the piece can do first
*/

export class Pawn extends Piece {
    constructor(square, color) {
        super(1, square, color);
    }

    validMoves() {  
        this.currentSquare = this.curLocation;
        this.currentZ = this.currentSquare.z;
        this.curBoard = this.currentSquare.getBoard();
        
        this.moves = [];
        this.captures = [];
        this.currentX = this.currentSquare.x;
        this.currentY = this.currentSquare.y;
        //determine pawn travel direction
        if((this.curLocation.z === 0 && this.color === 0) || (this.curLocation.z === 1 && this.color === 1)) {
            //pawns travel NE
            //pawn travels north
            const north = this.curBoard.getSquare(this.currentX - 1, this.currentY);
            if (north && north.getPiece() == 0) {
                this.moves.push(north);
            }
            if(north && north.getPiece() != 0 && north.getPiece().color !== this.color) {
                this.captures.push(north);
            }
            //pawn travels east
            const east = this.curBoard.getSquare(this.currentX, this.currentY + 1);
            if(east && east.getPiece() == 0) {
                this.moves.push(east);
            }
            if(east && east.getPiece() != 0 && east.getPiece().color !== this.color) {
                this.captures.push(east);
            }
            //pawn travels NE
            const northEast = this.curBoard.getSquare(this.currentX - 1, this.currentY + 1);
            if(northEast && northEast.getPiece() == 0) {
                this.moves.push(northEast);
            }
        } else {
            //pawns travel SW
            //pawn travels S
            const south = this.curBoard.getSquare(this.currentX + 1, this.currentY);
            if(south && south.getPiece() == 0) {
                this.moves.push(south);
            }
            if(south && south.getPiece() != 0 && south.getPiece().color !== this.color) {
                this.captures.push(south);
            }
            //pawn travels W
            const west = this.curBoard.getSquare(this.currentX, this.currentY - 1);
            if(west && west.getPiece() == 0) {
                this.moves.push(west);
            }
            if(west && west.getPiece() != 0 && west.getPiece().color !== this.color) {
                this.captures.push(west);
            }
            //pawn travel SW
            const southWest = this.curBoard.getSquare(this.currentX + 1, this.currentY - 1);
            if(southWest && southWest.getPiece() == 0) {
                this.moves.push(southWest);
            }
        }
        console.log("Valid moves: ");
        this.moves.forEach(move => {
            console.log(move.getInfo());
        })
        console.log("valid captures: ");
        this.captures.forEach(move => {
            console.log(move.getInfo());
        })
        return [this.moves,this.captures];
    }
}

export class Castle extends Piece {
    constructor(square, color) {
        super(2, square, color);
    }

    validMoves() {
        this.currentSquare = this.curLocation;
        this.currentZ = this.currentSquare.z;
        this.curBoard = this.currentSquare.getBoard();

        this.moves = [];
        this.captures = [];
        this.currentX = this.currentSquare.x;
        this.currentY = this.currentSquare.y;
        //determine castle travel direction
        //can travel up and down as long as you dont hit a piece;
        let northOffset = -1;
        let north = this.curBoard.getSquare(this.currentX + northOffset, this.currentY);
        while(north && north.getPiece() == 0) {
            this.moves.push(north);
            northOffset--;
            north = this.curBoard.getSquare(this.currentX + northOffset, this.currentY);
        }
        if(north && north.getPiece() != 0 && north.getPiece().color != this.color) {
            this.captures.push(north);
        }
        let southOffset = 1;
        let south = this.curBoard.getSquare(this.currentX + southOffset, this.currentY);
        while(south && south.getPiece() == 0) {
            this.moves.push(south);
            southOffset++;
            south = this.curBoard.getSquare(this.currentX + southOffset, this.currentY);
        }
        if(south && south.getPiece() != 0 && south.getPiece().color != this.color) {
            this.captures.push(south);
        }
        let westOffset = -1;
        let west = this.curBoard.getSquare(this.currentX, this.currentY + westOffset);
        while(west && west.getPiece() == 0) {
            this.moves.push(west);
            westOffset--;
            west = this.curBoard.getSquare(this.currentX, this.currentY + westOffset);
        }
        if(west && west.getPiece() != 0 && west.getPiece().color != this.color) {
            this.captures.push(west);
        }
        let eastOffset = 1;
        let east = this.curBoard.getSquare(this.currentX, this.currentY + eastOffset);
        while(east && east.getPiece() == 0) {
            this.moves.push(east);
            eastOffset++;
            east = this.curBoard.getSquare(this.currentX, this.currentY + eastOffset);
        }
        if(east && east.getPiece() != 1 && east.getPiece().color != this.color) {
            this.captures.push(east);
        }
        
        console.log("valid moves: ");
        this.moves.forEach(move => {
            console.log(move.getInfo());
        })
        console.log("valid captures: ");
        this.captures.forEach(move => {
            console.log(move.getInfo());
        })
        return [this.moves, this.captures];
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
        selectedPiece.curLocation.pieceExit();
        selectedPiece.curLocation = newLocation;
        newLocation.pieceEntry(selectedPiece);
        console.log(`moved to: ${newLocation.getInfo()}`);
    }

    captureAction(selectedPiece, newLocation) {
        selectedPiece.curLocation.pieceExit();
        let pieceCaptured = newLocation.getPiece();
        pieceCaptured.pieceCaptured();
        selectedPiece.curLocation = newLocation;
        newLocation.pieceEntry(selectedPiece);
        console.log(`${selectedPiece.printPiece()} captured ${pieceCaptured.printPiece()}`);
    }
}