<script>
  import { actionHistory } from "../store.js";
  import { fly } from "svelte/transition";
</script>


<div id="container">
  <h1>Move History</h1>
  <table id="moves" class = "even-width-table" >
    {#each $actionHistory as [player1, player2], index (player1 + player2)}
      <tr in:fly>
        <td>{index+1}.</td> <td>{player1}</td> <td>{player2}</td>
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


  .even-width-table th {
  }

</style>

