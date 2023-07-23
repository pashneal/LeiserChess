import { BOARD_SIZE } from "../constants";

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

  getDifference(other : Position) : [number, number] {
    return [this.x - other.x, this.y - other.y];
  }

  equals(other : Position | null) : boolean {
    if  (other === null) { return false; }
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
    let regex = RegExp("[a-zA-Z]+[1-9][0-9]*$");
    if (!regex.test(positionString)) {
      throw new Error("Invalid position string");
    }
    
    // Parse letter part
    let letterPart = positionString.match(/[a-zA-Z]+/)!;
    let match = letterPart[0]!;
    // Convert to number
    let x = 0;
    for (let i = 0; i < match.length; i++) {
      x *= 26;
      x += match.charCodeAt(i) - 'a'.charCodeAt(0);
    }

    // Parse number part
    let numberPart = positionString.match(/[0-9]+/)!;
    let y = parseInt(numberPart[0]) - 1;

    return new Position(x, y);
  }

  toString() : string {
    let x = this.x;
    let y = this.y;
    let letterPart = "";
    let numberPart = "";

    while (x >= 0) {
      letterPart = String.fromCharCode('a'.charCodeAt(0) + (x % 26)) + letterPart;
      x = Math.floor(x / 26) - 1;
    }

    numberPart = (y + 1).toString();

    return letterPart + numberPart;
  }

}

// Sanity checks for Position
console.assert(Position.fromString("a1").toString() === "a1");
console.assert(Position.fromString("a2").getX() === 0);
console.assert(Position.fromString("b4").getY() === 3);

export type RelativeRotation = "U" | "L" | "R";

export class Direction { 
  direction : string = "";
  allowedDirections : Array<string> = [];
  rotatedDirectionMap : Map<string, string> = new Map<string, string>();

  copy() : this {
    throw new Error("Cannot copy a Direction, did you mean to create a subclass?");
  }

  constructor(direction: string) {
    this.direction = direction;
  }

  rotatedClockwise() : this {
    let newDirection = this.copy();
    newDirection.direction = this.rotatedDirectionMap.get(this.direction)!;
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
    throw new Error("Directions are not orthogonal");
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

  equals(other : this | null) : boolean {
    if (other === null) { return  false; }
    return this.direction === other.direction;
  }

  decompose() : [Direction, Direction] {
    throw new Error("Cannot decompose this direction into new directions");
  }

  appliedTo( position : Position ) : Position {
    switch ( this.direction ) {
      case "north-east":
        return new Position( position.getX() + 1, position.getY() - 1);
      case "north-west":
        return new Position( position.getX() - 1, position.getY() + 1);
      case "south-east":
        return new Position( position.getX() + 1, position.getY() + 1);
      case "south-west":
        return new Position( position.getX() - 1, position.getY() - 1);
      case "north":
        return new Position( position.getX(), position.getY() - 1);
      case "south":
        return new Position( position.getX(), position.getY() + 1);
      case "east":
        return new Position( position.getX() + 1, position.getY());
      case "west":
        return new Position( position.getX() - 1, position.getY());
    }

    throw new Error("Invalid direction");
  }
}

export class QueenDirection extends Direction {
  override allowedDirections = ["north", "south", "east", "west"];
  override rotatedDirectionMap : Map<string, string> = new Map<string, string>(
    [["north" , "east"],
    ["east" , "south"],
    ["south" , "west"],
    ["west" , "north"]]
  )
  override copy() : this {
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
  override allowedDirections = ["north-east", "north-west", "south-east", "south-west"];
  override rotatedDirectionMap = new Map<string, string>(
    [["north-east" , "south-east"],
    ["south-east" , "south-west"],
    ["south-west" , "north-west"],
    ["north-west" , "north-east"]]
  )

  override copy() : this {
    return new PawnDirection(this.direction) as this;
  }
  constructor(direction : string) {
    super(direction);
    if (!this.allowedDirections.includes(direction) ) {
      throw new Error("Invalid Direction for this type: " + direction +
                     "Allowed directions: " + this.allowedDirections.join(", "));
    }
  }
  override decompose() : [Direction, Direction] {
    switch (this.direction) {
      case "north-east":
        return [new QueenDirection("north"), new QueenDirection("east")]
      case "north-west":
        return [new QueenDirection("north"), new QueenDirection("west")]
      case "south-west":
        return [new QueenDirection("south"), new QueenDirection("west")]
      case "south-east":
        return [new QueenDirection("south"), new QueenDirection("east")]
    };
    throw new Error("Something bizzare happened -  direction not found");
  }
}

