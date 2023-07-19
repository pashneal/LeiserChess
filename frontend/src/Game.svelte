<script>
  import Board from "./Board.svelte";
  import { commitState } from "./store.js";
</script>

<div id="board">
  <Board />
</div>

<button on:click={() => commitState()}>Commit</button>
<style>
  #board {
    display: flex;
    justify-content: center;
    align-items: center;
  }


</style>
