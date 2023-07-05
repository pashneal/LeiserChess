import { fen } from './piece';

// Returns a transformed string and a
// captured input if it matches
export function parsePiece(input) {
  // Get first two characters of input
  let descriptor = input.slice(0, 2);
  let piece = fen(descriptor);
  if (piece == null) {
    return [null, input];
  }

  return [piece, input.slice(2)];
}

export function parseRow(input) {
  if (input[0] == "/") {
    return ["/", input.slice(1)];
  }
  return [null, input];
}

export function parseNumber(input) {
  let number = parseInt(input[0]);
  if (isNaN(number)) {
    return [null, input];
  }
  if (number > 1) {
    input = (number - 1) + input.slice(1);
  } else {
    input = input.slice(1);
  }
  return [1, input];
}

export function parseBoard(input) {
  let board = Array(8).fill(null).map(() => Array(8).fill(null));
  let row = 0;
  let col = 0;
  while (input) {
    let [newPiece, pieceMatched] = parsePiece(input);
    let [numberCaptured, numberMatched] = parseNumber(input);
    let [rowCaptured, newRowMatched] = parseRow(input);

    if  (newPiece) {
      board[row][col] = newPiece;
      input = pieceMatched;
      col += 1;
    } else if (numberCaptured){
      input = numberMatched;
      col += 1;
    } else if (rowCaptured) {
      input = newRowMatched;
      row += 1;
      col = 0;
    } else {
      input = "";
    }
  }
  return board;
}

