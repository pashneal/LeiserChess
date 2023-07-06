import { readable, writable , derived} from 'svelte/store';
import { BoardState , Highlighter} from './board';


let openingPosition = "ss7/3nwse3/2nwse4/1nwse3NW1/1se3NWSE1/4NWSE2/3NWSE3/7NN";
let board = BoardState.fromFEN(openingPosition)
let highlighter = writable(new Highlighter(board));

export let highlightSquares = derived(
  highlighter, 
  ($highlighter) => $highlighter.highlightSquares
);

export let boardState = derived(
  highlighter, 
  ($highlighter) => $highlighter.getTransformedBoard() 
);

export function interactWithSquare(x , y) {
  highlighter.update((value) => {value.toggleSquare([x,y]) ; return value})
}

