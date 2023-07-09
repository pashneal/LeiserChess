import type { GameState } from './board';
import type { PieceDescriptor } from './piece';
import { Position, PawnDirection, QueenDirection } from './spatialUtils';
import { Move, Rotation , Swap} from './action';
import type { Action } from './action';

export function generateActions( game : GameState, position : Position) : Array<Action> {
  let actions = Array<Action>();
  let rotations = generateRotations(game, position);
  let moves = generateMoves(game, position);
  let swaps = generateSwaps(game, position);

  actions = actions.concat(rotations);
  actions = actions.concat(moves);
  actions = actions.concat(swaps);

  actions.filter((action) => action.isValid());

  return actions;
}

function generateSwaps(game : GameState, sourcePosition : Position) : Array<Action> {
  let piece = game.getPiece(sourcePosition);
  if (piece === null) { return []; }

  let [x,y] = [sourcePosition.getX(), sourcePosition.getY()];

  let deltas : Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1]
  ];

  let adjacent = deltas.map(([dx, dy]) => new Position(dx + x, dy + y));
  let bounded = adjacent.filter((a) => a.isWithinBounds());
  let hasTargetPiece = bounded.filter((pos) => game.getPiece(pos) !== null);

  let targetPieces: Array<[Position, PieceDescriptor]> = [];
  targetPieces = hasTargetPiece.map((pos) => [pos, game.getPiece(sourcePosition)!]);
  let swaps = targetPieces.map(([targetPosition, targetPiece]) => new Swap(
        sourcePosition, 
        targetPosition, 
        piece!, 
        targetPiece
  )); 
  return swaps
}

function generateMoves(game : GameState, position : Position) : Array<Action> { 
  let moves : Array<Action> = []; 
  let piece = game.getPiece(position);
  if (piece === null) {
    return moves;
  }

  // Assume that this piece can move without restriction
  let [x,y] = [position.getX(), position.getY()];
  let deltas : Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1]
  ];
  let adjacent = deltas.map(([dx, dy]) => new Position(dx + x, dy + y)); 
  let bounded = adjacent.filter((a) => a.isWithinBounds());
  let targetSquareEmpty = bounded.filter((pos) => game.getPiece(pos) === null);
  let movesToEmpty = targetSquareEmpty.map((pos) => new Move(position, pos, piece!));
  moves = movesToEmpty;

  return moves;
}

function generateRotations(game : GameState, position : Position) : Array<Action>{
  let piece = game.getPiece(position);
  if (piece === null) { return []; }

  let directions =  [
    piece.rotateClockwise().getDirection(),
    piece.rotateCounterClockwise().getDirection(),
    piece.rotated180().getDirection()
  ];

  let rotations = directions.map((direction) => new Rotation(position, direction, piece!));
  return rotations;
}

