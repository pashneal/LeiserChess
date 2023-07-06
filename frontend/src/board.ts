import { PieceDescriptor } from "./piece";
import type { Direction} from "./piece";
import { rotateClockwise} from "./piece";
import { parseBoard } from "./parser";

const compare = (a : any, b : any) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const BOARD_SIZE = 8;
export type Move = [[number, number] , [number, number]];
export type Rotate = [Direction, Direction];
export type Player = "light" | "dark";


// GameState is a class that represents the state of the LeiserChess game
// and it has the following guarantees:
//
//  1. It can always be converted to a FEN string 
//  2. Moves and rotations are only allowed if they change the game state
//  3. Moves and Rotations must be legal (i.e. no moving a piece that doesn't exist)
//  4. The Ko rule is observed
//  5. The board is always in a state resulting from the composition of 
//     legal moves and rotations after an initial FEN
//
export class GameState {
  private board : PieceDescriptor[][];
  private history : Array<String> 
  private currentPlayer : Player;

  private constructor() {
    this.board = [];
    this.currentPlayer = "light";
    for (let i = 0; i < BOARD_SIZE; i++) {
      this.board[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.board[i][j] = null;
      }
    }
  }

  static fromFEN(fenString : string) {
     let gameState = new GameState();
     let [board, player] = parseBoard(fenString);
     gameState.board = board;
     gameState.currentPlayer = player;
     gameState.history = [gameState.toFEN()];

     return gameState;
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

    let currentPlayer = this.currentPlayer == "light" ? "W" : "B";
    return fenString.slice(0, -1) + " " + currentPlayer;

  }

  getPiece([x,y] : [number, number]) : PieceDescriptor | null {
    return this.board[x][y];
  }

  private setPiece([x,y] : [number, number], piece : PieceDescriptor | null) {
    this.board[x][y] = piece;
  }


  // Returns a copy of the board state's internals
  toArray() : PieceDescriptor[][] {
    let boardState = GameState.fromFEN(this.toFEN());
    return boardState.board;
  }


  // Only allow legal rotations and moves which change the game state
  // Also observe the Ko rule
  movePiece( move : Move ){
    // Can only rotate or move a piece on your turn
    if (this.currentPlayer != this.getPiece(move[0]).getPieceColor()) {
      throw new Error("Cannot move a piece on your opponent's turn");
    }

    
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

    // Can only rotate or move a piece on your turn
    if (this.currentPlayer != piece?.getPieceColor()) {
      throw new Error("Cannot move a piece on your opponent's turn");
    }

    console.assert( x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE, "x and y must be between 0 and 7");

    if( newDirection == piece.getDirection())  {
      throw new Error("Rotation must change the orientation of the piece");
    }
    if (this.getPiece([x,y]) === null)  {
      throw new Error("There must be a piece at the location to rotate");
    }

    
    if (piece.getPieceType() == "queen" && !Array("north", "east", "south", "west").includes(newDirection)){
      throw new Error("Queen can only rotate to cardinal directions");
    }

    if (piece.getPieceType() == "pawn" && !Array("north-east", "north-west", "south-east", "south-west").includes(newDirection)) {
        throw new Error("Pawn can only rotate to diagonal directions");
    }

    let newPiece = new PieceDescriptor(piece.getPieceType(), piece.getPieceColor(), newDirection);
    this.setPiece([x,y], newPiece);

    // Game state is valid, commit to history
    this.history.push(this.toFEN());
  }

  copy() : GameState {
    let board = GameState.fromFEN(this.toFEN());
    board.history = this.history.slice();
    return board;
  }
} 


class MoveSelector {
  private game : GameState;
  private selectedSquare : [number, number] | null = null;
  private moveQueue : [[number, number], [number, number]] | null = null;
  private rotateQueue : [[number, number], Direction] | null = null;


  constructor( newBoard : GameState ) {
    this.game = newBoard.copy(); 
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

    let position = this.selectedSquare;
    let newDirection : Direction;

    // If rotated once before, rotate again
    if (this.rotateQueue != null) {
      let rotation = this.rotateQueue[1];
      newDirection = rotateClockwise(rotation);
    } else {
      newDirection = rotateClockwise(this.game.getPiece(position).getDirection());
    }
    
    this.queueRotation(newDirection);
  }

  queueRotation( newDirection : Direction) {
    this.moveQueue = null;
    if (this.selectedSquare == null) {
      throw new Error("Cannot queue move when no square is selected");
    }

    let position = this.selectedSquare;
    let piece  = this.game.getPiece(position);

    if (newDirection == piece.getDirection()) {
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
      this.game.movePiece(this.moveQueue);
    } else if (this.rotateQueue != null) {
      this.game.rotatePiece(this.rotateQueue[0], this.rotateQueue[1]);
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
    if (currentPos == null) {
      return [];
    }

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
      let boardCopy = GameState.fromFEN(this.game.toFEN());
      try {
        boardCopy.movePiece(move);
        legalMoves.push(move);
      } catch (e) {
        return
      }
    });

    return legalMoves;
  }

  getPossibleRotations() : Direction[] {
    let currentPos = this.getSelectedSquare();
    if (currentPos == null) {
      return [];
    }

    let piece = this.game.getPiece(currentPos);
    let possibleRotations = [];
    if (piece.getPieceType() == "queen") {
      possibleRotations = ["north", "east", "south", "west"];
    } else if (piece.getPieceType() == "pawn") {
      possibleRotations = ["north-east", "north-west", "south-east", "south-west"];
    }

    // Remove rotations if there is a move queued
    if (this.moveQueue != null) {
      return [];
    }

    // Remove any rotations that are illegal
    let legalRotations = [];
    possibleRotations.forEach( (rotation) => {
      let boardCopy = GameState.fromFEN(this.game.toFEN());
      try {
        boardCopy.rotatePiece(currentPos, rotation);
        legalRotations.push(rotation);
      } catch (e) {
        return
      }
    });
  }

  getPiece(position : [number, number]) : PieceDescriptor | null {
    return this.game.getPiece(position);
  }

  toBoard() : GameState {
    return this.game;
  }

  toQueuedBoard() : GameState {
    let board = this.game.copy();
    try {
      if (this.moveQueue != null) {
        board.movePiece(this.moveQueue);
      } else if (this.rotateQueue != null) {
        board.rotatePiece(this.rotateQueue[0], this.rotateQueue[1]);
      }
    } catch (e) {
      // Do nothing, board is invalid
      console.log("The queued move is invalid, returning original board");
    }
    return board;
  }
}

export type Highlight = "none" | "main" | "secondary";

// Helps the UI figure out where to highlight using some move selector
export class Highlighter {
  private moveSelector : MoveSelector;
  public highlightSquares : Highlight[][];

  constructor(board : GameState) {
    this.moveSelector = new MoveSelector(board);
    this.highlightSquares = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
      this.highlightSquares[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.highlightSquares[i][j] = "none";
      }
    }

  }

  toggleSquare( position : [number , number]) {
    let selectedSquare = this.moveSelector.getSelectedSquare();
    
    if (this.moveSelector.getSelectedSquare() == null) {
      // No square selected yet
      console.log("Select");
      this.moveSelector.selectSquare(position);
    } else if (compare(position, selectedSquare)) {
      // Square is already selected, but same square selected again
      console.log("Rotate");
      this.rotateCW();
    } else if ( this.moveSelector.getPotentialMoves().some( (move) => compare(move[1], position))) {
      // Square is already selected, and not same square selected, but an legal move square is selected
      console.log("Move");
      this.moveSelector.queueMove(position);
    } else {
      // Square is already selected, but a non-legal move square selected
      console.log("Undo");
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

  commit() : GameState {
    this.moveSelector.commitQueue();
    this.updateHighlightedSquares();
    return this.getBoard();
  }

  getBoard() : GameState {
    return this.moveSelector.toQueuedBoard();
  }

  private updateHighlightedSquares() {

    // Set everything to null
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.highlightSquares[i][j] = "none";
      }
    }

    this.moveSelector.getPotentialMoves().forEach( ([_, [x,y]]) => {
      this.highlightSquares[x][y] = "main";
    });

    if (this.moveSelector.getSelectedSquare() != null) {
      let [x,y] = this.moveSelector.getSelectedSquare();
      this.highlightSquares[x][y] = "secondary";
    }
  }

  at( [x,y] : [number  , number] ) {
    return this.highlightSquares[x][y];
  }
}

// Small sanity test
let openingPosition = "ss7/3nwse3/2nwse4/1nwse3NW1/1se3NWSE1/4NWSE2/3NWSE3/7NN W";
console.assert(
  GameState.fromFEN(openingPosition).toFEN() == openingPosition,
  "FEN string for opening position is incorrect"
);

