use super::*;
use crate::board::*;
use crate::constants::*;

pub struct StandardAction {
    /// Positions of pieces that are to be removed from the board 
    victims : Vec<GridPosition>,
    /// The final position of the piece
    destination : GridPosition,
    /// Piece to be transformed (with original rotation) 
    piece : StandardPiece,
    /// Rotation of the piece
    new_direction : Option<Direction>,
}

impl StandardAction {
    pub fn new(victims: Vec<GridPosition>, destination: GridPosition, piece: StandardPiece, new_direction : Option<Direction>) -> Self {
        StandardAction {
            victims,
            destination,
            piece,
            new_direction,
        }
    }
}

impl OptimizedAction <LeiserChessGrid> for StandardAction {
    fn apply_unchecked(&self, board: &mut LeiserChessGrid) {
        for victim in &self.victims {
            board.remove_unchecked(victim);
        }
        board.set_unchecked(&self.destination, self.piece.clone());
    }
}


impl Parseable for StandardAction {
    fn from_str(fen : &str) -> Self {
        // TODO: there's no way to guarantee uniqueness
        // of a standard action with the current format,
        // as the initial position would be needed
        unimplemented!()
    }

    fn to_string(&self) -> String {
        let position = self.destination.to_string();
        if let Some(direction) = self.new_direction {
            let rotation = rotation_str(self.piece.direction, direction);
            format!("{}{}", position, rotation)
        } else {
            format!("_{}", position)
        }
    }
}
