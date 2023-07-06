<!-- Create a square -->
<script>
  import Piece from "./Piece.svelte";

  export let row = 0;
  export let col = 0;
  export let highlight = "none";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  function clicked() {
    dispatch("clicked", {
      row,
      col
    });
  }
</script>


<div 
  on:click={clicked} 
  on:keydown={clicked} 
  highlight={(highlight || "").toString()} 
>
  {#if row % 2 === col % 2}
    <div class="cell light">
      <slot></slot>
    </div>
  {:else}
    <div class="cell dark">
      <slot></slot>
    </div>
  {/if}
</div>


<style>
  div {
    width: 100%;
    height: 100%;
    background-color: #fff;
    font-size: 40%;
    flex-shrink: 0;
    box-sizing: border-box;
    aspect-ratio: 1;
  }

  .light {
    background-color: #eee;
  }

  .dark {
    background-color: #333;
  }


  [highlight='1'] {
  }
</style>

