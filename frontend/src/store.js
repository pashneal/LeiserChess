import { writable } from 'svelte/store';
import { PieceDescriptor } from './piece.ts';


export const boardState = writable([
  [fen("SS"), null, null, null, null, null, null, null],
  [null, null, fen("SE"), null, null, null, null, null],
  [null, fen("SE"), fen("NW"), null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, fen("nn")],
]);

export function fen(descriptor) {
  if (descriptor == null) {
    return null
  }
  if (descriptor == "NN") {
    return PieceDescriptor.light().queen().north()
  }
  if (descriptor == "SS") {
    return PieceDescriptor.light().queen().south()
  }
  if (descriptor == "EE") {
    return PieceDescriptor.light().queen().east()
  }
  if (descriptor == "WW") {
    return PieceDescriptor.light().queen().west()
  }
  if (descriptor == "nn") {
    return PieceDescriptor.dark().queen().north()
  }
  if (descriptor == "ss") {
    return PieceDescriptor.dark().queen().south()
  }
  if (descriptor == "ww") {
    return PieceDescriptor.dark().queen().west()
  }
  if (descriptor == "ee") {
    return PieceDescriptor.dark().queen().east()
  }
  if (descriptor == "NW") {
    return PieceDescriptor.light().pawn().nw()
  }
  if (descriptor == "NE") {
    return PieceDescriptor.light().pawn().ne()
  }
  if (descriptor == "SW") {
    return PieceDescriptor.light().pawn().sw()
  }
  if (descriptor == "SE") {
    return PieceDescriptor.light().pawn().se()
  }
  if (descriptor == "se") {
    return PieceDescriptor.dark().pawn().se()
  }
  if (descriptor == "sw") {
    return PieceDescriptor.dark().pawn().sw()
  }
  if (descriptor == "ne") {
    return PieceDescriptor.dark().pawn().ne()
  }
  if (descriptor == "nw") {
    return PieceDescriptor.dark().pawn().nw()
  }
  return null
}
