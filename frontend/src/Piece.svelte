
<script>
  export let name;
  export let color;
  export let direction;
</script>

<div class="{color} {name} {direction}"> 
  {#if name == "queen"}
    ♕
  {:else if name == "pawn"}
    <svg viewBox="0 0 100 100" >
        <polygon class="polygon-shape" points="25,25 75,75 75,25" />
    </svg>
  {/if}

</div>

<style>

  div {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    font-size: 40px;
    font-weight: bold;
    margin: 0;
    padding: 0;
  }

  .light {
    color: red;
    fill: red;
  }

  .dark {
    color: blue;
    fill: blue;
  }

  svg {
    box-sizing: border-box;
    height: 100%;
    width: 100%;
  }
  
  .polygon-shape {
    width: 100%;
    height: 100%;
  }

  .north-east {
    transform: rotate(180deg);
  }

  .north-west {
    transform: rotate(90deg);
  }

  .south-east {
    transform: rotate(270deg); }

  .south-west {
    transform: rotate(0deg);
  }

  .east {
    transform: rotate(90deg);
  }

  .west {
    transform: rotate(-90deg);
  }

  .south {
    transform: rotate(-180deg);
  }

  .north {
    transform: rotate(0deg);
  }
  
</style>

