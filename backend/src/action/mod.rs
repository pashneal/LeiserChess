use crate::board::Indexable;
use crate::board::OptimizedIndexable;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Invalid action {0}")]
    InvalidAction(String),
}
pub mod standard;

pub trait Action<T: Indexable>: OptimizedAction<T> {
    /// Perform simple logical validations on the current board
    /// returns error if able to tell that the action is invalid
    fn validate(&self, board: &T) -> Result<(), Error>;

    fn apply(&self, board: &mut T) -> Result<(), Error> {
        self.validate(board)?;
        self.apply_unchecked(board);
        Ok(())
    }
}

pub trait OptimizedAction<T: OptimizedIndexable> {
    fn apply_unchecked(&self, board: &mut T);
}
