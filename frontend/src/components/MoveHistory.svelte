<script>
  import { actionHistory } from "../store.js";
  import { fly } from "svelte/transition";
  import { goToMove } from "../store.js";

</script>


<div id="container">
  <h1>Move History</h1>
  <table id="moves" class = "even-width-table" >
    {#each $actionHistory as [player1, player2], index (player1 , player2, index)}
      <tr in:fly>

        <td>{index+1}.</td> 

        <td on:click={goToMove(index*2)} on:keydown={goToMove(index*2)}>
          {(player1 === null) ? "..." : player1.toString()}
        </td> 

        <td on:click={goToMove(index*2+1)} on:keydown={goToMove(index*2+1)}>
          {(player2 === null) ? "..." : player2.toString()}
        </td> 

      </tr>
    {/each}
  </table>
</div>



<style>
  h1 {
    font-family: 'simplifica';
    text-align: center;
    text-transform: lowercase;
    letter-spacing: 0.1em;
  }

  div#container {
    width: 20vh;
    height: 50vh;
    border: 1px solid black;
    padding: 10px;
    box-sizing: border-box;
    margin: 30px;
  }

  .even-width-table {
    list-style: none; /* Remove default bullet points */
    padding: 0;
    font-family: 'simplifica';
    font-weight: bold;
    font-size: 1.5em;


    letter-spacing: 0.12em;
  }

  td:hover {
    background-color: #f5f5f5;
  }


  .even-width-table th {
  }

</style>

