use super::*;

#[derive(Clone, Copy, Debug)]
pub enum Color {
    White,
    Black,
}

#[derive(Clone, Copy, Debug)]
pub enum Kind {
    Pawn,
    Monarch,
}

#[derive(Clone, Copy, Debug)]
pub enum Orthogonal {
    North,
    South,
    East,
    West,
}
#[derive(Clone, Copy, Debug)]
pub enum Diagonal {
    NorthEast,
    NorthWest,
    SouthEast,
    SouthWest,
}

#[derive(Clone, Copy, Debug)]
pub enum Direction {
    Diagonal(Diagonal),
    Orthogonal(Orthogonal),
}

/// Given a valid two directions whose angle is 90, 180, or 270 degrees,
/// return a convention string for the rotation
///
/// "R" - rotate old right by 90 degrees to get new
/// "U" - rotate old by 180 degrees to get new
/// "L" - rotate old left by 90 degrees to get new
pub fn rotation_str(old: Direction, new: Direction) -> &'static str{
    use Direction::*;
    use self::Orthogonal::*;
    use self::Diagonal::*;

    match (old, new) {
        (Diagonal(_), Orthogonal(_)) => panic!("Invalid rotation"),
        (Orthogonal(_), Diagonal(_)) => panic!("Invalid rotation"),
        (Orthogonal(a), Orthogonal(b)) => {
            match (a, b) {
                (North, East) => "R",
                (North, South) => "U",
                (North, West) => "L",
                (East, South) => "R",
                (East, West) => "U",
                (East, North) => "L",
                (South, West) => "R",
                (South, North) => "U",
                (South, East) => "L",
                (West, North) => "R",
                (West, East) => "U",
                (West, South) => "L",
                _ => panic!("Cannot rotate to self {:?}", (a,b)),
            }
        },
        (Diagonal(a), Diagonal(b)) => {
            match (a,b) {
                (NorthEast, SouthEast) => "R",
                (NorthEast, SouthWest) => "U",
                (NorthEast, NorthWest) => "L",
                (SouthEast, SouthWest) => "R",
                (SouthEast, NorthWest) => "U",
                (SouthEast, NorthEast) => "L",
                (SouthWest, NorthWest) => "R",
                (SouthWest, NorthEast) => "U",
                (SouthWest, SouthEast) => "L",
                (NorthWest, NorthEast) => "R",
                (NorthWest, SouthEast) => "U",
                (NorthWest, SouthWest) => "L",
                _ => panic!("Cannot rotate to self {:?}", (a,b)),
            }
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub struct StandardPiece {
    pub color: Color,
    pub kind: Kind,
    pub direction: Direction,
}

impl Parseable for StandardPiece {
    fn from_str(notation: &str) -> StandardPiece {
        match notation {
            "NN" => StandardPiece {
                color: Color::White,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::North),
            },
            "WW" => StandardPiece {
                color: Color::White,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::West),
            },
            "SS" => StandardPiece {
                color: Color::White,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::South),
            },
            "EE" => StandardPiece {
                color: Color::White,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::East),
            },
            "NW" => StandardPiece {
                color: Color::White,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::NorthWest),
            },
            "NE" => StandardPiece {
                color: Color::White,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::NorthEast),
            },
            "SW" => StandardPiece {
                color: Color::White,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::SouthWest),
            },
            "SE" => StandardPiece {
                color: Color::White,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::SouthEast),
            },
            "nn" => StandardPiece {
                color: Color::Black,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::North),
            },
            "ww" => StandardPiece {
                color: Color::Black,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::West),
            },
            "ss" => StandardPiece {
                color: Color::Black,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::South),
            },
            "ee" => StandardPiece {
                color: Color::Black,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::East),
            },
            "nw" => StandardPiece {
                color: Color::Black,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::NorthWest),
            },
            "ne" => StandardPiece {
                color: Color::Black,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::NorthEast),
            },
            "sw" => StandardPiece {
                color: Color::Black,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::SouthWest),
            },
            "se" => StandardPiece {
                color: Color::Black,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::SouthEast),
            },
            _ => panic!("Invalid piece notation"),
        }
    }

    fn to_string(&self) -> String {
        match self {
            &StandardPiece {
                color: Color::White,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::North),
            } => "NN".to_string(),
            &StandardPiece {
                color: Color::White,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::West),
            } => "WW".to_string(),
            &StandardPiece {
                color: Color::White,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::South),
            } => "SS".to_string(),
            &StandardPiece {
                color: Color::White,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::East),
            } => "EE".to_string(),
            &StandardPiece {
                color: Color::White,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::NorthWest),
            } => "NW".to_string(),
            &StandardPiece {
                color: Color::White,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::NorthEast),
            } => "NE".to_string(),
            &StandardPiece {
                color: Color::White,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::SouthWest),
            } => "SW".to_string(),
            &StandardPiece {
                color: Color::White,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::SouthEast),
            } => "SE".to_string(),
            &StandardPiece {
                color: Color::Black,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::North),
            } => "nn".to_string(),
            &StandardPiece {
                color: Color::Black,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::West),
            } => "ww".to_string(),
            &StandardPiece {
                color: Color::Black,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::South),
            } => "ss".to_string(),
            &StandardPiece {
                color: Color::Black,
                kind: Kind::Monarch,
                direction: Direction::Orthogonal(Orthogonal::East),
            } => "ee".to_string(),
            &StandardPiece {
                color: Color::Black,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::NorthWest),
            } => "nw".to_string(),
            &StandardPiece {
                color: Color::Black,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::NorthEast),
            } => "ne".to_string(),
            &StandardPiece {
                color: Color::Black,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::SouthWest),
            } => "sw".to_string(),
            &StandardPiece {
                color: Color::Black,
                kind: Kind::Pawn,
                direction: Direction::Diagonal(Diagonal::SouthEast),
            } => "se".to_string(),
            _ => panic!("Invalid piece"),
        }
    }
}
