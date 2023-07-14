
<script>
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { transition } from "./store.js";
  export let piece;


  let transitionFunction = $transition.ofPiece(piece);
  let cssFunction = (t) => transitionFunction( quintOut(t) );


  let name = (piece.isEmpty()) ? "": piece.getType() ;
  let color = (piece.isEmpty()) ? "": piece.getColor() ;
  let direction = (piece.isEmpty()) ? "": piece.getDirection() ;


  function moveIn( node, { duration = 400, cssFunc = moveEast} ){
    const style = getComputedStyle(node);

    return {
      duration,
      css : cssFunc,
    }; 
  }

</script>


<div in:moveIn={{duration : 400, cssFunc : cssFunction}} class="{color} {name}"> 
  {#if name === "queen"}
    <div direction={direction}>
    ♕
    </div>
  {:else if name === "pawn"}
    <svg viewBox="0 0 100 100" direction={direction}> 
        <polygon class="polygon-shape" points="25,25 75,75 75,25" />
    </svg>
  {/if}
</div>

<style>

  div {
    box-sizing: border-box;
    position: relative;
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

  
  .polygon-shape {
    width: 100%;
    height: 100%;
  }

  [direction=north-east] {
    transform: rotate(180deg);
  }

  [direction=north-west] {
    transform: rotate(90deg);
  }

  [direction=south-east] {
    transform: rotate(270deg); 
  }

  [direction=south-west] {
    transform: rotate(0deg);
  }

  [direction=east] {
    transform: rotate(90deg);
  }

  [direction=west] {
    transform: rotate(-90deg);
  }

  [direction=south] {
    transform: rotate(-180deg);
  }

  [direction=north] {
    transform: rotate(0deg);
  }
  
  svg {
    box-sizing: border-box;
    height: 100%;
    width: 100%;
  }

</style>

