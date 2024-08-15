use super::*;
use crate::constants::*;
use crate::parser::*;
use regex::Regex;

pub struct GridLocation {
    pub x: usize,
    pub y: usize,
}

impl GridLocation {
    /// Returns true if the two locations are adjacent,
    /// note: a location is not adjacent to itself
    pub fn is_adjacent(&self, other: &GridLocation) -> bool {
        let dx = self.x as i32 - other.x as i32;
        let dy = self.y as i32 - other.y as i32;
        (dx.abs() <= 1) && (dy.abs() <= 1) && (dx.abs() + dy.abs() > 0)
    }

    /// Qi of a location according to LeiserChess rules
    pub fn qi(&self) -> i32 {
        let x = (self.x * 2) as i32;
        let y = (self.y * 2) as i32;
        (x - 7) * (x - 7) + (y - 7) * (y - 7)
    }
}

impl PartialEq for GridLocation {
    fn eq(&self, other: &Self) -> bool {
        self.x == other.x && self.y == other.y
    }
}

impl Parseable for GridLocation {
    fn from_str(fen: &str) -> Self {
        let re = Regex::new(r"([a-h])([1-8])").unwrap();
        let captures = re.captures(fen).unwrap();
        let x = captures.get(1).unwrap().as_str().chars().next().unwrap() as usize - 'a' as usize;
        let y = captures.get(2).unwrap().as_str().parse::<usize>().unwrap() - 1;
        GridLocation { x, y }
    }

    fn to_string(&self) -> String {
        let x = (self.x as u8 + 'a' as u8) as char;
        let y = (self.y + 1).to_string();
        format!("{}{}", x, y)
    }
}

#[derive(Clone, Debug)]
pub struct LeiserChessGrid {
    squares: [[Option<StandardPiece>; 8]; 8],
}

impl Board for LeiserChessGrid {
    fn validate_board(&self) -> Result<(), Error> {
        let mut count = 0;
        for row in self.squares.iter() {
            for square in row.iter() {
                if let Some(piece) = square {
                    self.validate_piece(piece)?;
                    count += 1;
                }
            }
        }
        if count == 0 {
            return Err(Error::InvalidBoard("No pieces on the board".to_string()));
        }
        if count > MAX_PIECES {
            return Err(Error::InvalidBoard(
                "Too many pieces on the board".to_string(),
            ));
        }
        Ok(())
    }
}
impl HumanReadable for LeiserChessGrid {}

impl Indexable for LeiserChessGrid {
    fn validate_location(&self, location: &GridLocation) -> Result<(), Error> {
        if location.x > 7 || location.y > 7 {
            return Err(Error::InvalidLocation);
        }
        Ok(())
    }

    fn validate_piece(&self, piece: &StandardPiece) -> Result<(), Error> {
        match (piece.kind, piece.direction) {
            (Kind::Monarch, Direction::Orthogonal(_)) => Ok(()),
            (Kind::Pawn, Direction::Diagonal(_)) => Ok(()),
            _ => Err(Error::InvalidPiece),
        }
    }
}

impl OptimizedIndexable for LeiserChessGrid {
    type Piece = StandardPiece;
    type Location = GridLocation;

    fn get_unchecked(&self, location: &GridLocation) -> Option<StandardPiece> {
        let GridLocation { x, y } = *location;
        self.squares[y][x]
    }

    fn set_unchecked(&mut self, location: &GridLocation, piece: StandardPiece) {
        let GridLocation { x, y } = *location;
        self.squares[y][x] = Some(piece);
    }

    fn remove_unchecked(&mut self, location: &GridLocation) {
        let GridLocation { x, y } = *location;
        self.squares[y][x] = None;
    }
}

impl Parseable for LeiserChessGrid {
    fn from_str(fen: &str) -> Self {
        let mut grid = LeiserChessGrid {
            squares: [[None; 8]; 8],
        };
        let mut fen = fen;
        let mut x = 0;
        let mut y = 0;
        while fen.len() > 0 {
            let (piece, rest) = parse_piece_fen(&fen);
            if let Some(piece) = piece {
                grid.squares[y][x] = Some(StandardPiece::from_str(piece));
                x += 1;
                fen = rest;
                continue;
            }
            let (number, rest) = parse_number(&fen);
            if let Some(number) = number {
                x += number;
                fen = rest;
                continue;
            }
            let (row, rest) = parse_row(&fen);
            if let Some(_) = row {
                y += 1;
                x = 0;
                fen = rest;
                continue;
            }
            let (whitespace, rest) = parse_whitespace(&fen);
            if let Some(_) = whitespace {
                fen = rest;
                continue;
            }
            let (current_player, rest) = parse_current_player(&fen);
            if let Some(_) = current_player {
                // TODO: this is a suprise tool that can help us later...
                fen = rest;
                continue;
            }
        }

        grid
    }

    fn to_string(&self) -> String {
        let mut result = String::new();
        for row in self.squares.iter() {
            let mut empty = 0;
            for square in row.iter() {
                match square {
                    Some(piece) => {
                        if empty > 0 {
                            result.push_str(&empty.to_string());
                            empty = 0;
                        }
                        result.push_str(&piece.to_string());
                    }
                    None => empty += 1,
                }
            }
            if empty > 0 {
                result.push_str(&empty.to_string());
            }
            result.push('/');
        }
        result.pop();
        result
    }
}

#[cfg(test)]
pub mod grid_tests {
    use super::*;
    #[test]
    pub fn fen_parsing() {
        let opening_position = "nn6nn/sesw1sesw1sesw/8/8/8/8/NENW1NENW1NENW/SS6SS";
        let grid = LeiserChessGrid::from_str(opening_position);
        println!("{}", grid.human_readable());
        assert_eq!(grid.to_string(), opening_position);
    }

    #[test]
    pub fn parses_current_player() {
        let opening_position = "nn6nn/sesw1sesw1sesw/8/8/8/8/NENW1NENW1NENW/SS6SS B";
        let gridw = LeiserChessGrid::from_str(opening_position);
        let opening_position = "nn6nn/sesw1sesw1sesw/8/8/8/8/NENW1NENW1NENW/SS6SS W";
        let gridb = LeiserChessGrid::from_str(opening_position);
        assert_eq!(gridw.to_string(), gridb.to_string());
    }

    #[test]
    pub fn piece_validation() {
        let grid = LeiserChessGrid {
            squares: [[None; 8]; 8],
        };
        assert!(matches!(
            grid.validate_piece(&StandardPiece {
                color: Color::White,
                kind: Kind::Pawn,
                direction: Direction::Orthogonal(Orthogonal::North),
            }),
            Err(_)
        ));

        assert!(matches!(
            grid.validate_piece(&StandardPiece {
                color: Color::Black,
                kind: Kind::Monarch,
                direction: Direction::Diagonal(Diagonal::NorthEast),
            }),
            Err(_)
        ));
    }

    #[test]
    pub fn grid_location_parsing() {
        let location = GridLocation::from_str("a1");
        assert_eq!(location.to_string(), "a1");
        let location = GridLocation::from_str("h8");
        assert_eq!(location.to_string(), "h8");
    }
}
