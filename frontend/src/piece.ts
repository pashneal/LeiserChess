export type QueenDirection = "north" | "south" | "east" | "west";
export type PawnDirection = "north-east" | "north-west" | "south-east" | "south-west";
export type Direction = QueenDirection | PawnDirection;
export type PieceType = "queen" | "pawn";
export type PieceColor = "light" | "dark";


export class PieceDescriptor {
  private pieceType : PieceType;
  private direction : PawnDirection | QueenDirection;
  private pieceColor : PieceColor;

  constructor(pieceType : PieceType, color : PieceColor, direction : PawnDirection | QueenDirection | null ) {
    this.pieceType = pieceType;
    this.direction = direction;
    this.pieceColor = color;
  }

  getDirection() : PawnDirection | QueenDirection {
    if (this.direction == null) {
      throw new Error("Cannot get direction of a piece that doesn't have a direction");
    }
    return this.direction;
  }

  getPieceType() : PieceType {
    return this.pieceType;
  }

  getPieceColor() : PieceColor {
    return this.pieceColor;
  }


  static fromString(pieceString : string) : PieceDescriptor {
    return fen(pieceString);
  }

  toString() : string {
    let lowercase = this.pieceColor == "dark";
    let direction : string;
    let composedString : string  = "";

    switch(this.direction) {
      case "north":
        direction = "N";
        break;
      case "south":
        direction = "S";
        break;
      case "east":
        direction = "E";
        break;
      case "west":
        direction = "W";
        break;
      case "north-east":
        direction = "NE";
        break;
      case "north-west":
        direction = "NW";
        break;
      case "south-east":
        direction = "SE";
        break;
      case "south-west":
        direction = "SW";
        break;
    }

    switch(this.pieceType) {
      case "queen":
        composedString += direction + direction;
        break;
      case "pawn":
        composedString += direction;
        break;
    }

    if(lowercase) {
      composedString = composedString.toLowerCase();
    }

    return composedString;

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

  rotateClockwise() : PieceDescriptor {
    let newDirection : Direction;
    switch(this.direction) {
      case "north":
        newDirection = "east";
        break;
      case "east":
        newDirection = "south";
        break;
      case "south":
        newDirection = "west";
        break;
      case "west":
        newDirection = "north";
        break;
      case "north-east":
        newDirection = "south-east";
        break;
      case "south-east":
        newDirection = "south-west";
        break;
      case "south-west":
        newDirection = "north-west";
        break;
      case "north-west":
        newDirection = "north-east";
        break;
      default:
        throw new Error("Cannot rotate on Invalid Direction");
    }
    return new PieceDescriptor(this.pieceType, this.pieceColor, newDirection);
  }

  rotateCounterClockwise() : PieceDescriptor {
    let newDirection : Direction;
    switch(this.direction) {
      case "north":
        newDirection = "west";
        break;
      case "east":
        newDirection = "north";
        break;
      case "south":
        newDirection = "east";
        break;
      case "west":
        newDirection = "south";
        break;
      case "north-east":
        newDirection = "north-west";
        break;
      case "south-east":
        newDirection = "north-east";
        break;
      case "south-west":
        newDirection = "south-east";
        break;
      case "north-west":
        newDirection = "south-west";
        break;
    }

    return new PieceDescriptor(this.pieceType, this.pieceColor, newDirection);
  }

}

export function fen(descriptor : string | null) {
  if (descriptor == null) {
    return null
  }
  if (descriptor == "NN") {
    return PieceDescriptor.light().queen().north()
  }
  if (descriptor == "SS") {
    return PieceDescriptor.light().queen().south()
  }
  if (descriptor == "EE") {
    return PieceDescriptor.light().queen().east()
  }
  if (descriptor == "WW") {
    return PieceDescriptor.light().queen().west()
  }
  if (descriptor == "nn") {
    return PieceDescriptor.dark().queen().north()
  }
  if (descriptor == "ss") {
    return PieceDescriptor.dark().queen().south()
  }
  if (descriptor == "ww") {
    return PieceDescriptor.dark().queen().west()
  }
  if (descriptor == "ee") {
    return PieceDescriptor.dark().queen().east()
  }
  if (descriptor == "NW") {
    return PieceDescriptor.light().pawn().nw()
  }
  if (descriptor == "NE") {
    return PieceDescriptor.light().pawn().ne()
  }
  if (descriptor == "SW") {
    return PieceDescriptor.light().pawn().sw()
  }
  if (descriptor == "SE") {
    return PieceDescriptor.light().pawn().se()
  }
  if (descriptor == "se") {
    return PieceDescriptor.dark().pawn().se()
  }
  if (descriptor == "sw") {
    return PieceDescriptor.dark().pawn().sw()
  }
  if (descriptor == "ne") {
    return PieceDescriptor.dark().pawn().ne()
  }
  if (descriptor == "nw") {
    return PieceDescriptor.dark().pawn().nw()
  }
  return null
}

