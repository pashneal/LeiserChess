<script>
  // Declare a board size property
  import { flip } from "svelte/animate";
  import Cell from "./Cell.svelte";
  import Piece from "./Piece.svelte";
  import { highlightSquares , boardState , interactWithSquare } from './store.js';


</script>

<div class="board">
  {#each $boardState.board as pieces, row}
    {#each pieces as piece, col (piece.uiIndex())}
      <Cell 
        row={row} 
        col={col} 
        highlight={$highlightSquares[row][col]}

        on:clicked={() => (interactWithSquare(row,col))}
      >
        <Piece 
          piece={piece}
        />
      </Cell>
    {/each}
  {/each}
</div>




<style>
  .board{
    height: 60vh;
    width: 60vh;
    flex-shrink: 0;
    max-height: 700px;
    max-width: 700px;
    display: grid;
    box-sizing: border-box;
    grid-template-columns: repeat(8,  1fr);
    grid-template-rows: repeat(8,  1fr);
    aspect-ratio : 1;
  }

  /* Overwrite board size for smaller screens */
  @media only screen and (max-width: 600px) {
    .board {
      max-height: 340px;
      max-width: 340px;
    }
  }
</style>
