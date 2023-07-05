import { PieceDescriptor } from "./piece";
import type { Direction } from "./piece";
import { parseBoard } from "./parser";


export const BOARD_SIZE = 8;
export type Move = [[number, number] , [number, number]]
export type Rotate = [Direction, Direction]


export class BoardState {
  private board : PieceDescriptor[][];
  private history : Array<String> 

  private constructor() {
    this.board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      this.board[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.board[i][j] = null;
      }
    }
  }

  static fromFEN(fenString : string) {
     let boardState = new BoardState();
     boardState.board = parseBoard(fenString);
     boardState.history = [boardState.toFEN()];
     return boardState;
  }

  toFEN() : string {
    let runningBlanks = 0;
    let fenString = ""; 

    for (let row of this.board) {
      for (let piece of row) {

        if (piece == null) {
          runningBlanks++;
        } else {
          if (runningBlanks > 0) {
            fenString += runningBlanks;
            runningBlanks = 0;
          }
          fenString += piece.toString();
        }
      }

      if (runningBlanks > 0) {
        fenString += runningBlanks;
        runningBlanks = 0;
      }

      fenString += "/";
    }
    return fenString.slice(0, -1);
  }

  getPiece([x,y] : [number, number]) : PieceDescriptor | null {
    return this.board[x][y];
  }

  private setPiece([x,y] : [number, number], piece : PieceDescriptor | null) {
    this.board[x][y] = piece;
  }


  // Returns a copy of the board state's internals
  toArray() : PieceDescriptor[][] {
    let boardState = BoardState.fromFEN(this.toFEN());
    return boardState.board;
  }


  // Only allow legal rotations and moves which change the game state
  // Also observe the Ko rule
  movePiece( move : Move ){
    console.assert( move[0][0] >= 0 && move[0][0] < BOARD_SIZE && move[0][1] >= 0 && move[0][1] < BOARD_SIZE, "x and y must be between 0 and 7");

    if (this.getPiece(move[0]) === null)  {
      throw new Error("There must be a piece at the location to move");
    }
    const thisPiece = this.getPiece(move[0]);
    const thatPiece = this.getPiece(move[1]);
    this.setPiece(move[0], thatPiece);
    this.setPiece(move[1], thisPiece);
    // Check that FEN is not in past 2 moves
    this.history.slice(-2).forEach( (fen) => {
      if (fen == this.toFEN()) {
        // Revert move
        this.setPiece(move[0], thisPiece);
        this.setPiece(move[1], thatPiece);

        throw new Error("Cannot repeat a board state within the past 2 moves");
      }
    });


    // Game state is valid, commit to history
    this.history.push(this.toFEN());
  }

  // Only allow legal rotations and moves which change the game state
  rotatePiece([x,y] : [number,number], newDirection : Direction)  {
    let piece = this.getPiece([x,y]);

    console.assert( x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE, "x and y must be between 0 and 7");

    if( newDirection == piece.getDirection())  {
      throw new Error("Rotation must change the orientation of the piece");
    }
    if (this.getPiece([x,y]) === null)  {
      throw new Error("There must be a piece at the location to rotate");
    }


    if (piece.getPieceType() == "queen"){
      console.assert( newDirection  in ["north", "south", "east", "west"], "Queen can only rotate to cardinal directions");
    }

    if (piece.getPieceType() == "queen"){
      console.assert( newDirection  in ["north-east", "north-west", "south-east", "south-west"], "Pawn can only rotate to diagonal directions");
    }

    let newPiece = new PieceDescriptor(piece.getPieceType(), piece.getPieceColor(), newDirection);
    this.setPiece([x,y], newPiece);

    // Game state is valid, commit to history
    this.history.push(this.toFEN());
  }

  copy() : BoardState {
    let board = BoardState.fromFEN(this.toFEN());
    board.history = this.history.slice();
    return board;
  }

} 


class MoveSelector {
  private board : BoardState;
  private selectedSquare : [number, number] | null = null;
  private moveQueue : [[number, number], [number, number]] | null = null;
  private rotateQueue : [[number, number], Direction] | null = null;


  constructor( newBoard : BoardState ) {
    this.board = newBoard.copy(); 
  }

  queueMove( newPosition : [number, number]) {
    if (this.selectedSquare == null) {
      throw new Error("Cannot queue move when no square is selected");
    }

    this.moveQueue = [this.selectedSquare, newPosition];
    this.rotateQueue = null;
  }
  queueRotateCW() {
    if (this.selectedSquare == null) {
      throw new Error("Cannot queue move when no square is selected");
    }

    let position = this.selectedSquare ;
    let rotatedPiece = this.board.getPiece(position).rotateClockwise();
    this.rotateQueue = [position, rotatedPiece.getDirection()];
  }
  queueRotation( newDirection : Direction) {
    this.moveQueue = null;
    if (this.selectedSquare == null) {
      throw new Error("Cannot queue move when no square is selected");
    }

    let position = this.selectedSquare;

    if (newDirection == this.board.getPiece(position).getDirection()) {
      this.rotateQueue = null;
    } else {
      this.rotateQueue = [position, newDirection];
    }
  }

  dequeue() {
    this.moveQueue = null;
    this.rotateQueue = null;
  }

  commitQueue() {
    if (this.moveQueue != null) {
      this.board.movePiece(this.moveQueue);
    } else if (this.rotateQueue != null) {
      this.board.rotatePiece(this.rotateQueue[0], this.rotateQueue[1]);
    } else {
      throw new Error("Cannot commit queue when there is nothing in the queue");
    }

    this.dequeue();
  }

  selectSquare(position : [number, number]) {
    if (this.selectedSquare != null) {
      throw new Error("Cannot select a square when one is already selected");
    }
    this.selectedSquare = position;
  }

  deselectSquare() {
    if (this.selectedSquare == null) {
      throw new Error("Cannot deselect a square when one is not selected");
    }
    this.selectedSquare = null;
    this.dequeue();
  }

  getSelectedSquare() : [number, number] | null {
    return this.selectedSquare;
  }

  getPotentialMoves() : Move[] {
    let currentPos = this.getSelectedSquare();
    console.assert(currentPos !== null, "Square is not selected yet");

    let potentialMoves = [];
    for (let dx = -1 ; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx == 0 && dy == 0) {
          continue;
        }
        let move = [currentPos[0] + dx, currentPos[1] + dy];
        if (move[0] >= 0 && move[0] < BOARD_SIZE && move[1] >= 0 && move[1] < BOARD_SIZE) {
          potentialMoves.push([currentPos, move]);
        }

      }
    }

    // Remove moves if there is a rotation queued
    if (this.rotateQueue != null) {
      return [];
    }

    // Remove any moves that are illegal 
    let legalMoves = [];
    potentialMoves.forEach( (move) => {
      let boardCopy = BoardState.fromFEN(this.board.toFEN());
      try {
        boardCopy.movePiece(move);
        legalMoves.push(move);
      } catch (e) {
        return
      }
    });

    return legalMoves;
  }

  getPiece(position : [number, number]) : PieceDescriptor | null {
    return this.board.getPiece(position);
  }

  toBoard() : BoardState {
    return this.board;
  }

}

enum Highlight {
  MAIN,
  SECONDARY,
  NONE
}

// Helps the UI figure out where to highlight using some move selector
class Highlighter {
  private moveSelector : MoveSelector;
  private highlightSquares : Highlight[][];

  constructor(board : BoardState) {
    this.moveSelector = new MoveSelector(board);
    this.highlightSquares = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
      this.highlightSquares[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.highlightSquares[i][j] = Highlight.NONE;
      }
    }

  }


  selectSquare( position : [number , number]) {
    if (this.moveSelector.getSelectedSquare() == null) {
      // No square selected yet
      this.moveSelector.selectSquare(position);
    } else if (this.moveSelector.getSelectedSquare() == position) {
      // Square is already selected, but same square selected again
      this.rotateCW();
    } else if ( this.moveSelector.getPotentialMoves().some( (move) => move[1] == position)) {
      // Square is already selected, but an legal move square is selected
      this.moveSelector.queueMove(position);
    } else {
      // Square is already selected, but a non-adjacent square selected
      this.undo();
    }
    this.updateHighlightedSquares();
  }

  rotateCW() {
    this.moveSelector.queueRotateCW();
  }

  private undo() {
    if (this.moveSelector.getSelectedSquare() == null) {
      return;
    }
    this.moveSelector.deselectSquare();
  }

  commit() : BoardState {
    this.moveSelector.commitQueue();
    this.updateHighlightedSquares();
    return this.getTransformedBoard();
  }


  getTransformedBoard() : BoardState {
    return this.moveSelector.toBoard();
  }

  private updateHighlightedSquares() {
    // Set everything to null
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.highlightSquares[i][j] = Highlight.NONE;
      }
    }

    this.moveSelector.getPotentialMoves().forEach( (move) => {
      this.highlightSquares[move[1][0]][move[1][1]] = Highlight.MAIN;
    });

    let [x,y] = this.moveSelector.getSelectedSquare();
    if (this.moveSelector.getSelectedSquare() != null) {
      this.highlightSquares[x][y] = Highlight.SECONDARY;
    }

  }

  
}

// Small sanity test
let openingPosition = "ss7/3nwse3/2nwse4/1nwse3NW1/1se3NWSE1/4NWSE2/3NWSE3/7NN";
console.assert(
  BoardState.fromFEN(openingPosition).toFEN() == openingPosition,
  "FEN string for opening position is incorrect"
);

