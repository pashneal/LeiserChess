<script>
  import Board from "./Board.svelte";
  import { commitState } from "./store.js";
</script>

<div class="container">
  <Board />
  <button on:click={() => commitState()}>Commit</button>
</div>

<style>
  .container{
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    align-items: center;
  }
</style>
