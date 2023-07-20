import { GameState } from './gameState';
import { PieceDescriptor } from './piece';
import { BOARD_SIZE } from './constants';
import { Position } from './spatialUtils';

type EasingFunction = (t: number) => string;
type TransitionMap = Map<string, EasingFunction>;


const none = (t:number) => ``;

const moveWest = (t: number) => `transform: translateX(${100-t*100}%);`;
const moveEast = (t: number) => `transform: translateX(${t*100-100}%);`;
const moveNorth =(t: number) => `transform: translateY(${100-t*100}%);`;
const moveSouth = (t: number) => `transform: translateY(${t*100-100}%);`;

const moveSouthEast = (t:number) => `
  transform: translateX(${t*100-100}%) translateY(${t*100-100}%);
`;

const moveSouthWest = (t:number) => `
  transform: translateX(${100-t*100}%) translateY(${t*100-100}%);
`;

const moveNorthEast = (t:number) => `
  transform: translateX(${t*100-100}%) translateY(${100-t*100}%);
`;

const moveNorthWest = (t:number) => `
  transform: translateX(${100-t*100}%) translateY(${100-t*100}%);
`;

export class Transition {
  private transitionFunctions : TransitionMap = new Map<string, EasingFunction>()
  
  static from(initialState: GameState, finalState: GameState) {
    let initial = initialState.getBoard();
    let final = finalState.getBoard(); 



    // Find all squares that have different piece.id()
    let differences : [PieceDescriptor, PieceDescriptor][] = [];
    let from = new Map<string, Position>();
    let to = new Map<string, Position>();
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        let initialPiece = initial.at(row, col);
        let finalPiece = final.at(row, col);

        if (initialPiece.uiIndex() !== finalPiece.uiIndex()) {

          differences.push([initialPiece, finalPiece]);
          from.set(initialPiece.uiIndex(), new Position(col, row));
          to.set(finalPiece.uiIndex(), new Position(col, row));

        }
      }
    }

    // Only keep differences if the initial piece is not empty
    differences = differences.filter(([init, _]) => !init.isEmpty() );

    // get a difference in position based on a given uiIndex
    let positionDifferences : [string, [number, number]][]= differences.map(([init, _]) => {
      let initPos = from.get(init.uiIndex())!;
      let finalPos = to.get(init.uiIndex()) || initPos;
      return [init.uiIndex(), finalPos.getDifference(initPos)];
    });

    let transition = new Transition();

    // Construct the appropiate transition functions
    for (let [uiIndex, [dx, dy]] of positionDifferences) {
      if (dx === 1 && dy === 0) {
        transition.transitionFunctions.set(uiIndex, moveEast);
      } else if (dx === -1 && dy === 0) {
        transition.transitionFunctions.set(uiIndex, moveWest);
      } else if (dx === 0 && dy === 1) {
        transition.transitionFunctions.set(uiIndex, moveSouth);
      } else if (dx === 0 && dy === -1) {
        transition.transitionFunctions.set(uiIndex, moveNorth);
      } else if (dx === 1 && dy === 1) {
        transition.transitionFunctions.set(uiIndex, moveSouthEast);
      } else if (dx === -1 && dy === 1) {
        transition.transitionFunctions.set(uiIndex, moveSouthWest);
      } else if (dx === 1 && dy === -1) {
        transition.transitionFunctions.set(uiIndex, moveNorthEast);
      } else if (dx === -1 && dy === -1) {
        transition.transitionFunctions.set(uiIndex, moveNorthWest);
      }
    }

    return transition;

  }

  get(uiIndex: string) {
    return this.transitionFunctions.get(uiIndex);
  }

  ofPiece(piece: PieceDescriptor) {
    let result = this.get(piece.uiIndex());
    if (!result) {
      return none;
    }
    return result;
  }
}
