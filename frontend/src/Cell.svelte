<!-- Create a square -->
<script>
  export let row = 0;
  export let col = 0;
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
  }

  .light {
    background-color: #eee;
  }
  .dark {
    background-color: #333;
  }

  .light:hover {
    background-color: #ccc;
  }
  .dark:hover {
    background-color: #555;
  }
</style>

