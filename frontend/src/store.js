import { writable } from 'svelte/store';
import { BoardState } from './board';


let openingPosition = "ss7/3nwse3/2nwse4/1nwse3NW1/1se3NWSE1/4NWSE2/3NWSE3/7NN";
let board = BoardState.fromFEN(openingPosition);
export const boardState = writable(board);

