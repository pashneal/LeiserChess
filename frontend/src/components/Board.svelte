<script>
  // Declare a board size property
  import { onMount } from 'svelte';
  import Cell from "./Cell.svelte"; 
  import Piece from "./Piece.svelte";
  import { currentPlayer, highlightSquares , boardState , interactWithSquare, lasers} from '../store.js';

  let boardRef;
  let canvasRef;


  onMount( () => {
    const canvas = canvasRef;
    canvas.width = boardRef.clientWidth;
    canvas.height = boardRef.clientHeight;

    const ctx = canvas.getContext('2d');
    console.log(ctx);

    ctx.fillStyle = 'orange';
    ctx.fillRect(30, 30, 30, 30);
  })

  $: if(canvasRef) {
    $lasers[$currentPlayer].drawPath(canvasRef)
  };
  


</script>

<div id="border">
  <div class="board" bind:this={boardRef}>
    {#each $boardState.squares() as [piece, [row, col]] (piece.uiIndex() + row + col) }
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
  </div>
</div>

<canvas id="laserCanvas" class="board" bind:this={canvasRef}></canvas>

<style>
  #border {
    border: 30px solid #eee;
    flex-shrink: 0;
    justify-content: center;
  }
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

  #laserCanvas {
    position: absolute;
    pointer-events: none;
  }
</style>
