use super::*;
use crate::action::Error;
use crate::board::*;
use crate::constants::*;

pub struct StandardAction {
    /// Locations of pieces that are to be removed from the board
    victims: Vec<GridLocation>,
    /// The initial location of the piece that is to be moved
    source: GridLocation,
    /// The final locations of the pieces that are to be moved
    destination: GridLocation,
    /// Piece to be transformed (with original rotation)
    piece: StandardPiece,
    /// Rotation of the piece
    new_direction: Option<Direction>,
}

impl StandardAction {
    pub fn new(
        victims: Vec<GridLocation>,
        source: GridLocation,
        destination: GridLocation,
        piece: StandardPiece,
        new_direction: Option<Direction>,
    ) -> Self {
        StandardAction {
            victims,
            source,
            destination,
            piece,
            new_direction,
        }
    }
}

impl Action<LeiserChessGrid> for StandardAction {
    fn validate(&self, board: &LeiserChessGrid) -> Result<(), Error> {
        if self.victims.len() > MAX_VICTIMS {
            return Err(Error::InvalidAction("Too many victims".to_string()));
        }

        let square = board
            .get(&self.destination)
            .expect("Unable to get destination location");
        if let Some(piece) = square {
            if matches!(piece.kind, Kind::Monarch) {
                return Err(Error::InvalidAction(
                    "Monarchs cannot be shoved".to_string(),
                ));
            }

            // TODO: make sure to check if rules specify
            // whether pieces can be shoved if they are equal
            if self.source.qi() <= self.destination.qi() {
                return Err(Error::InvalidAction(
                    "Must shove from higher qi square".to_string(),
                ));
            }
        }
        if let Some(_) = self.new_direction {
            if self.source != self.destination {
                return Err(Error::InvalidAction(
                    "Source location and destination location must be the same for a rotation"
                        .to_string(),
                ));
            }
        } else {
            if !self.source.is_adjacent(&self.destination) {
                return Err(Error::InvalidAction(
                    "Source location must be adjacent to destination location".to_string(),
                ));
            }
        }

        Ok(())
    }
}

impl OptimizedAction<LeiserChessGrid> for StandardAction {
    fn apply_unchecked(&self, board: &mut LeiserChessGrid) {
        for victim in &self.victims {
            board.remove_unchecked(victim);
        }
        let mut piece = self.piece.clone();
        piece.direction = self.new_direction.unwrap_or(self.piece.direction);
        board.set_unchecked(&self.destination, piece);
    }
}

impl Parseable for StandardAction {
    fn from_str(fen: &str) -> Self {
        // TODO: there's no way to guarantee uniqueness
        // of a standard action with the current format,
        // as the initial location would be needed
        unimplemented!()
    }

    fn to_string(&self) -> String {
        let location = self.destination.to_string();
        if let Some(direction) = self.new_direction {
            let rotation = rotation_str(self.piece.direction, direction).expect("Invalid rotation");
            format!("{}{}", location, rotation)
        } else {
            format!("_{}", location)
        }
    }
}
