import { Position , Direction} from "./spatialUtils"; 
import { Board } from "./board";
import { LASER_WIDTH } from "./constants"; 


export class Laser { 
  private board : Board;
  private position : Position;
  private direction : Direction;
  
  constructor( newBoard : Board, initalPosition : Position , initialDirection : Direction)  {
    this.board = newBoard;
    this.position = initalPosition;
    this.direction = initialDirection;

    if (this.position.isWithinBounds() === false) {
      throw new Error("Invalid position");
    }
  }

  public getPath() : Array<Position> {
    let board = this.board;
    let travelingDirection  : Direction | null = this.direction;
    let currentPosition = this.position;
    let path : Array<Position> = [];

      
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

  fire() : Board {
    let finalPosition = this.getFinalPosition();

    // if the laser ends up off the board
    if (finalPosition === null) {
      return this.board;
    }

    this.board.clearPiece(finalPosition);
    return this.board;
  }


  // Null if the laser flies off the board
  public getFinalPosition() : Position | null {
    let path = this.getPath();
    let lastPosition = path[path.length - 1]!
    return lastPosition.isWithinBounds() ? lastPosition : null;
  }

  public drawPath(canvas : HTMLCanvasElement) : void {

    let context = canvas.getContext("2d")!;
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    let path = this.getPath();

    let squareSize = canvas.width / 8;
    let offset = squareSize / 2;


    for (let position of path) {
      context.fillStyle = "red";
      let x = position.getX() * squareSize + offset;
      x -= LASER_WIDTH / 2;
      let y = position.getY() * squareSize + offset;
      y -= LASER_WIDTH / 2;
      context.fillRect(x,y, LASER_WIDTH, LASER_WIDTH);
    }
  }

}
