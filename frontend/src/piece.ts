export type PieceType = "queen" | "pawn";
export type PieceColor = "light" | "dark";
import type { Position , Direction } from './spatialUtils';
import {PawnDirection, QueenDirection} from './spatialUtils';


export class PieceDescriptor {
  private pieceType : PieceType;
  private direction : Direction | null;
  private pieceColor : PieceColor;

  constructor(pieceType : PieceType, color : PieceColor, direction : Direction | null ) {
    this.pieceType = pieceType;
    this.direction = direction;
    this.pieceColor = color;
  }

  getDirection() : Direction {
    if (this.direction === null) {
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

  rotateClockwise() : PieceDescriptor {
    let newDirection  = this.direction!.rotatedClockwise();
    return new PieceDescriptor(this.pieceType, this.pieceColor, newDirection);
  }

  rotateCounterClockwise() : PieceDescriptor {
    let newDirection  = this.direction!.rotatedCounterClockwise();
    return new PieceDescriptor(this.pieceType, this.pieceColor, newDirection);
  }

  rotated180() : PieceDescriptor {
    let newDirection  = this.direction!.rotated180();
    return new PieceDescriptor(this.pieceType, this.pieceColor, newDirection);
  }

  static fromString(pieceString : string) : PieceDescriptor {
    return fen(pieceString)!;
  }

  toString() : string {
    let lowercase = this.pieceColor === "dark";
    let direction : string;
    let composedString : string  = "";

    switch(this.direction!.toString()) {
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

    direction = direction!;
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
    //assert(this.pieceType === "pawn");
    return new PieceDescriptor(
      this.pieceType, 
      this.pieceColor, 
      new PawnDirection("north-west")
    );
  }

  sw() : PieceDescriptor {
    //assert(this.pieceType === "pawn");
    return new PieceDescriptor(
      this.pieceType, 
      this.pieceColor, 
      new PawnDirection("south-west")
    );
  }

  ne() : PieceDescriptor {
    //assert(this.pieceType === "pawn");
    return new PieceDescriptor(
      this.pieceType, 
      this.pieceColor, 
      new PawnDirection("north-east")
    );
  }

  se() : PieceDescriptor {
    return new PieceDescriptor(
      this.pieceType,
      this.pieceColor,
      new PawnDirection("south-east")
    );
  }

  north() : PieceDescriptor {
    //assert(this.pieceType === "queen");
    return new PieceDescriptor(
      this.pieceType,
      this.pieceColor,
      new QueenDirection("north")
    );
  }

  south() : PieceDescriptor {
    //assert(this.pieceType === "queen");
    return new PieceDescriptor(
      this.pieceType, 
      this.pieceColor, 
      new QueenDirection("south")
    );
  }

  east() : PieceDescriptor {
    //assert(this.pieceType === "queen");
    return new PieceDescriptor(
      this.pieceType,
      this.pieceColor,
      new QueenDirection("east")
    );
  }

  west() : PieceDescriptor {
    //assert(this.pieceType === "queen");
    return new PieceDescriptor(
      this.pieceType,
      this.pieceColor,
      new QueenDirection("west")
    );
  }

  // Based on piece and current orientation, 
  // choose how to reflect an incoming laser
  // return null if laser cannot be reflected
  reflect(incoming : Direction) : Direction | null {
    if (this.getPieceType() === "queen") {
      // Queens can't reflect incoming lasers
      return null;
    }

    // Pawns can reflect lasers if they bounce of the mirror face
    // The laser must be incoming opposite to one of the faceDirections
    let direction = this.getDirection();
    let faceDirections = direction.decompose();
    let matchingDirection  = faceDirections.find( 
          (direction) => direction.equals(incoming.rotated180()) 
    );
    if (!matchingDirection) { return null; }

    // Get the other value from the decomposition, that is the laser's new direction
    let reflection = faceDirections.find( (value) => !value.equals(matchingDirection!))!
    return reflection;
  }
}


export function fen(descriptor : string | null) {
  if (descriptor === null) {
    return null
  }
  if (descriptor === "NN") {
    return PieceDescriptor.light().queen().north()
  }
  if (descriptor === "SS") {
    return PieceDescriptor.light().queen().south()
  }
  if (descriptor === "EE") {
    return PieceDescriptor.light().queen().east()
  }
  if (descriptor === "WW") {
    return PieceDescriptor.light().queen().west()
  }
  if (descriptor === "nn") {
    return PieceDescriptor.dark().queen().north()
  }
  if (descriptor === "ss") {
    return PieceDescriptor.dark().queen().south()
  }
  if (descriptor === "ww") {
    return PieceDescriptor.dark().queen().west()
  }
  if (descriptor === "ee") {
    return PieceDescriptor.dark().queen().east()
  }
  if (descriptor === "NW") {
    return PieceDescriptor.light().pawn().nw()
  }
  if (descriptor === "NE") {
    return PieceDescriptor.light().pawn().ne()
  }
  if (descriptor === "SW") {
    return PieceDescriptor.light().pawn().sw()
  }
  if (descriptor === "SE") {
    return PieceDescriptor.light().pawn().se()
  }
  if (descriptor === "se") {
    return PieceDescriptor.dark().pawn().se()
  }
  if (descriptor === "sw") {
    return PieceDescriptor.dark().pawn().sw()
  }
  if (descriptor === "ne") {
    return PieceDescriptor.dark().pawn().ne()
  }
  if (descriptor === "nw") {
    return PieceDescriptor.dark().pawn().nw()
  }
  return null
}


