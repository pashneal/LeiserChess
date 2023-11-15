import { BOARD_SIZE } from '../constants';
import type { Direction} from "../utils/spatial";
import { MoveSelector } from "./moveSelector";
import { Position } from "../utils/spatial";
import { Rotation, Action, NullMove} from "../action/action";
import { GameState } from '../game/state';  
import {Transition} from "../transition/transition";
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

  canCommit() : boolean {
    return this.moveSelector.canCommit();
  }

  interactWithSquare( newPosition : Position) {
    // Do nothing if the square is empty
    let selectedSquare = this.moveSelector.getSelectedSquare();

    const movementAction = (action : Action) => (
        action.from().equals(selectedSquare) && // Action is from the selected square
        action.to().equals(newPosition) &&// Action is to the clicked square
        action.from() != action.to() // Action is not a rotation or null move
    );

    
    if (this.moveSelector.getSelectedSquare() === null) {
      // No square selected yet
      // => select one
      console.log("Select");
      // Only select if the color is correct
      this.moveSelector.selectSquare(newPosition);
      this.lastQueuedDirection = null;
      selectedSquare = newPosition;
    } 

    let rotated = false;
    let possibleActions = this.moveSelector.getPossibleActions();
    let queuedAction = null;

    if (newPosition.equals(selectedSquare)) {
      // Square is newly selected, 
      // or same square selected again
      // => attempt to rotate the currently selected square
      console.log("Same square");
      queuedAction = this.sameSquare();
    } 

    if ( possibleActions.some(movementAction)) {
      // A legal action that traverses squares action is activated 
      // Find the legal action
      // => queue said legal action
      console.log("Action activated");
      queuedAction = possibleActions.find( movementAction )!;
      // Reset rotation
      this.lastQueuedDirection = null;

    } 


    if (queuedAction !== null && this.getGameState().isLegalAction(queuedAction)) {
      console.log("Queued legal action");
      this.moveSelector.queueOne(queuedAction);
    } 

    if (queuedAction === null && !newPosition.equals(selectedSquare)) {
      this.unselect();
    } 


      
    this.updateHighlightedSquares();
  }

  // Extend the state machine to keep track of the last rotation
  private sameSquare() : Action | null {
    let selectedPiece = this.moveSelector.getSelectedPiece();
    if (selectedPiece === null) {
      return null; // No piece selected, so do nothing
    }
    if (selectedPiece.isEmpty()) {
      return null; // Empty piece selected, so do nothing
    }

    let selectedSquare = this.moveSelector.getSelectedSquare()!;

    let originalDirection = selectedPiece.getDirection();
    let newDirection : Direction; 
    let action : Action | null= null;

    action = new NullMove(
      selectedSquare,
      selectedSquare,
      selectedPiece
    );
    if (this.lastQueuedDirection === null) {
      // No rotation queued yet, so queue default
      newDirection = originalDirection;
    } else {
      // Otherwise, Rotate the last queued rotation
      newDirection = this.lastQueuedDirection.rotatedClockwise();
      // Queue the rotation
      action = new Rotation(
        this.moveSelector.getSelectedSquare()!,
        newDirection,
        selectedPiece
      );
    }



    this.lastQueuedDirection = newDirection;
    let isValid = (action : any) =>  (action !== null && action.isValid());
    let isPossible = (action : any) => (this.moveSelector.getPossibleActions().some((a) => a.equals(action)));
    let isLegal = (action : any) => (isValid(action) && isPossible(action));

    if (!isLegal(action)) { 
      if (this.canCommit()) {
        this.moveSelector.dequeue();
      }
      return null 
    }
    return action;

  }

  private unselect() {
    if (this.moveSelector.getSelectedSquare() === null) {
      return;
    }
    this.moveSelector.deselectSquare();
    this.updateHighlightedSquares();
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

  undo() {
    this.moveSelector.undo();
  }

  goToMove( moveNumber : number ) {
    this.unselect();
    this.moveSelector.goToMove(moveNumber);
  }

}
