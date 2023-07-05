<!-- Create a square -->
<script>
  export let row = 0;
  export let col = 0;
  export let selected = false;
  import Piece from "./Piece.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  function clicked() {
    console.log(row,col);
    dispatch("clicked", {
      row,
      col
    });
  }
</script>


<div on:click={clicked} on:keydown={clicked}>
  {#if row % 2 === col % 2}
    <div class="cell light" selected={selected}>
      <slot></slot>
    </div>
  {:else}
    <div class="cell dark" selected={selected}>
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

  [selected=true] {
    border: 5px solid red;
  }
</style>

