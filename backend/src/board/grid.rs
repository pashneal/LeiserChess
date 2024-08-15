use crate::parser::*;
use super::*;
use regex::Regex;

pub struct GridPosition {
    x: usize,
    y: usize,
}

impl Parseable for GridPosition {
    fn from_str(fen : &str) -> Self {
        let re = Regex::new(r"([a-h])([1-8])").unwrap();
        let captures = re.captures(fen).unwrap();
        let x = captures.get(1).unwrap().as_str().chars().next().unwrap() as usize - 'a' as usize;
        let y = captures.get(2).unwrap().as_str().parse::<usize>().unwrap() - 1;
        GridPosition { x, y }
    }

    fn to_string(&self) -> String {
        let x = (self.x as u8 + 'a' as u8) as char;
        let y = (self.y + 1).to_string();
        format!("{}{}", x, y)
    }
}

#[derive(Clone, Debug)]
pub struct Grid {
    squares: [[Option<StandardPiece>; 8]; 8],
}

impl Board for Grid {
    fn validate_board(&self) -> Result<(), Error> {
        for row in self.squares.iter() {
            for square in row.iter() {
                if let Some(piece) = square {
                    self.validate_piece(piece)?;
                }
            }
        }
        Ok(())
    }
}
impl HumanReadable for Grid {}

impl Indexable for Grid {
    fn validate_position(&self, position: &GridPosition) -> Result<(), Error> {
        if position.x > 7 || position.y > 7 {
            return Err(Error::InvalidPosition);
        }
        Ok(())
    }

    fn validate_piece(&self, piece: &StandardPiece) -> Result<(), Error> {
        match (piece.kind, piece.direction) {
            (Kind::Monarch , Direction::Orthogonal(_)) => { Ok(()) }
            (Kind::Pawn, Direction::Diagonal(_)) => { Ok(()) }
            _ => { Err(Error::InvalidPiece) }
        }
    }
}

impl OptimizedIndexable for Grid {

    type Piece = StandardPiece;
    type Position = GridPosition;

    fn get_unchecked(&self, position: &GridPosition) -> Option<StandardPiece> {
        let GridPosition { x, y } = *position;
        self.squares[y][x]
    }

    fn set_unchecked(&mut self, position: &GridPosition, piece: StandardPiece) {
        let GridPosition { x, y } = *position;
        self.squares[y][x] = Some(piece);
    }

    fn remove_unchecked(&mut self, position: &GridPosition) {
        let GridPosition { x, y } = *position;
        self.squares[y][x] = None;
    }
}

impl Parseable for Grid {
    fn from_str(fen: &str) -> Self {
        let mut grid = Grid {
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
        let grid = Grid::from_str(opening_position);
        println!("{}", grid.human_readable());
        assert_eq!(grid.to_string(), opening_position);
    }

    #[test]
    pub fn parses_current_player() {
        let opening_position = "nn6nn/sesw1sesw1sesw/8/8/8/8/NENW1NENW1NENW/SS6SS B";
        let gridw = Grid::from_str(opening_position);
        let opening_position = "nn6nn/sesw1sesw1sesw/8/8/8/8/NENW1NENW1NENW/SS6SS W";
        let gridb = Grid::from_str(opening_position);
        assert_eq!(gridw.to_string(), gridb.to_string());
    }


    #[test]
    pub fn piece_validation() {
        let grid = Grid {
            squares: [[None; 8]; 8],
        };
        assert!(matches!(grid.validate_piece(&StandardPiece {
            color: Color::White,
            kind: Kind::Pawn,
            direction: Direction::Orthogonal(Orthogonal::North),
        }), Err(_)));

        assert!(matches!(grid.validate_piece(&StandardPiece {
            color: Color::Black,
            kind: Kind::Monarch,
            direction: Direction::Diagonal(Diagonal::NorthEast),
        }), Err(_)));
    }

    #[test]
    pub fn grid_position_parsing() {
        let position = GridPosition::from_str("a1");
        assert_eq!(position.to_string(), "a1");
        let position = GridPosition::from_str("h8");
        assert_eq!(position.to_string(), "h8");
    }

}

