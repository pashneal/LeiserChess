import { Position , Direction} from "../utils/spatial"; 
import { Board } from "../game/board";
import { BOARD_SIZE, LASER_WIDTH } from "../constants"; 


export class Laser { 
  private position : Position;
  private direction : Direction;
  
  constructor( initalPosition : Position , initialDirection : Direction)  {
    this.position = initalPosition;
    this.direction = initialDirection;

    if (this.position.isWithinBounds() === false) {
      throw new Error("Invalid position");
    }
  }

  public getPathOn(board: Board) : Array<Position> {
    let travelingDirection  : Direction | null = this.direction;
    let currentPosition = this.position;
    let path : Array<Position> = [];

    path.push(currentPosition);
    currentPosition = travelingDirection.appliedTo(currentPosition);

    // Travel and reflect off pieces until we hit a piece or the edge of the board
    while ( currentPosition.isWithinBounds() && travelingDirection !== null) {
      path.push(currentPosition);

      let piece = board.getPiece(currentPosition)

      // If we hit a piece, reflect off it
      if (!piece.isEmpty()) {
        let reflection = piece!.reflect(travelingDirection);
        travelingDirection = reflection;
      }

      if (travelingDirection !== null) {
        currentPosition = travelingDirection.appliedTo(currentPosition);
      }

    }

    path.push(currentPosition);
    return path;
  }

  fireOn(board: Board) : Board {
    let finalPosition = this.getFinalPosition(board);

    // if the laser ends up off the board
    if (finalPosition === null) {
      return board
    }

    board.clearPiece(finalPosition);
    return board;
  }


  // Null if the laser flies off the board
  public getFinalPosition(board: Board) : Position | null {
    let path = this.getPathOn(board);
    let lastPosition = path[path.length - 1]!
    return lastPosition.isWithinBounds() ? lastPosition : null;
  }

  public drawPathOn(canvas : HTMLCanvasElement, board : Board) : void {

    let context = canvas.getContext("2d")!;
    let path = this.getPathOn(board);

    let squareSize = canvas.width / BOARD_SIZE;
    let offset = squareSize / 2;


    // Draw the path connected according to adjacent squares
    context.beginPath();
    context.moveTo(path[0]!.getX() * squareSize + offset, 
                   path[0]!.getY() * squareSize + offset );
    for (let i = 1; i < path.length; i++) {
      let [x, y] = path[i]!.toArray();
      context.lineTo(x * squareSize + offset, 
                     y * squareSize + offset);
    }
    let [x, y] = path[0]!.toArray();
    const gradient = context.createLinearGradient(0,0,canvas.width, canvas.height);
    gradient.addColorStop(0, "magenta");
    gradient.addColorStop(0.5, "blue");
    gradient.addColorStop(1.0, "red");
    context.strokeStyle = gradient;
    context.lineWidth = LASER_WIDTH;

    context.stroke();

  }

}
