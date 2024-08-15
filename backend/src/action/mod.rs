use crate::board::Indexable;
use crate::board::OptimizedIndexable;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Invalid action")]
    InvalidAction,
}
pub mod standard;

pub trait Action <T : Indexable> : OptimizedAction <T>{
    fn validate(&self) -> Result<(), Error>;
    fn apply(&self, board: &mut T) ->  Result<(), Error> {
        self.validate()?;
        self.apply_unchecked(board);
        Ok(())
    }
}

pub trait OptimizedAction <T : OptimizedIndexable> {
    fn apply_unchecked(&self, board: &mut T);
}
