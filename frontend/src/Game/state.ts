import { PieceDescriptor } from "./piece";
import { parseBoard } from "./parser";
import { BOARD_SIZE } from "../constants";
import { Position } from "../Utils/spatial";
import {Action} from "../Action/action";
import { consecutivePairsOf , everyOther} from "../Utils/ext";
import { Laser } from "../Laser/laser";
import { Board } from "./board";

export type Player = "light" | "dark";
export type QueenLasers = { "light" : Laser, "dark" : Laser};


// GameState is a class that represents the state of the LeiserChess game
// and it has the following guarantees:
//
//  1. It can always be converted to a FEN string 
//  2. Actions are only allowed if they change the 
//     game state to something not in the previous 2 moves
//  3. Actions must be legal (i.e. no moving a piece that doesn't exist)
//  4. The board is always in a state resulting from the application of 
//     legal actions  after an initial input FEN
export class GameState {
  private board : Board;
  private fenHistory : Array<String> 
  private actionHistory : Array<Action>
  private currentPlayer : Player;

  private constructor() {
    this.currentPlayer = "light";
    this.fenHistory = [];
    this.actionHistory = [];
    // Fill 2D array with PieceDescriptor.empty
    this.board = Board.empty();  
  }

  copy () : GameState{ 
    let game = new GameState();
    game.fenHistory = this.fenHistory.slice();
    game.board = this.board.copy();
    game.actionHistory = this.actionHistory.slice();
    game.currentPlayer = this.currentPlayer;
    return game;
  }

  getCurrentPlayer() : Player {
    return this.currentPlayer
  }

  static fromFEN(fenString : string) {
     let gameState = new GameState();
     let [board, player] = parseBoard(fenString);
     gameState.board = new Board(board);
     gameState.currentPlayer = player!;
     gameState.fenHistory = [gameState.board.toFEN()];
     return gameState;
  }

  toFEN() : string {
    let player = this.currentPlayer === "light" ? "W" : "B";
    return this.board.toFEN() + " " + player;
  }

  toBoardFEN() : string {
    return this.board.toFEN();
  }

  getPiece(position : Position) : PieceDescriptor {
    return this.board.getPiece(position);
  }

  private setPiece(position : Position , piece : PieceDescriptor ) {
    this.board.setPiece(position, piece);
  }

  // Returns a copy of the board state's internals
  getBoard() : Board { 
    return this.board.copy()
  }


  getQueen(player : Player) : [Position, PieceDescriptor] {
    let queenPosition : Position | null = null;
    let queen : PieceDescriptor | null = null;

    // Find the PieceDescriptor matching "queen" and color, and it's position
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        let piece = this.getPiece(new Position(x, y));
        if (!piece.isEmpty()
            && piece.getType() === "queen" 
            && piece.getColor() as Player === player) 
        {
          queenPosition = new Position(x, y);
          queen = piece;
          break;
        }
      }
    }

    if (queen === null) {
      throw new Error("No queen found for the current color");
    }

    return [queenPosition!, queen];
  }

  getQueenLaser(player : Player) : Laser {
    let [queenPosition, queen] = this.getQueen(player);
    let laser = new Laser(this.getBoard() , queenPosition, queen.getDirection());
    return laser;
  }

  fireLaser(player : Player) {
    let laser = this.getQueenLaser(player);
    let newBoard = laser.fire();
    this.board = newBoard;
  }

  isLegalAction(action : Action) : boolean {
    // Check if the action is valid
    if (!action.isValid()) {
      return false;
    }

    let game = this.copy();

    try {
      game.tryAction(action);
    } catch {
      return false;
    }
    game.fireLaser(this.currentPlayer);

    // None of the previous 2 states can be the same as the state after the action
    if (this.fenHistory.slice(-2).some((state) => state === game.board.toFEN())) {
      return false;
    }

    return true;
  }

  // Apply an action on the board, without checking if it's legal
  //
  // @param action the action to apply
  tryAction(action : Action) {
    // Transform the board according to the action
    this.board = action.appliedTo(this.board);
    this.actionHistory.push(action);
  }

  commitAction(action : Action) {
    console.log("Action commited!")
    if (!this.isLegalAction(action)) {
      throw new Error("The selected action is not legal " +  JSON.stringify(action));
    }

    this.tryAction(action);
    this.fireLaser(this.currentPlayer);
    this.fenHistory.push(this.board.toFEN());
    this.currentPlayer = this.currentPlayer === "light" ? "dark" : "light";
    console.log(this);
  }

  getLasers(): QueenLasers {
    return { 
      "light" : this.getQueenLaser("light"),
      "dark" : this.getQueenLaser("dark")
    }
  }

  getActionHistory() : Array<[string, string]> {

    let representations = this.actionHistory.map((action) => action.toString());

    // Pad the history with "..." if the first action was made by the second player
    if (this.actionHistory.length > 0 && 
        this.actionHistory[0]!.matchPlayer("dark")) {
      representations.unshift("...");
    }


    let actionHistory = everyOther(consecutivePairsOf(representations, "..."));
    return actionHistory;
  }

} 


// Small sanity test
let openingPosition = "ss7/3nwse3/2nwse4/1nwse3NW1/1se3NWSE1/4NWSE2/3NWSE3/7NN W";
console.assert(
  GameState.fromFEN(openingPosition).toFEN() === openingPosition,
  `FEN string for opening position is incorrect ${GameState.fromFEN(openingPosition).toFEN()}`
);



