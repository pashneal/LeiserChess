use super::*;
use crate::board::*;
use crate::constants::*;
use crate::action::*;


pub trait Board : Indexable + OptimizedIndexable + Parseable + HumanReadable + Default {}
pub trait GameAction<T : OptimizedIndexable> : OptimizedAction<T> + Parseable +  Default {}

/// TODO: Somehow this structure should unify the interfaces
/// of Optimized and non optimized interfaces so that it is easy to 
/// test both implementations, or switch between them
pub struct Game<B : Board, A : GameAction<B> > {
    current_board : B,
    history : [B; MAX_HISTORY_LENGTH],
    history_length : usize,
    actions : [A; MAX_ACTIONS],
    actions_length : usize,
}
