import { readable, writable , derived} from "svelte/store";
import { GameState } from "./game/state";
import { Highlighter } from "./ui/highlighter";
import { Position } from "./utils/spatial";


let openingPosition = "ss7/3nwse3/2nwse4/1nwse3NW1/1se3NWSE1/4NWSE2/3NWSE3/7NN W";
let board = GameState.fromFEN(openingPosition)
let highlighter = writable(new Highlighter(board));

export let highlightSquares = derived(
  highlighter, 
  ($highlighter) => $highlighter.highlightSquares
);

export let actionHistory = derived(
  highlighter,
  ($highlighter) => $highlighter.getGameState().getActionHistory()
);

export let boardState = derived(
  highlighter, 
  ($highlighter) => {
    let board = $highlighter.getGameState().getBoard()
    return board
  }
);

export let transition = derived(
  highlighter, 
  ($highlighter) => $highlighter.getTransition()
);


export let currentPlayer = derived(
  highlighter,
  ($highlighter) => $highlighter.getGameState().getCurrentPlayer()
);

export let lasers = derived(
  highlighter, 
  ($highlighter) => $highlighter.getGameState().getLasers()
);

export function interactWithSquare(row, col) {
  let x = col;
  let y = row;
  console.log("interacting with square " + x + " " + y)
  highlighter.update((value) => {
    value.interactWithSquare(new Position(x,y)); 
    return value
  })
}

export function undoAction() {
  highlighter.update((value) => {
    value.undo();
    return value
  })
}

export function commitState() {
  highlighter.update((value) => {
    value.commit() ; 
    console.log(value.getGameState());
    return value
  })
}
