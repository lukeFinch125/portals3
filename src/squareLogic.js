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
    const pieceInfo =
      this.pieceOnSquare && typeof this.pieceOnSquare === "object"
        ? this.pieceOnSquare.pieceNumber
        : this.pieceOnSquare;
    return `x: ${this.x} y: ${this.y} z: ${this.z} piece: ${pieceInfo}`;
  }

  getInfoForBoard() {
    if (
      this.getPortal() &&
      this.pieceOnSquare &&
      typeof this.pieceOnSquare === "object" &&
      typeof this.pieceOnSquare.getInfoForBoardUI === "function"
    ) {
      return `<span class="portal-piece">${this.pieceOnSquare.getInfoForBoardUI()}</span>`;
    } else if (this.getPortal()) {
      return `<span class="portal">0</span>`;
    }

    if (
      this.pieceOnSquare &&
      typeof this.pieceOnSquare === "object" &&
      typeof this.pieceOnSquare.getInfoForBoardUI === "function"
    ) {
      return this.pieceOnSquare.getInfoForBoardUI();
    }
    return `${this.pieceOnSquare}`;
  }
}
