use super::*;
use crate::board::*;
use crate::constants::*;
use crate::action::*;


pub trait Board : Indexable + OptimizedIndexable + Parseable + HumanReadable + Default {}
pub trait Action<T : OptimizedIndexable> : OptimizedAction<T> + Parseable +  Default {}

pub struct Game<B : Board, A : Action<B> > {
    current_board : B,
    history : [B; MAX_HISTORY_LENGTH],
    history_length : usize,
    actions : [A; MAX_ACTIONS],
    actions_length : usize,
}
