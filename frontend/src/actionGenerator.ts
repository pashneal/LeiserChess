import type { GameState } from './board';
import { Position, PawnDirection, QueenDirection } from './spatialUtils';
import { Move, Rotation } from './action';
import type { Action } from './action';


function generateMoves(game : GameState, position : Position) : Action[] {
  let moves = []; 
  let piece = game.getPiece(position);
  if (piece === null) {
    return moves;
  }

  // Assume that this piece can move without restriction
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y ++) {

      let [newX, newY] = [position.getX() + x, position.getY() + y];
      let newPosition = new Position(newX, newY);

      if (!newPosition.isWithinBounds()) { continue; }
      
      // Only get moves that don't occupy the same space as another piece
      if (game.getPiece(newPosition) === null) {
        moves.push(new Move(position, newPosition, piece));
      }
    }
  }

  return moves;
}

function generateRotations(game : GameState, position : Position) : Action[] {
  let piece = game.getPiece(position);
  if (piece === null) { return []; }

  let directions =  [
    piece.rotateClockwise().getDirection(),
    piece.rotateCounterClockwise().getDirection(),
    piece.rotated180().getDirection()
  ];

  let rotations = directions.map((direction) => new Rotation(position, direction, piece));
  return rotations;
}

export function generateActions( game : GameState, position : Position) : Action[] {
  let actions = [];
  let rotations = generateRotations(game, position);
  let moves = generateMoves(game, position);
  actions = actions.concat(rotations);
  actions = actions.concat(moves);
  actions.filter((action) => action.isValid());
  return actions;
}
