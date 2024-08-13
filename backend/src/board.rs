use thiserror::Error;
use crate::action::Action;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Invalid move")]
    MoveError,
}

pub trait Board : OptimizedBoard + Clone {
    /// Perform simple logical validations on the current board
    fn validate_board(&self) -> Result<(), Error>;
    /// Perform simple logical validations on the board
    /// after applying any given action
    fn validate_difference(&self, old_board : &Self) -> Result<(), Error>;

    /// Given a valid action, apply it to the board and 
    /// perform checks to ensure validity of the board
    fn apply_action(&mut self, action : &impl Action) -> Result<(), Error> {
        self.validate_board()?;
        self.apply_action_unchecked(action);
        self.validate_difference(&self.clone())?;
        Ok(())
    }
}

pub trait OptimizedBoard {
    fn apply_action_unchecked(&mut self, action : &impl Action);
}

pub trait ParseableBoard : OptimizedBoard {
    fn from_fen(fen : &str) -> Self;
    fn to_fen(&self) -> String;
}

pub trait Indexable : OptimizedIndexable {
    /// Perform simple logical validations on the current position
    fn validate_position(&self, position : &Self::Position) -> Result<(), Error>;
    /// Perform simple logical validations on the current piece
    fn validate_piece(&self, piece : &Self::Piece) -> Result<(), Error>;

    fn get_piece(&self, position : &Self::Position) -> Result<Option<Self::Piece>, Error> {
        self.validate_position(position)?;
        Ok(self.get_unchecked(position))
    }

    fn set_piece(&mut self, position : &Self::Position, piece : Self::Piece) -> Result<(), Error> {
        self.validate_position(position)?;
        self.validate_piece(&piece)?;
        self.set_unchecked(position, piece);
        Ok(())
    }

    fn remove_piece(&mut self, position : &Self::Position) -> Result<(), Error> {
        self.validate_position(position)?;
        self.remove_unchecked(position);
        Ok(())
    }

}

pub trait OptimizedIndexable {
    type Position;
    type Piece;

    fn get_unchecked(&self, position : &Self::Position) -> Option<Self::Piece>;
    fn set_unchecked(&mut self, position : &Self::Position, piece : Self::Piece);
    fn remove_unchecked(&mut self, position : &Self::Position);
}
