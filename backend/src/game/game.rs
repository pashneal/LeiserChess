use super::*;
use crate::action::*;
use crate::board::*;
use crate::constants::*;

pub trait GameBoard: Indexable + OptimizedIndexable + Parseable + HumanReadable + Default {}
pub trait GameAction<T: Indexable>: OptimizedAction<T> + Parseable + Default {}

/// TODO: Somehow this structure should unify the interfaces
/// of Optimized and non optimized interfaces so that it is easy to
/// test both implementations, or switch between them
pub struct Game<B: GameBoard, A: GameAction<B>> {
    current_board: B,
    history: [B; MAX_HISTORY_LENGTH],
    history_length: usize,
    actions: [A; MAX_ACTIONS],
    actions_length: usize,
}
