pub mod grid;
pub mod piece;

pub use grid::*;
pub use piece::*;

pub use crate::action::Action;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Invalid move")]
    MoveError,
    #[error("Invalid board : {0}")]
    InvalidBoard(String),
    #[error("Invalid position")]
    InvalidPosition,
    #[error("Invalid piece")]
    InvalidPiece,
    #[error("Cannot remove non existent piece from board")]
    RemoveEmptyError,
}

pub trait Board: Clone {
    /// Perform simple logical validations on the current board
    fn validate_board(&self) -> Result<(), Error>;
}

pub trait Parseable {
    /// Given a string, create a unique representation of the object
    fn from_str(fen: &str) -> Self;

    /// Convert the current representation to a string
    fn to_string(&self) -> String;
}

pub trait HumanReadable: Parseable + Board{
    /// Converts a parsable board to a human readable format,
    /// where . represents an empty square
    /// and the pieces are represented by their FEN notation
    fn human_readable(&self) -> String {
        if self.validate_board().is_err() {
            panic!("Invalid board");
        }
        let fen = self.to_string();
        let mut result = String::new();
        for c in fen.chars() {
            if c == '/' {
                result.push('\n');
            } else if c.is_numeric() {
                let n = c.to_digit(10).unwrap();
                for _ in 0..n {
                    result.push_str(" .");
                }
            } else {
                result.push(c);
            }
        }
        result
    }
}

pub trait Indexable: OptimizedIndexable {
    /// Perform simple logical validations on the current position
    fn validate_position(&self, position: &Self::Position) -> Result<(), Error>;
    /// Perform simple logical validations on the current piece
    fn validate_piece(&self, piece: &Self::Piece) -> Result<(), Error>;

    fn get(&self, position: &Self::Position) -> Result<Option<Self::Piece>, Error> {
        self.validate_position(position)?;
        Ok(self.get_unchecked(position))
    }

    fn set(&mut self, position: &Self::Position, piece: Self::Piece) -> Result<(), Error> {
        self.validate_position(position)?;
        self.validate_piece(&piece)?;
        self.set_unchecked(position, piece);
        Ok(())
    }

    fn remove(&mut self, position: &Self::Position) -> Result<(), Error> {
        self.validate_position(position)?;
        let piece = self.get(position)?;
        if piece.is_none() {
            return Err(Error::RemoveEmptyError);
        }
        self.remove_unchecked(position);
        Ok(())
    }
}

pub trait OptimizedIndexable {
    type Position;
    type Piece;

    fn get_unchecked(&self, position: &Self::Position) -> Option<Self::Piece>;
    fn set_unchecked(&mut self, position: &Self::Position, piece: Self::Piece);
    fn remove_unchecked(&mut self, position: &Self::Position);
}
