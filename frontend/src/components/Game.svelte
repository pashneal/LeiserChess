<script>
  import Board from "./Board.svelte";
  import { commitState , undoAction} from "../store.js";
  import MoveHistory from "./MoveHistory.svelte"; 
</script>

<div id="title">
  <h1>LeiserChess</h1>
</div>
<div id="game">
  <div id="board">
    <Board />
  </div>

  <div id="moveHistory">
    <MoveHistory />
  </div>
</div>

<button on:click={() => commitState()}>Commit</button>
<button on:click={() => undoAction()}>Undo</button>
<style>

  #title {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  h1 {
    font-family: 'simplifica';
    font-size: min(10vw, 3em);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  #board {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #moveHistory {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Justified so that the elements try to take as much horizontal space as possible */
  #game {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

</style>
