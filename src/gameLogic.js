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
            return { winner: "black", reason: "White's two kings captured" };
        } else if (kingCountByColor.black >= 2) {
            console.log("Black's kings have been captured. White wins!");
            return { winner: "white", reason: "Black's two kings captured" };
        } else {
            console.log("The game continues. Not enough kings captured.");
            return null;
        }
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

export class Bishop extends Piece {
    constructor(square, color) {
        super(3, square, color);
    }

    validMoves() {
        this.currentSquare = this.curLocation;
        this.currentZ = this.currentSquare.z;
        this.curBoard = this.currentSquare.getBoard();

        this.moves = [];
        this.captures = [];
        this.currentX = this.currentSquare.x;
        this.currentY = this.currentSquare.y;
        //determine bishop direction
        //can travel diagonal either direction as long as you dont hit piece;
        //NE
        let vertical = -1;
        let horizontal = +1;
        let northEast = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        while(northEast && northEast.getPiece() == 0) {
            this.moves.push(northEast);
            vertical--;
            horizontal++;
            northEast = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        }
        if(northEast && northEast.getPiece() != 0 && northEast.getPiece().color != this.color) {
            this.captures.push(northEast);
        }
        //NW
        vertical = -1;
        horizontal = -1;
        let northWest = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        while(northWest && northWest.getPiece() == 0) {
            this.moves.push(northWest);
            vertical--;
            horizontal--;
            northWest = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        }
        if(northWest && northWest.getPiece() != 0 && northWest.getPiece().color != this.color) {
            this.captures.push(northWest);
        }
        //SE
        vertical = +1;
        horizontal = -1;
        let southEast = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        while(southEast && southEast.getPiece() == 0) {
            this.moves.push(southEast);
            vertical++;
            horizontal--;
            southEast = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        }
        if(southEast && southEast.getPiece() != 0 && southEast.getPiece().color != this.color) {
            this.captures.push(southEast);
        }
        //SW
        vertical = +1;
        horizontal = +1;
        let southWest = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        while(southWest && southWest.getPiece() == 0) {
            this.moves.push(southWest);
            vertical++;
            horizontal++;
            southWest = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        }
        if(southWest && southWest.getPiece() != 0 && southWest.getPiece().color != this.color) {
            this.captures.push(southWest);
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

export class Knight extends Piece {
    constructor(square, color) {
        super(4, square, color);
    }

    validMoves() {
        this.currentSquare = this.curLocation;
        this.currentZ = this.currentSquare.z;
        this.curBoard = this.currentSquare.getBoard();

        this.moves = [];
        this.captures = [];
        this.temp = [];
        this.currentX = this.currentSquare.x;
        this.currentY = this.currentSquare.y;
        //kinght movement
        let firstMovement = this.curBoard.getSquare(this.currentX + 2, this.currentY + 1);
        let secondMovement = this.curBoard.getSquare(this.currentX + 1, this.currentY + 2);
        let thirdMovement = this.curBoard.getSquare(this.currentX - 2, this.currentY + 1);
        let fourthMovement = this.curBoard.getSquare(this.currentX - 1, this.currentY + 2);
        let fifthMovement = this.curBoard.getSquare(this.currentX + 2, this.currentY - 1);
        let sixthMovement = this.curBoard.getSquare(this.currentX + 1, this.currentY - 2);
        let sevenMovement = this.curBoard.getSquare(this.currentX - 2, this.currentY - 1);
        let eightMovement = this.curBoard.getSquare(this.currentX - 1, this.currentY - 2);
        this.temp.push(firstMovement);
        this.temp.push(secondMovement);
        this.temp.push(thirdMovement);
        this.temp.push(fourthMovement);
        this.temp.push(fifthMovement);
        this.temp.push(sixthMovement);
        this.temp.push(sevenMovement);
        this.temp.push(eightMovement);
        this.temp.forEach(move => {
            if(move && move.getPiece() == 0) {
                this.moves.push(move);
            } else if(move && move.getPiece() != 0 && move.getPiece().color != this.color) {
                this.captures.push(move);
            }
        })
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

export class Queen extends Piece {
    constructor(square, color) {
        super(6, square, color);
    }

    validMoves() {
        this.currentSquare = this.curLocation;
        this.currentZ = this.currentSquare.z;
        this.curBoard = this.currentSquare.getBoard();

        this.moves = [];
        this.captures = [];
        this.currentX = this.currentSquare.x;
        this.currentY = this.currentSquare.y;

        let vertical = -1;
        let horizontal = +1;
        let northEast = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        while(northEast && northEast.getPiece() == 0) {
            this.moves.push(northEast);
            vertical--;
            horizontal++;
            northEast = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        }
        if(northEast && northEast.getPiece() != 0 && northEast.getPiece().color != this.color) {
            this.captures.push(northEast);
        }
        //NW
        vertical = -1;
        horizontal = -1;
        let northWest = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        while(northWest && northWest.getPiece() == 0) {
            this.moves.push(northWest);
            vertical--;
            horizontal--;
            northWest = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        }
        if(northWest && northWest.getPiece() != 0 && northWest.getPiece().color != this.color) {
            this.captures.push(northWest);
        }
        //SE
        vertical = +1;
        horizontal = -1;
        let southEast = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        while(southEast && southEast.getPiece() == 0) {
            this.moves.push(southEast);
            vertical++;
            horizontal--;
            southEast = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        }
        if(southEast && southEast.getPiece() != 0 && southEast.getPiece().color != this.color) {
            this.captures.push(southEast);
        }
        //SW
        vertical = +1;
        horizontal = +1;
        let southWest = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        while(southWest && southWest.getPiece() == 0) {
            this.moves.push(southWest);
            vertical++;
            horizontal++;
            southWest = this.curBoard.getSquare(this.currentX + vertical, this.currentY + horizontal);
        }
        if(southWest && southWest.getPiece() != 0 && southWest.getPiece().color != this.color) {
            this.captures.push(southWest);
        }

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

export class King extends Piece {
    constructor(square, color) {
        super(7, square, color);
    }
    validMoves() {
        this.currentSquare = this.curLocation;
        this.currentZ = this.currentSquare.z;
        this.curBoard = this.currentSquare.getBoard();

        this.temp = [];
        this.moves = [];
        this.captures = [];
        this.currentX = this.currentSquare.x;
        this.currentY = this.currentSquare.y;
        let firstMovement = this.curBoard.getSquare(this.currentX + 1, this.currentY);
        let secondMovement = this.curBoard.getSquare(this.currentX + 1, this.currentY + 1);
        let thirdMovement = this.curBoard.getSquare(this.currentX, this.currentY + 1);
        let fourthMovement = this.curBoard.getSquare(this.currentX, this.currentY - 1);
        let fifthMovement = this.curBoard.getSquare(this.currentX - 1, this.currentY - 1);
        let sixthMovement = this.curBoard.getSquare(this.currentX - 1, this.currentY);
        let sevenMovement = this.curBoard.getSquare(this.currentX - 1, this.currentY + 1);
        let eightMovement = this.curBoard.getSquare(this.currentX + 1, this.currentY - 2);
        this.temp.push(firstMovement);
        this.temp.push(secondMovement);
        this.temp.push(thirdMovement);
        this.temp.push(fourthMovement);
        this.temp.push(fifthMovement);
        this.temp.push(sixthMovement);
        this.temp.push(sevenMovement);
        this.temp.push(eightMovement);
        this.temp.forEach(move => {
            if(move && move.getPiece() == 0) {
                this.moves.push(move);
            } else if(move && move.getPiece() != 0 && move.getPiece().color != this.color) {
                this.captures.push(move);
            }
        })
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