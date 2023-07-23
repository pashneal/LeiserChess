import type { GameState } from "../game/state";
import type { PieceDescriptor } from "../game/piece";
import { Position} from "../utils/spatial";
import { Move, Rotation , Swap} from "../action/action";
import type { Action } from "../action/action";

// Only return legal actions 
export function generateActions( game : GameState, position : Position) : Array<Action> {
  let actions = Array<Action>();
  let rotations = generateRotations(game, position);
  let moves = generateMoves(game, position);
  let swaps = generateSwaps(game, position);

  actions = actions.concat(rotations);
  actions = actions.concat(moves);
  actions = actions.concat(swaps);

  // All actions must lead to legal game states
  actions = actions.filter((action) => game.isLegalAction(action))  

  return actions;
}

function getAdjacentPositions(position : Position) : Array<Position> {
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
  return bounded;
}


function generateSwaps(game : GameState, sourcePosition : Position) : Array<Action> {
  let piece = game.getPiece(sourcePosition);
  if (piece.isEmpty()) { return []; }


  let adjacent = getAdjacentPositions(sourcePosition);
  let hasTargetPiece = adjacent.filter((pos) => !game.getPiece(pos).isEmpty() );

  let targetPieces: Array<[Position, PieceDescriptor]> = [];
  targetPieces = hasTargetPiece.map((pos) => [pos, game.getPiece(pos)!]);
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
  if (piece.isEmpty()) {
    return moves;
  }

  let adjacent = getAdjacentPositions(position);
  let targetSquareEmpty = adjacent.filter((pos) => game.getPiece(pos).isEmpty() );
  let movesToEmpty = targetSquareEmpty.map((pos) => new Move(position, pos, piece!));
  moves = movesToEmpty;

  return moves;
}

function generateRotations(game : GameState, position : Position) : Array<Action>{
  let piece = game.getPiece(position);
  if (piece.isEmpty()) { return []; }

  let directions =  [
    piece.rotateClockwise().getDirection(),
    piece.rotateCounterClockwise().getDirection(),
    piece.rotated180().getDirection()
  ];

  let rotations = directions.map((direction) => new Rotation(position, direction, piece!));
  return rotations;
}

