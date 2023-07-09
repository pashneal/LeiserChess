import { BOARD_SIZE } from "./constants";

// Guards against invalid positions
export class Position  {
  private x : number;
  private y : number;

  constructor(x : number, y : number) {
    this.x = x;
    this.y = y;
  }

  getX() : number {
    return this.x;
  }

  getY() : number {
    return this.y;
  }

  toArray() : [number, number] {
    return [this.x, this.y];
  }

  equals(other : Position) : boolean {
    return this.x === other.x && this.y === other.y;
  }

  isAdjacentTo(other : Position) : boolean {
    return Math.abs(this.x - other.x) <= 1 && Math.abs(this.y - other.y) <= 1;
  }

  isWithinBounds() : boolean {
    return this.x >= 0 && this.x < BOARD_SIZE && this.y >= 0 && this.y < BOARD_SIZE;
  }

  static fromString(positionString : string) : Position {
    // Must be in the form of some letters followed by a number
    // Verified by regex (and extensible to larger boards if necessary)
    let regex = RegExp("[a-ZA-Z]+[1-9][0-9]*$");
    if (!regex.test(positionString)) {
      throw new Error("Invalid position string");
    }
    
    // Parse letter part
    let letterPart = positionString.match(/[a-zA-Z]+/);
    // Convert to number
    let x = 0;
    for (let i = 0; i < letterPart[0].length; i++) {
      x *= 26;
      x += letterPart[0].charCodeAt(i) - 'a'.charCodeAt(0) + 1;
    }

    // Parse number part
    let numberPart = positionString.match(/[0-9]+/);
    let y = parseInt(numberPart[0]);

    return new Position(x, y);
  }

  toString() : string {
    let x = this.x;
    let y = this.y;
    let letterPart = "";
    let numberPart = "";

    while (x > 0) {
      letterPart += String.fromCharCode('a'.charCodeAt(0) + (x - 1) % 26);
      x = Math.floor(x / 26);
    }

    numberPart = y.toString();

    return letterPart + numberPart;
  }
}

export type RelativeRotation = "U" | "L" | "R";

export class Direction { 
  allowedDirections = [];
  direction : string;
  rotatedDirectionMap = {};
  copy() : this {
    throw new Error("Cannot copy a Direction, did you mean to create a subclass?");
  }

  constructor(direction: string) {
    this.direction = direction;
  }

  rotatedClockwise() : this {
    let newDirection = this.copy();
    newDirection.direction = this.rotatedDirectionMap[this.direction];
    return newDirection;
  }

  rotatedCounterClockwise() : this {
    let newDirection = this.copy();
    newDirection = newDirection.rotatedClockwise();
    newDirection = newDirection.rotatedClockwise();
    newDirection = newDirection.rotatedClockwise();
    return newDirection;
  }

  rotated180() : this {
    let newDirection = this.copy();
    newDirection = newDirection.rotatedClockwise();
    newDirection = newDirection.rotatedClockwise();
    return newDirection;
  }

  relativeRotationTo(other : this) : RelativeRotation | null {

    if (this.direction === other.direction) {
      return null;
    } else if (this.rotatedClockwise().direction === other.direction) {
      return "R" as RelativeRotation;
    } else if (this.rotatedCounterClockwise().direction === other.direction) {
      return "L" as RelativeRotation;
    } else if (this.rotated180().direction === other.direction) {
      return "U" as RelativeRotation;
    }
  }

  rotatedBy(relativeRotation : RelativeRotation) : this {
    switch(relativeRotation) {
      case "U":
        return this.rotated180();
      case "L":
        return this.rotatedCounterClockwise();
      case "R":
        return this.rotatedClockwise();
    }
  }

  toString() : string {
    return this.direction;
  }

  equals(other : this) : boolean {
    return this.direction === other.direction;
  }
}

export class QueenDirection extends Direction {
  direction : string;
  allowedDirections = ["north", "south", "east", "west"];
  rotatedDirectionMap = {
    "north" : "east",
    "east" : "south",
    "south" : "west",
    "west" : "north"
  }
  copy() : this {
    return new QueenDirection(this.direction) as this;
  }
  constructor(direction : string) {
    super(direction);
    if (!this.allowedDirections.includes(direction) ) {
      throw new Error("Invalid Direction for this type: " + direction +
                     "Allowed directions: " + this.allowedDirections.join(", "));
    }
  }
}


export class PawnDirection extends Direction {
  direction : string;
  allowedDirections = ["north-east", "north-west", "south-east", "south-west"];
  rotatedDirectionMap = {
    "north-east" : "south-east",
    "south-east" : "south-west",
    "south-west" : "north-west",
    "north-west" : "north-east"
  }
  copy() : this {
    return new PawnDirection(this.direction) as this;
  }
  constructor(direction : string) {
    super(direction);
    if (!this.allowedDirections.includes(direction) ) {
      throw new Error("Invalid Direction for this type: " + direction +
                     "Allowed directions: " + this.allowedDirections.join(", "));
    }
  }
}

