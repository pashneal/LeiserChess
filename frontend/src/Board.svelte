<script>
  // Declare a board size property
  import Cell from "./Cell.svelte";
  import Piece from "./Piece.svelte";
  import { highlightSquares , boardState , interactWithSquare } from './store.js';


</script>

<div class="board">
  {#each $boardState.toArray() as pieces, row}
    {#each pieces as piece, col (piece.id())}
      <Cell 
        row={row} 
        col={col} 
        highlight={$highlightSquares[row][col]}

        on:clicked={() => (interactWithSquare(row,col))}
      >
        <Piece 
          name={(piece) ? piece.pieceType : ""} 
          color={(piece) ? piece.pieceColor : ""} 
          direction={(piece) ? piece.direction : ""}
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
