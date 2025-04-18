import chalk from "chalk";

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
    this.color = color; //color: 0 = white, 1 = black
  }

  printPiece() {
    return this.color + " " + this.pieceNumber;
  }

  getInfoForBoardUI() {
    if (this.color === 0) {
      return `<span class="piece white">${this.pieceNumber}</span>`;
    } else {
      return `<span class="piece black">${this.pieceNumber}</span>`;
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
    if (
      (this.curLocation.z === 0 && this.color === 0) ||
      (this.curLocation.z === 1 && this.color === 1)
    ) {
      //pawns travel NE
      //pawn travels north
      const north = this.curBoard.getSquare(this.currentX - 1, this.currentY);
      if (north && north.getPiece() == 0) {
        this.moves.push(north);
      }
      if (
        north &&
        north.getPiece() != 0 &&
        north.getPiece().color !== this.color
      ) {
        this.captures.push(north);
      }
      //pawn travels east
      const east = this.curBoard.getSquare(this.currentX, this.currentY + 1);
      if (east && east.getPiece() == 0) {
        this.moves.push(east);
      }
      if (
        east &&
        east.getPiece() != 0 &&
        east.getPiece().color !== this.color
      ) {
        this.captures.push(east);
      }
      //pawn travels NE
      const northEast = this.curBoard.getSquare(
        this.currentX - 1,
        this.currentY + 1,
      );
      if (northEast && northEast.getPiece() == 0) {
        this.moves.push(northEast);
      }
    } else {
      //pawns travel SW
      //pawn travels S
      const south = this.curBoard.getSquare(this.currentX + 1, this.currentY);
      if (south && south.getPiece() == 0) {
        this.moves.push(south);
      }
      if (
        south &&
        south.getPiece() != 0 &&
        south.getPiece().color !== this.color
      ) {
        this.captures.push(south);
      }
      //pawn travels W
      const west = this.curBoard.getSquare(this.currentX, this.currentY - 1);
      if (west && west.getPiece() == 0) {
        this.moves.push(west);
      }
      if (
        west &&
        west.getPiece() != 0 &&
        west.getPiece().color !== this.color
      ) {
        this.captures.push(west);
      }
      //pawn travel SW
      const southWest = this.curBoard.getSquare(
        this.currentX + 1,
        this.currentY - 1,
      );
      if (southWest && southWest.getPiece() == 0) {
        this.moves.push(southWest);
      }
    }
    console.log("Valid moves: ");
    this.moves.forEach((move) => {
      console.log(move.getInfo());
    });
    console.log("valid captures: ");
    this.captures.forEach((move) => {
      console.log(move.getInfo());
    });
    return [this.moves, this.captures];
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
    let north = this.curBoard.getSquare(
      this.currentX + northOffset,
      this.currentY,
    );
    while (north && north.getPiece() == 0) {
      this.moves.push(north);
      if (north.isPortal) break;
      northOffset--;
      north = this.curBoard.getSquare(
        this.currentX + northOffset,
        this.currentY,
      );
    }
    if (
      north &&
      north.getPiece() != 0 &&
      north.getPiece().color != this.color
    ) {
      this.captures.push(north);
    }
    let southOffset = 1;
    let south = this.curBoard.getSquare(
      this.currentX + southOffset,
      this.currentY,
    );
    while (south && south.getPiece() == 0) {
      this.moves.push(south);
      if (south.isPortal) break;
      southOffset++;
      south = this.curBoard.getSquare(
        this.currentX + southOffset,
        this.currentY,
      );
    }
    if (
      south &&
      south.getPiece() != 0 &&
      south.getPiece().color != this.color
    ) {
      this.captures.push(south);
    }
    let westOffset = -1;
    let west = this.curBoard.getSquare(
      this.currentX,
      this.currentY + westOffset,
    );
    while (west && west.getPiece() == 0) {
      this.moves.push(west);
      if (west.isPortal) break;
      westOffset--;
      west = this.curBoard.getSquare(this.currentX, this.currentY + westOffset);
    }
    if (west && west.getPiece() != 0 && west.getPiece().color != this.color) {
      this.captures.push(west);
    }
    let eastOffset = 1;
    let east = this.curBoard.getSquare(
      this.currentX,
      this.currentY + eastOffset,
    );
    while (east && east.getPiece() == 0) {
      this.moves.push(east);
      if (east.isPortal) break;
      eastOffset++;
      east = this.curBoard.getSquare(this.currentX, this.currentY + eastOffset);
    }
    if (east && east.getPiece() != 0 && east.getPiece().color != this.color) {
      this.captures.push(east);
    }

    console.log("valid moves: ");
    this.moves.forEach((move) => {
      console.log(move.getInfo());
    });
    console.log("valid captures: ");
    this.captures.forEach((move) => {
      console.log(move.getInfo());
    });
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
    let northEast = this.curBoard.getSquare(
      this.currentX + vertical,
      this.currentY + horizontal,
    );
    while (northEast && northEast.getPiece() == 0) {
      this.moves.push(northEast);
      vertical--;
      horizontal++;
      northEast = this.curBoard.getSquare(
        this.currentX + vertical,
        this.currentY + horizontal,
      );
    }
    if (
      northEast &&
      northEast.getPiece() != 0 &&
      northEast.getPiece().color != this.color
    ) {
      this.captures.push(northEast);
    }
    //NW
    vertical = -1;
    horizontal = -1;
    let northWest = this.curBoard.getSquare(
      this.currentX + vertical,
      this.currentY + horizontal,
    );
    while (northWest && northWest.getPiece() == 0) {
      this.moves.push(northWest);
      vertical--;
      horizontal--;
      northWest = this.curBoard.getSquare(
        this.currentX + vertical,
        this.currentY + horizontal,
      );
    }
    if (
      northWest &&
      northWest.getPiece() != 0 &&
      northWest.getPiece().color != this.color
    ) {
      this.captures.push(northWest);
    }
    //SE
    vertical = +1;
    horizontal = -1;
    let southEast = this.curBoard.getSquare(
      this.currentX + vertical,
      this.currentY + horizontal,
    );
    while (southEast && southEast.getPiece() == 0) {
      this.moves.push(southEast);
      vertical++;
      horizontal--;
      southEast = this.curBoard.getSquare(
        this.currentX + vertical,
        this.currentY + horizontal,
      );
    }
    if (
      southEast &&
      southEast.getPiece() != 0 &&
      southEast.getPiece().color != this.color
    ) {
      this.captures.push(southEast);
    }
    //SW
    vertical = +1;
    horizontal = +1;
    let southWest = this.curBoard.getSquare(
      this.currentX + vertical,
      this.currentY + horizontal,
    );
    while (southWest && southWest.getPiece() == 0) {
      this.moves.push(southWest);
      vertical++;
      horizontal++;
      southWest = this.curBoard.getSquare(
        this.currentX + vertical,
        this.currentY + horizontal,
      );
    }
    if (
      southWest &&
      southWest.getPiece() != 0 &&
      southWest.getPiece().color != this.color
    ) {
      this.captures.push(southWest);
    }
    console.log("valid moves: ");
    this.moves.forEach((move) => {
      console.log(move.getInfo());
    });
    console.log("valid captures: ");
    this.captures.forEach((move) => {
      console.log(move.getInfo());
    });
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
    let firstMovement = this.curBoard.getSquare(
      this.currentX + 2,
      this.currentY + 1,
    );
    let secondMovement = this.curBoard.getSquare(
      this.currentX + 1,
      this.currentY + 2,
    );
    let thirdMovement = this.curBoard.getSquare(
      this.currentX - 2,
      this.currentY + 1,
    );
    let fourthMovement = this.curBoard.getSquare(
      this.currentX - 1,
      this.currentY + 2,
    );
    let fifthMovement = this.curBoard.getSquare(
      this.currentX + 2,
      this.currentY - 1,
    );
    let sixthMovement = this.curBoard.getSquare(
      this.currentX + 1,
      this.currentY - 2,
    );
    let sevenMovement = this.curBoard.getSquare(
      this.currentX - 2,
      this.currentY - 1,
    );
    let eightMovement = this.curBoard.getSquare(
      this.currentX - 1,
      this.currentY - 2,
    );
    this.temp.push(firstMovement);
    this.temp.push(secondMovement);
    this.temp.push(thirdMovement);
    this.temp.push(fourthMovement);
    this.temp.push(fifthMovement);
    this.temp.push(sixthMovement);
    this.temp.push(sevenMovement);
    this.temp.push(eightMovement);
    this.temp.forEach((move) => {
      if (move && move.getPiece() == 0) {
        this.moves.push(move);
      } else if (
        move &&
        move.getPiece() != 0 &&
        move.getPiece().color != this.color
      ) {
        this.captures.push(move);
      }
    });
    console.log("valid moves: ");
    this.moves.forEach((move) => {
      console.log(move.getInfo());
    });
    console.log("valid captures: ");
    this.captures.forEach((move) => {
      console.log(move.getInfo());
    });
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
    let northEast = this.curBoard.getSquare(
      this.currentX + vertical,
      this.currentY + horizontal,
    );
    while (northEast && northEast.getPiece() == 0) {
      this.moves.push(northEast);
      vertical--;
      horizontal++;
      northEast = this.curBoard.getSquare(
        this.currentX + vertical,
        this.currentY + horizontal,
      );
    }
    if (
      northEast &&
      northEast.getPiece() != 0 &&
      northEast.getPiece().color != this.color
    ) {
      this.captures.push(northEast);
    }
    //NW
    vertical = -1;
    horizontal = -1;
    let northWest = this.curBoard.getSquare(
      this.currentX + vertical,
      this.currentY + horizontal,
    );
    while (northWest && northWest.getPiece() == 0) {
      this.moves.push(northWest);
      vertical--;
      horizontal--;
      northWest = this.curBoard.getSquare(
        this.currentX + vertical,
        this.currentY + horizontal,
      );
    }
    if (
      northWest &&
      northWest.getPiece() != 0 &&
      northWest.getPiece().color != this.color
    ) {
      this.captures.push(northWest);
    }
    //SE
    vertical = +1;
    horizontal = -1;
    let southEast = this.curBoard.getSquare(
      this.currentX + vertical,
      this.currentY + horizontal,
    );
    while (southEast && southEast.getPiece() == 0) {
      this.moves.push(southEast);
      vertical++;
      horizontal--;
      southEast = this.curBoard.getSquare(
        this.currentX + vertical,
        this.currentY + horizontal,
      );
    }
    if (
      southEast &&
      southEast.getPiece() != 0 &&
      southEast.getPiece().color != this.color
    ) {
      this.captures.push(southEast);
    }
    //SW
    vertical = +1;
    horizontal = +1;
    let southWest = this.curBoard.getSquare(
      this.currentX + vertical,
      this.currentY + horizontal,
    );
    while (southWest && southWest.getPiece() == 0) {
      this.moves.push(southWest);
      vertical++;
      horizontal++;
      southWest = this.curBoard.getSquare(
        this.currentX + vertical,
        this.currentY + horizontal,
      );
    }
    if (
      southWest &&
      southWest.getPiece() != 0 &&
      southWest.getPiece().color != this.color
    ) {
      this.captures.push(southWest);
    }

    //determine castle travel direction
    //can travel up and down as long as you dont hit a piece;
    let northOffset = -1;
    let north = this.curBoard.getSquare(
      this.currentX + northOffset,
      this.currentY,
    );
    while (north && north.getPiece() == 0) {
      this.moves.push(north);
      northOffset--;
      north = this.curBoard.getSquare(
        this.currentX + northOffset,
        this.currentY,
      );
    }
    if (
      north &&
      north.getPiece() != 0 &&
      north.getPiece().color != this.color
    ) {
      this.captures.push(north);
    }
    let southOffset = 1;
    let south = this.curBoard.getSquare(
      this.currentX + southOffset,
      this.currentY,
    );
    while (south && south.getPiece() == 0) {
      this.moves.push(south);
      southOffset++;
      south = this.curBoard.getSquare(
        this.currentX + southOffset,
        this.currentY,
      );
    }
    if (
      south &&
      south.getPiece() != 0 &&
      south.getPiece().color != this.color
    ) {
      this.captures.push(south);
    }
    let westOffset = -1;
    let west = this.curBoard.getSquare(
      this.currentX,
      this.currentY + westOffset,
    );
    while (west && west.getPiece() == 0) {
      this.moves.push(west);
      westOffset--;
      west = this.curBoard.getSquare(this.currentX, this.currentY + westOffset);
    }
    if (west && west.getPiece() != 0 && west.getPiece().color != this.color) {
      this.captures.push(west);
    }
    let eastOffset = 1;
    let east = this.curBoard.getSquare(
      this.currentX,
      this.currentY + eastOffset,
    );
    while (east && east.getPiece() == 0) {
      this.moves.push(east);
      eastOffset++;
      east = this.curBoard.getSquare(this.currentX, this.currentY + eastOffset);
    }
    if (east && east.getPiece() != 0 && east.getPiece().color != this.color) {
      this.captures.push(east);
    }

    console.log("valid moves: ");
    this.moves.forEach((move) => {
      console.log(move.getInfo());
    });
    console.log("valid captures: ");
    this.captures.forEach((move) => {
      console.log(move.getInfo());
    });
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
    let firstMovement = this.curBoard.getSquare(
      this.currentX + 1,
      this.currentY,
    );
    let secondMovement = this.curBoard.getSquare(
      this.currentX + 1,
      this.currentY + 1,
    );
    let thirdMovement = this.curBoard.getSquare(
      this.currentX,
      this.currentY + 1,
    );
    let fourthMovement = this.curBoard.getSquare(
      this.currentX,
      this.currentY - 1,
    );
    let fifthMovement = this.curBoard.getSquare(
      this.currentX - 1,
      this.currentY - 1,
    );
    let sixthMovement = this.curBoard.getSquare(
      this.currentX - 1,
      this.currentY,
    );
    let sevenMovement = this.curBoard.getSquare(
      this.currentX - 1,
      this.currentY + 1,
    );
    let eightMovement = this.curBoard.getSquare(
      this.currentX + 1,
      this.currentY - 1,
    );
    this.temp.push(firstMovement);
    this.temp.push(secondMovement);
    this.temp.push(thirdMovement);
    this.temp.push(fourthMovement);
    this.temp.push(fifthMovement);
    this.temp.push(sixthMovement);
    this.temp.push(sevenMovement);
    this.temp.push(eightMovement);
    this.temp.forEach((move) => {
      if (move && move.getPiece() == 0) {
        this.moves.push(move);
      } else if (
        move &&
        move.getPiece() != 0 &&
        move.getPiece().color != this.color
      ) {
        this.captures.push(move);
      }
    });
    console.log("valid moves: ");
    this.moves.forEach((move) => {
      console.log(move.getInfo());
    });
    console.log("valid captures: ");
    this.captures.forEach((move) => {
      console.log(move.getInfo());
    });
    return [this.moves, this.captures];
  }
}

export class Wizard extends Piece {
  constructor(square, color) {
    super(5, square, color);
  }
  validMoves() {
    this.currentSquare = this.curLocation;
    this.currentZ = this.currentSquare.z;
    this.curBoard = this.currentSquare.getBoard();

    this.temp = [];
    this.moves = [];
    this.currentX = this.currentSquare.x;
    this.currentY = this.currentSquare.y;
    let firstMovement = this.curBoard.getSquare(
      this.currentX + 1,
      this.currentY,
    );
    let secondMovement = this.curBoard.getSquare(
      this.currentX + 1,
      this.currentY + 1,
    );
    let thirdMovement = this.curBoard.getSquare(
      this.currentX,
      this.currentY + 1,
    );
    let fourthMovement = this.curBoard.getSquare(
      this.currentX,
      this.currentY - 1,
    );
    let fifthMovement = this.curBoard.getSquare(
      this.currentX - 1,
      this.currentY - 1,
    );
    let sixthMovement = this.curBoard.getSquare(
      this.currentX - 1,
      this.currentY,
    );
    let sevenMovement = this.curBoard.getSquare(
      this.currentX - 1,
      this.currentY + 1,
    );
    let eightMovement = this.curBoard.getSquare(
      this.currentX + 1,
      this.currentY - 1,
    );
    this.temp.push(firstMovement);
    this.temp.push(secondMovement);
    this.temp.push(thirdMovement);
    this.temp.push(fourthMovement);
    this.temp.push(fifthMovement);
    this.temp.push(sixthMovement);
    this.temp.push(sevenMovement);
    this.temp.push(eightMovement);
    this.temp.forEach((move) => {
      if (move && move.getPiece() == 0) {
        this.moves.push(move);
      }
    });
    console.log("valid moves: ");
    this.moves.forEach((move) => {
      console.log(move.getInfo());
    });
    return [this.moves, []];
  }
}
