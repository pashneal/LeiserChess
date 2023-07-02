<script>
  // Declare a board size property
  import Cell from "./Cell.svelte";
  import Piece from "./Piece.svelte";
  import { boardState } from "./store.js";


  let board;

  boardState.subscribe(value => {
    board = value;
  });
</script>

<div class="board">
  {#each Array(8) as _, row}
    {#each Array(8) as _, col}
      <Cell row={row} col={col}>
        <Piece name={(board[row][col]) ? board[row][col].pieceType : ""} 
               color={(board[row][col]) ? board[row][col].pieceColor : ""} 
               direction={(board[row][col]) ? board[row][col].direction : ""}
              />
      </Cell>
    {/each}
  {/each}
</div>


<style>

  .board{
    height: 50vh;
    width: 50vh;
    flex-shrink: 0;
    max-height: 600px;
    max-width: 600px;
    display: grid;
    box-sizing: border-box;
    grid-template-columns: repeat(8,  1fr);
    grid-template-rows: repeat(8,  1fr);
  }

  /* Overwrite board size for smaller screens */
  @media only screen and (max-width: 600px) {
    .board {
      max-height: 340px;
      max-width: 340px;
    }
  }
</style>
