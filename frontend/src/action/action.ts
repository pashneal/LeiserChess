import { PieceDescriptor} from "../game/piece";
import type { Board , Player} from "../game/board";
import type { RelativeRotation } from "../utils/spatial";
import { Direction , Position} from "../utils/spatial";
import {Laser} from "../laser/laser";

export interface Action {
  /*
   * Returns a new piece descriptor that is the result of applying the action on an input piece
   * @return the new piece descriptor
   */
  transformedPiece() : PieceDescriptor 

  /*
   * @return the position of the piece before the action
   */
  from() : Position

  /*
   * @return the position of the piece after the action
   */
  to() : Position

  /*
   * @return a string representation of the action, given the piece that is being moved
   */
  toString() : string

  /*
   * @return true if the action is valid, false otherwise
   */
  isValid() : boolean 

  /*
   * @param the board that the action is being applied to
   * @return mutate and return the board after the action is applied
   */
  appliedTo(board : Board) : Board

  /* 
   * @param player the player to check
   * @return true if the player matches the one moved by this action
   */
  matchPlayer( player : Player) : boolean  

  equals(action : Action) : boolean
}

// Represents the move action, that is, moving a piece from one position to another
// cannot move to the same position as another piece, nor its current position
export class Move implements Action {
  constructor(
    private fromPosition : Position, 
    private toPosition : Position, 
    private piece : PieceDescriptor
  ) {}

  transformedPiece() : PieceDescriptor {
    return this.piece;
  }

  from() : Position {
    return this.fromPosition;
  }

  to() : Position {
    return this.toPosition;
  }

  toString() : string {
    return this.fromPosition.toString() + this.toPosition.toString();
  }

  equals(action : Action) : boolean {
    return this.toString() === action.toString();
  }


  static fromString(actionString : string, piece : PieceDescriptor) : Move {
    let regex = /^([a-zA-Z]+)([0-9]+)([a-zA-Z]+)([0-9]+)$/;
    let match = actionString.match(regex);
    if (match === null) {
      throw new Error("Invalid Move string");
    }

    let fromPosition = Position.fromString(match[1]! + match[2]!);
    let toPosition = Position.fromString(match[3]! + match[4]!);

    return new Move(fromPosition, toPosition, piece);
  }

  isValid() : boolean {
    let isAdjacent = this.fromPosition.isAdjacentTo(this.toPosition);
    let isDistinct = !this.fromPosition.equals(this.toPosition);
    return isDistinct && isAdjacent;
  }

  appliedTo(board : Board ) : Board {
    let newBoard = board; 
    newBoard.setPiece(this.toPosition, this.piece);
    newBoard.clearPiece(this.fromPosition);
    return newBoard;
  }

  matchPlayer(player : Player): boolean{
    return this.piece.getColor() as Player == player;
  }
}

// Represent the Qi and Shoving mechanic 
export class Shove implements Action {
  constructor(
    private fromPosition : Position, 
    private toPosition : Position, 
    private piece : PieceDescriptor
  ) {}

  equals(action : Action) : boolean {
    return this.toString() === action.toString();
  }
  transformedPiece() : PieceDescriptor {
    return this.piece;
  }

  from() : Position {
    return this.fromPosition;
  }

  to() : Position {
    return this.toPosition;
  }

  toString() : string {
    return this.fromPosition.toString() + this.toPosition.toString();
  }


  static fromString(actionString : string, piece : PieceDescriptor) : Shove {
    let regex = /^([a-zA-Z]+)([0-9]+)([a-zA-Z]+)([0-9]+)$/;
    let match = actionString.match(regex);
    if (match === null) {
      throw new Error("Invalid Shove string");
    }

    let fromPosition = Position.fromString(match[1]! + match[2]!);
    let toPosition = Position.fromString(match[3]! + match[4]!);

    return new Shove(fromPosition, toPosition, piece);
  }

  isValid() : boolean {
    let isAdjacent = this.fromPosition.isAdjacentTo(this.toPosition);
    let isDistinct = !this.fromPosition.equals(this.toPosition);
    return isDistinct && isAdjacent;
  }

  appliedTo(board : Board ) : Board {
    let newBoard = board; 
    let shovedPiece = newBoard.getPiece(this.toPosition);
    let dx = this.toPosition.getX() - this.fromPosition.getX();
    let dy = this.toPosition.getY() - this.fromPosition.getY();
    let newShovedPosition = new Position(this.toPosition.getX() + dx, this.toPosition.getY() + dy);
    if (newShovedPosition.isWithinBounds()) {
      if (newBoard.getPiece(newShovedPosition).isEmpty()) {
        newBoard.setPiece(newShovedPosition, shovedPiece);
      }
    }
    newBoard.setPiece(this.toPosition, this.piece);
    newBoard.clearPiece(this.fromPosition);
    return newBoard;
  }

  matchPlayer(player : Player): boolean{
    return this.piece.getColor() as Player == player;
  }
}


// Represents the rotation action, that is, rotating a piece in place
export class Rotation implements Action {
  constructor(private fromPosition: Position, private newDirection : Direction, private piece : PieceDescriptor) {}
  equals(action : Action) : boolean {
    return this.toString() === action.toString();
  }

  static fromString(actionString : string, piece : PieceDescriptor) : Rotation {
    let regex = /^([a-zA-Z]+)([0-9]+)(U|L|R)$/;
    let match = actionString.match(regex);
    if (match === null) {
      throw new Error("Invalid Rotation string");
    }

    let fromPosition =  Position.fromString(match[1]! + match[2]!);
    let relativeRotation = match[3] as RelativeRotation;
    let newDirection = piece.getDirection().rotatedBy(relativeRotation);
    return new Rotation(fromPosition, newDirection, piece);
  }

  transformedPiece() : PieceDescriptor {
    let piece = new PieceDescriptor(
      this.piece.getType(), 
      this.piece.getColor(), 
      this.newDirection
    );
    piece.setUid(this.piece.id());
    return piece;
  }

  from() : Position {
    return this.fromPosition;
  }

  to() : Position {
    return this.fromPosition;
  }

  toString() : string {
    let oldDirection = this.piece.getDirection();
    let relativeRotation = this.newDirection.relativeRotationTo(oldDirection);
    if (relativeRotation === null) {
      throw new Error("Invalid rotation, cannot rotate to the same direction");
    }
    return this.fromPosition.toString() + relativeRotation;
  }

  isValid() : boolean {
    // Piece rotation different from current rotation
    return !this.piece.getDirection().equals(this.newDirection);
  }

  appliedTo(board : Board) : Board{
    let newBoard = board; 
    newBoard.setPiece(this.fromPosition, this.transformedPiece());
    return newBoard;
  }

  matchPlayer(player : Player): boolean{
    return this.piece.getColor() as Player == player;
  }
}

// Represents the Null Move action, that is, when the queen does absolutely nothing
export class NullMove implements Action {
  constructor(
    private fromPosition : Position, 
    private toPosition : Position, 
    private piece : PieceDescriptor
  ) {}

  equals(action : Action) : boolean {
    return this.toString() === action.toString();
  }
  transformedPiece() : PieceDescriptor {
    return this.piece;
  }

  from() : Position {
    return this.fromPosition;
  }

  to() : Position {
    return this.toPosition;
  }

  toString() : string {
    return this.fromPosition.toString() + this.toPosition.toString();
  }


  static fromString(actionString : string, piece : PieceDescriptor) : NullMove {
    let regex = /^([a-zA-Z]+)([0-9]+)([a-zA-Z]+)([0-9]+)$/;
    let match = actionString.match(regex);
    if (match === null) {
      throw new Error("Invalid Move string");
    }

    let fromPosition = Position.fromString(match[1]! + match[2]!);
    let toPosition = Position.fromString(match[3]! + match[4]!);

    return new NullMove(fromPosition, toPosition, piece);
  }

  isValid() : boolean {
    let isTheSame = this.fromPosition.equals(this.toPosition);
    return isTheSame;
  }

  appliedTo(board : Board ) : Board {
    return board;
  }

  matchPlayer(player : Player): boolean{
    return this.piece.getColor() as Player == player;
  }
}
