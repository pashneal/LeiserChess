import { fen } from './piece';

// Returns a transformed string and a
// captured input if it matches
export function parsePiece(input) {
  // Get first two characters of input
  let descriptor = input.slice(0, 2);
  let piece = fen(descriptor);
  if (piece === null) {
    return [null, input];
  }

  return [piece, input.slice(2)];
}

export function parseRow(input) {
  if (input[0] === "/") {
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

export function parseWhitespace(input) {
  let match = input.match(/^\s+/);
  if (match) {
    return [match[0], input.slice(match[0].length)];
  }
  return [null, input];
}


export function parseCurrentPlayer(input) {
  let match = input.match(/^[wb]/i);
  if (match) {
    return [match[0], input.slice(match[0].length)];
  }
  return [null, input];
}


export function parseBoard(input) {
  let board = Array(8).fill(null).map(() => Array(8).fill(null));
  let row = 0;
  let col = 0;
  let currentPlayer;
  while (input) {
    let [newPiece, pieceMatched] = parsePiece(input);
    let [numberCaptured, numberMatched] = parseNumber(input);
    let [rowCaptured, newRowMatched] = parseRow(input);
    let [whitespaceCaptured, whitespaceMatched] = parseWhitespace(input);
    let [currentPlayerCaptured, currentPlayerMatched] = parseCurrentPlayer(input);
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
    } else if (whitespaceCaptured) {
      input = whitespaceMatched;
    } else if (currentPlayerCaptured) {
      currentPlayer = currentPlayerCaptured;
      input = currentPlayerMatched;
    } else {
      throw new Error("Could not parse after this input: " + input);
    }
  }
  currentPlayer = currentPlayer?.toLowerCase();
  currentPlayer = currentPlayer === "w" ? "light" : "dark";
  return [board, currentPlayer];
}

