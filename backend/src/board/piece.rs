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
