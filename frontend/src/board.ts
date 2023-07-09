import type { PieceDescriptor } from "./piece";
import { parseBoard } from "./parser";
import { generateActions } from "./actionGenerator";
import { BOARD_SIZE } from './constants';
import type { Direction,  Position } from "./spatialUtils";
import type { Action } from "./action";
import { Rotation} from "./action";

export type Player = "light" | "dark";


// GameState is a class that represents the state of the LeiserChess game
// and it has the following guarantees:
//
//  1. It can always be converted to a FEN string 
//  2. Actions are only allowed if they change the 
//     game state to something not in the previous 2 moves
//  3. Actions must be legal (i.e. no moving a piece that doesn't exist)
//  4. The board is always in a state resulting from the composition of 
//     legal moves and rotations after an initial input FEN
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

        if (piece === null) {
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

    let currentPlayer = this.currentPlayer === "light" ? "W" : "B";
    // Remove the last extra slash, append the player
    return fenString.slice(0, -1) + " " + currentPlayer;

  }

  getPiece(position : Position) : PieceDescriptor | null {
    let [x, y] = [position.getX(), position.getY()];
    return this.board[y][x];
  }

  private setPiece([x,y] : [number, number], piece : PieceDescriptor | null) {
    this.board[y][x] = piece;
  }

  // Returns a copy of the board state's internals
  toArray() : PieceDescriptor[][] {
    let boardState = GameState.fromFEN(this.toFEN());
    return boardState.board;
  }



  // Apply an action on the board
  //
  // Justification: as we expect that the type of action will change 
  // from a version of the game to another, we want to keep the
  // implementation of the actions (moves, rotation, swaps etc) 
  // logic outside of the GameState class
  //
  // @param action the action to apply
  applyAction(action : Action) {

    // Transform the board according to the action
    let board = action.appliedTo(this.toArray());
    console.log("Action applied", action.toString())
    this.board = board;

    // None of the previous 2 states can be the same as the current state
    if (this.history.slice(-2).some((state) => state === this.toFEN())) {
      throw new Error("None of the previous 2 states can be the same as the current state");
    }

    this.history.push(this.toFEN());
    this.currentPlayer = this.currentPlayer === "light" ? "dark" : "light";
  }

  copy() : GameState {
    let board = GameState.fromFEN(this.toFEN());
    board.history = this.history.slice();
    return board;
  }
} 


// MoveSelector is a class designed to help with state management of 
// an interactive game of LeiserChess. It uses a 3-stage commit process
// to first, select a square containing a piece, next, queue a move or rotation for that piece
// and then finally commit the move or rotation.
//
//  Select -> Queue -> Commit
//
// It has the following guarantees:
//  0. An initial target square must be selected before a move or rotation can be queued
//  1. An action can not be committed if illegal 
//  2. A legal action can be queued and observed using .toQueuedBoard() without committing it 
//  3. All committed move or rotation can be observed using .toBoard() 
//  4. Only one action can be queued at a time
//
//  Once committed, the queue is cleared and the square deselected
//
class MoveSelector { 
  private game : GameState;
  private selectedSquare : Position | null = null;
  private selectedPiece : PieceDescriptor | null = null;
  private actionQueue : Action | null = null;


  constructor( newGame : GameState ) {
    this.game = newGame.copy(); 
  }

  queueOne( action : Action) {
    if (this.selectedSquare === null) {
      throw new Error("Cannot queue move when no square is selected");
    }

    this.actionQueue = action;
  }

  dequeue() {
    this.actionQueue = null;
  }

  commitQueue() {
    this.game.applyAction(this.actionQueue);
    this.dequeue();
    this.deselectSquare();
  }

  selectSquare(position : Position) {
    if (this.selectedSquare != null) {
      throw new Error("Cannot select a square when one is already selected");
    }
    this.selectedSquare = position;
    this.selectedPiece = this.game.getPiece(position);
  }

  deselectSquare() {
    if (this.selectedSquare === null) {
      throw new Error("Cannot deselect a square when one is not selected");
    }
    this.selectedSquare = null;
    this.selectedPiece = null;
    this.dequeue();
  }

  getSelectedPiece() : PieceDescriptor | null {
    if (this.selectedSquare === null) {
      throw new Error("Cannot get selected piece from square when one is not selected");
    }
    return this.selectedPiece;
  }
  
  getSelectedSquare() : Position | null {
    return this.selectedSquare;
  }

  getPossibleActions () : Action[] {
    if (this.selectedSquare === null) { return []; }
    return generateActions(this.game, this.selectedSquare);
  }

  getPiece(position : Position) : PieceDescriptor | null {
    return this.game.getPiece(position);
  }

  // Returns a given piece on the queued board,
  // useful for tracking states across uncommited moves
  getQueuedPiece(position : Position) : PieceDescriptor | null {
    let board = this.toQueuedBoard();
    return board.getPiece(position);
  }

  getSelectedQueuedPiece() : PieceDescriptor | null {
    if (this.selectedSquare === null) {
      throw new Error("Cannot get selected piece from square when one is not selected");
    }
    return this.getQueuedPiece(this.selectedSquare);
  }

  toBoard() : GameState {
    return this.game;
  }

  toQueuedBoard() : GameState {
    let board = this.game.copy();
    if (this.actionQueue != null) {
      board.applyAction(this.actionQueue);
    }
    return board;
  }
}

export type Highlight = "none" | "main" | "secondary";

// Helps the UI figure out where to highlight using some move selector
//
// This class acts as a state machine that reacts to clicks on the UI, 
// providing observable changes to the board.
//
// These can be observed via the highlightSquares property, which is a 2D array
// of Highlight values, where each value corresponds to a square on the board.
//
// The highlightSquares property is updated whenever the user interacts with the
// board, and can be used to update the UI. 
//
// Furthermore this class provides a way to make moves without commiting them to the main
// game state and observe the changes via getBoard() property
//
export class Highlighter {
  private moveSelector : MoveSelector;
  public highlightSquares : Highlight[][];
  private lastQueuedDirection : Direction | null = null;

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

  interactWithSquare( newPosition : Position) {
    let selectedSquare = this.moveSelector.getSelectedSquare();

    const actionActivated = (action : Action) => (
        action.from().equals(selectedSquare) && // Action is from the selected square
        action.to().equals(newPosition) && // Action is to the clicked square
        !action.to().equals(action.from()) // Action does not start and end on the same square
    );

    
    if (this.moveSelector.getSelectedSquare() === null) {
      // No square selected yet
      console.log("Select");
      this.moveSelector.selectSquare(newPosition);
      this.lastQueuedDirection = null;

    } else if (newPosition.equals(selectedSquare)) {
      // Square is already selected, 
      // but same square selected again
      console.log("Try Rotate");
      this.tryRotateCW();

    } else if ( this.moveSelector.getPossibleActions().some( actionActivated )) {
      // A legal action is activated 
      // Find the legal action
      let action = this.moveSelector.getPossibleActions().find( actionActivated );
      this.moveSelector.queueOne(action);
      this.lastQueuedDirection = null;

    } else {
      // There are no legal actions activated, so unselect
      console.log("Unselect");
      this.unselect();
      this.lastQueuedDirection = null;
    }
    this.updateHighlightedSquares();
  }

  // Extend the state machine to keep track of the last rotation
  private tryRotateCW() : boolean {
    let selectedPiece = this.moveSelector.getSelectedPiece();
    if (selectedPiece === null) {
      return false; // No piece selected to rotate, so do nothing
    }

    let originalDirection = selectedPiece.getDirection();
    let newDirection : Direction; 

    if (this.lastQueuedDirection === null) {
      // No rotation queued yet, so queue default
      newDirection = originalDirection.rotatedClockwise();
    } else {
      // Otherwise, Rotate the last queued rotation
      newDirection = this.lastQueuedDirection.rotatedClockwise();
    }

    // Queue the rotation
    let action = new Rotation(
      this.moveSelector.getSelectedSquare(),
      newDirection,
      selectedPiece
    );

    if (originalDirection.equals(newDirection)) {
      // If the rotation is the same as the original, then unselect
      console.log(".. Unselect");
      this.unselect();
      return false;
    }

    this.moveSelector.queueOne(action);
    this.lastQueuedDirection = newDirection;

  }

  private unselect() {
    if (this.moveSelector.getSelectedSquare() === null) {
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
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.highlightSquares[i][j] = "none";
      }
    }

    this.moveSelector.getPossibleActions().forEach( (action) => {
      let [col,row] = action.to().toArray();
      this.highlightSquares[row][col] = "main";
    });

    if (this.moveSelector.getSelectedSquare() != null) {
      let [col,row] = this.moveSelector.getSelectedSquare().toArray();
      this.highlightSquares[row][col] = "secondary";
    }
  }

  at( position : Position ) {
    let [x,y] = position.toArray();
    return this.highlightSquares[y][x];
  }
}

// Small sanity test
let openingPosition = "ss7/3nwse3/2nwse4/1nwse3NW1/1se3NWSE1/4NWSE2/3NWSE3/7NN W";
console.assert(
  GameState.fromFEN(openingPosition).toFEN() === openingPosition,
  "FEN string for opening position is incorrect"
);

