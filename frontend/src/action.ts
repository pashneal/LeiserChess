import { PieceDescriptor} from './piece';
import type { RelativeRotation } from './spatialUtils';
import { Direction , Position} from './spatialUtils';


type Board  = Array<Array<PieceDescriptor | null>>;


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
   * @return the board after the action is applied
   */
  appliedTo(board : Board) : Board
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
    newBoard[this.toPosition.getY()]![this.toPosition.getX()] = this.piece;
    newBoard[this.fromPosition.getY()]![this.fromPosition.getX()] = null;
    return newBoard;
  }
}


export class Rotation implements Action {
  constructor(private fromPosition: Position, private newDirection : Direction, private piece : PieceDescriptor) {}

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
      this.piece.getPieceType(), 
      this.piece.getPieceColor(), 
      this.newDirection
    );
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

  appliedTo(board : PieceDescriptor[][]) : PieceDescriptor[][] {
    let newBoard = board; 
    newBoard[this.fromPosition.getY()]![this.fromPosition.getX()] = this.transformedPiece();
    return newBoard;
  }
}

// Represents the swap action, that is, moving a piece from one position to another, but 
// there is a piece at the destination position
export class Swap implements Action {
  constructor(
    private fromPosition : Position, 
    private toPosition : Position, 
    private sourcePiece : PieceDescriptor,
    private targetPiece : PieceDescriptor
  ) {}

  transformedPiece() : PieceDescriptor {
    return this.sourcePiece;
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


  static fromString(actionString : string, sourcePiece : PieceDescriptor, targetPiece: PieceDescriptor) : Swap {
    let regex = /^([a-zA-Z]+)([0-9]+)([a-zA-Z]+)([0-9]+)$/;
    let match = actionString.match(regex);
    if (match === null) {
      throw new Error("Invalid Move string");
    }

    let fromPosition = Position.fromString(match[1]! + match[2]!);
    let toPosition = Position.fromString(match[3]! + match[4]!);

    return new Swap(fromPosition, toPosition, sourcePiece, targetPiece); 
  }

  isValid() : boolean {
    let isAdjacent = this.fromPosition.isAdjacentTo(this.toPosition);
    let isDistinct = !this.fromPosition.equals(this.toPosition);
    return isDistinct && isAdjacent;
  }

  appliedTo(board : Board ) : Board {
    let newBoard = board; 
    newBoard[this.toPosition.getY()]![this.toPosition.getX()] = this.sourcePiece;
    newBoard[this.fromPosition.getY()]![this.fromPosition.getX()] = this.targetPiece;
    return newBoard;
  }
}
