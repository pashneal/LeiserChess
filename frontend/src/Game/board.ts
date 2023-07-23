import { PieceDescriptor } from "./piece";
import { parseBoard } from "./parser";
import { BOARD_SIZE } from '../constants';
import { Position } from "../Utils/spatialUtils";
import { Laser } from "../Laser/laser";

export type Player = "light" | "dark";
export type QueenLasers = { "light" : Laser, "dark" : Laser};

export class Board {
  constructor(private board : Array<Array<PieceDescriptor>>) {}

  static empty() : Board {
    let board = Array.from({length: BOARD_SIZE}, () => Array.from({length: BOARD_SIZE}, () => PieceDescriptor.empty()));
    return new Board(board);
  }


  static fromFEN(fen : string) : Board {
    let [board, _] = parseBoard(fen);
    let newBoard = new Board(board);
    return newBoard;
  }

  toFEN(): string {
    let runningBlanks = 0;
    let fenString = ""; 

    for (let row of this.board) {
      for (let piece of row) {

        if (piece.isEmpty()) {
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

    // Remove the last extra slash
    return fenString.slice(0, -1);
  }

  copy() : Board {
    let board = this.board.map((row) => row.map((piece) => piece.copy()));
    return new Board(board);
  }

  getPiece(position : Position) : PieceDescriptor {
    if (!position.isWithinBounds()) {
      throw new Error("Position is out of bounds");
    }

    let [col, row] = position.toArray()
    return this.board[row]![col]!;
  }

  setPiece(position : Position, piece : PieceDescriptor)   {
    if (!position.isWithinBounds()) {
      throw new Error("Position is out of bounds");
    }

    let [col, row] = position.toArray()
    this.board[row]![col] = piece;
  }

  clearPiece(position : Position) {
    this.setPiece(position, PieceDescriptor.empty());
  }

  at(row : number , col : number) : PieceDescriptor {
    return this.board[row]![col]!;
  }

  squares() : [PieceDescriptor, [number, number]][] {
    let squares : [PieceDescriptor, [number, number]][] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        squares.push([this.at(row, col), [row, col]]);
      }
    }
    return squares;
  }
    


}

