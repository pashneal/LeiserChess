export type QueenDirection = "north" | "south" | "east" | "west";
export type PawnDirection = "north-east" | "north-west" | "south-east" | "south-west";
export type Direction = QueenDirection | PawnDirection;
export type PieceType = "queen" | "pawn";
export type PieceColor = "light" | "dark";


export class PieceDescriptor {
  private pieceType : PieceType;
  private direction : PawnDirection | QueenDirection;
  private pieceColor : PieceColor;

  constructor(pieceType : PieceType, color : PieceColor, direction : Direction | null ) {
    this.pieceType = pieceType;
    this.direction = direction;
    this.pieceColor = color;

  }

  static fromString(pieceString : string) : PieceDescriptor {
    throw new Error("Not implemented Yet");
  }

  toString() : string {
    throw new Error("Not implemented Yet");
  }


  pawn() : PieceDescriptor {
    return new PieceDescriptor("pawn", this.pieceColor, this.direction);
  }

  queen() : PieceDescriptor {
    return new PieceDescriptor("queen", this.pieceColor, this.direction);
  }

  static light() : PieceDescriptor {
    return new PieceDescriptor("queen", "light", null);
  }

  static dark() : PieceDescriptor {
    return new PieceDescriptor("queen", "dark", null);
  }

  nw() : PieceDescriptor {
    //assert(this.pieceType == "pawn");
    return new PieceDescriptor(this.pieceType, this.pieceColor, "north-west");
  }

  sw() : PieceDescriptor {
    //assert(this.pieceType == "pawn");
    return new PieceDescriptor(this.pieceType, this.pieceColor, "south-west");
  }

  ne() : PieceDescriptor {
    //assert(this.pieceType == "pawn");
    return new PieceDescriptor(this.pieceType, this.pieceColor, "north-east");
  }

  se() : PieceDescriptor {
    //assert(this.pieceType == "pawn");
    return new PieceDescriptor(this.pieceType, this.pieceColor, "south-east");
  }

  north() : PieceDescriptor {
    //assert(this.pieceType == "queen");
    return new PieceDescriptor(this.pieceType, this.pieceColor, "north");
  }

  south() : PieceDescriptor {
    //assert(this.pieceType == "queen");
    return new PieceDescriptor(this.pieceType, this.pieceColor, "south");
  }

  east() : PieceDescriptor {
    //assert(this.pieceType == "queen");
    return new PieceDescriptor(this.pieceType, this.pieceColor, "east");
  }

  west() : PieceDescriptor {
    //assert(this.pieceType == "queen");
    return new PieceDescriptor(this.pieceType, this.pieceColor, "west");
  }

}
