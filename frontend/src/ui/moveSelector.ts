import { PieceDescriptor } from "../game/piece";
import { GameState } from "../game/state";
import { Player } from "../game/board";

import { generateActions } from "../action/generation";
import { Action} from "../action/action";

import { Position } from "../utils/spatial";

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
//  Once committed, the queue is cleared and the square deselected, and the laser is fired
//
export class MoveSelector { 
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
    if (this.actionQueue === null) {
      throw new Error("Cannot commit queue when no action is queued");
    }
    this.game.commitAction(this.actionQueue);
    this.dequeue();
    this.deselectSquare();
  }

  selectSquare(position : Position) {

    if (this.selectedSquare != null) {
      throw new Error("Cannot select a square when one is already selected");
    }
    this.selectedSquare = position;
    this.selectedPiece = this.game.getPiece(position);

    // Only allow pieces to be selected that match the color
    if (!this.selectedPiece.isEmpty()) {
      if (this.selectedPiece.getColor() as Player !== this.game.getCurrentPlayer()){
        this.selectedPiece = null;
        this.selectedSquare = null;
      }
    }
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
    let actions = generateActions(this.game, this.selectedSquare);
    return actions;
  }

  getPiece(position : Position) : PieceDescriptor {
    return this.game.getPiece(position);
  }

  // Returns a given piece on the queued board,
  // useful for tracking states across uncommited moves
  getQueuedPiece(position : Position) : PieceDescriptor | null {
    let board = this.toQueuedGameState();
    return board.getPiece(position);
  }

  getSelectedQueuedPiece() : PieceDescriptor | null {
    if (this.selectedSquare === null) {
      throw new Error("Cannot get selected piece from square when one is not selected");
    }
    return this.getQueuedPiece(this.selectedSquare);
  }

  toGameState() : GameState {
    return this.game;
  }

  toQueuedGameState() : GameState {
    let game = this.game.copy();
    if (this.actionQueue != null) {
      game.tryAction(this.actionQueue);
    }
    return game;
  }

}
