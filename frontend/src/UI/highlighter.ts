import { BOARD_SIZE } from '../constants';
import type { Direction} from "../Utils/spatialUtils";
import { MoveSelector } from "./moveSelector";
import { Position } from "../Utils/spatialUtils";
import { Rotation, Action} from "../Action/action";
import { GameState } from '../Game/gameState';  
import {Transition} from "../Transition/transition";
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
export type HighlightBoard = Highlight[][];

export class Highlighter {
  private moveSelector : MoveSelector;
  public highlightSquares : HighlightBoard;
  private lastQueuedDirection : Direction | null = null;

  constructor(board : GameState) {
    this.moveSelector = new MoveSelector(board);
    this.highlightSquares = [];

    // Fill the highlightSquares array with "none" values
    Array.from(Array(BOARD_SIZE), () => Array(BOARD_SIZE).fill("none")).forEach((row) => {
      this.highlightSquares.push(row);
    });
  }

  interactWithSquare( newPosition : Position) {
    // Do nothing if the square is empty
    let selectedSquare = this.moveSelector.getSelectedSquare();

    const actionActivated = (action : Action) => (
        action.from().equals(selectedSquare) && // Action is from the selected square
        action.to().equals(newPosition) && // Action is to the clicked square
        !action.to().equals(action.from()) // Action does not start and end on the same square
    );

    
    if (this.moveSelector.getSelectedSquare() === null) {
      // No square selected yet
      // => select one
      console.log("Select");
      this.moveSelector.selectSquare(newPosition);
      this.lastQueuedDirection = null;

    } else if (newPosition.equals(selectedSquare)) {
      // Square is already selected, 
      // but same square selected again
      // => attempt to rotate the currently selected square
      console.log("Try Rotate");
      this.tryRotateCW();

    } else if ( this.moveSelector.getPossibleActions().some( actionActivated )) {
      // A legal action is activated 
      // Find the legal action
      // => queue said legal action
      let action = this.moveSelector.getPossibleActions().find( actionActivated )!;
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
      this.moveSelector.getSelectedSquare()!,
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
    return true;

  }

  private unselect() {
    if (this.moveSelector.getSelectedSquare() === null) {
      return;
    }
    this.moveSelector.deselectSquare();
  }

  commit() {
    this.moveSelector.commitQueue();
    this.updateHighlightedSquares();
  }

  getTransition() : Transition {
    let next = this.moveSelector.toQueuedGameState()
    let prev = this.moveSelector.toGameState();
    return Transition.from(prev, next);
  }

  getGameState() : GameState {
    return this.moveSelector.toQueuedGameState();
  }

  private updateHighlightedSquares() {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.highlightSquares[i]![j] = "none";
      }
    }

    this.moveSelector.getPossibleActions().forEach( (action) => {
      let [col,row] = action.to().toArray();
      this.highlightSquares[row]![col] = "main";
    });

    if (this.moveSelector.getSelectedSquare() != null) {
      let [col,row] = this.moveSelector.getSelectedSquare()!.toArray();
      this.highlightSquares[row]![col] = "secondary";
    }
  }

  at( position : Position ) {
    let [x,y] = position.toArray();
    return this.highlightSquares[y]![x];
  }

}
