# LeiserChess for Chrome 
Implementation of Lieserchess 2023 using Typescript and Svelte
Note: only works on Chrome, and only tested on Chrome.

# Launch
To launch, under `frontend/` run
```
  npm install
  npm run dev
```
Go to the provided url! (usually localhost:8080)


# Instructions 
To move a piece, click on the square then an adjacent square, then click Commit
To rotate, double-click on the square containing a piece, then click Commit

To undo a move, Either use the undo or click on the move you'd like to undo using move history

# Organization 
TODO: expand

We use distinct Actions (ex. Shove, Move, Rotation) to describe the game state, and a legal game state is one which resulted from a series of valid actions
This organization makes it much easier to implement abstract moves as Leiserchess changes from year to year.

