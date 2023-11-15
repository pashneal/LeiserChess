import { readable, writable , derived} from "svelte/store";
import { GameState } from "./game/state";
import { Highlighter } from "./ui/highlighter";
import { Position } from "./utils/spatial";


let openingPosition = "nn6nn/sesw1sesw1sesw/8/8/8/8/NENW1NENW1NENW/SS6SS W";
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

export let canCommit = derived(
  highlighter, 
  ($highlighter) => $highlighter.canCommit()
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

export function goToMove(moveNumber) {
  if (moveNumber == null) { return }
  console.log("going to move " + moveNumber)
  highlighter.update((value) => {
    let successful = value.goToMove(moveNumber);
    return value
  })
}
