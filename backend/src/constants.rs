/// Theoretical upper bound on the number of actions that can be taken in a game.
pub const MAX_ACTIONS: usize = 100;

/// Theoretical upper bound on the number of board positions
/// that can be reached before a game terminates
pub const MAX_HISTORY_LENGTH: usize = 400; 

/// Theoretical upper bound on the number of pieces that can be removed 
/// from the board in one action
pub const MAX_VICTIMS: usize = 3;
