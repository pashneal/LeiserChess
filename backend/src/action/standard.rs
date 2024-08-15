use super::*;
use crate::board::*;
use crate::constants::*;
use crate::action::Error;

pub struct StandardAction {
    /// Locations of pieces that are to be removed from the board 
    victims : Vec<GridLocation>,
    /// The initial location of the piece that is to be moved 
    source : GridLocation,
    /// The final locations of the pieces that are to be moved
    destination : GridLocation,
    /// Piece to be transformed (with original rotation) 
    piece : StandardPiece,
    /// Rotation of the piece
    new_direction : Option<Direction>,
}

impl StandardAction {
    pub fn new(victims: Vec<GridLocation>, source : GridLocation,  destination: GridLocation, piece: StandardPiece, new_direction : Option<Direction>) -> Self {
        StandardAction {
            victims,
            source,
            destination,
            piece,
            new_direction,
        }
    }
}

impl Action <LeiserChessGrid> for StandardAction {
    /// TODO: Validation rules
    /// -> victims cannot exceed MAX_VICTIMS
    /// -> piece must cannot shove from lower qi square to higher qi square
    /// -> monarchs cannot be shoved 
    /// -> if there is a rotation, source must be the same as the destination
    fn validate(&self, board : &LeiserChessGrid) -> Result<(), Error> {
        
        if self.victims.len() > MAX_VICTIMS {
            return Err(Error::InvalidAction("Too many victims".to_string()));
        }
        let location = board.get(&self.source).expect("Unable to get source location");
        Ok(())
    }
}

impl OptimizedAction <LeiserChessGrid> for StandardAction {
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
    fn from_str(fen : &str) -> Self {
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
