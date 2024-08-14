use super::*;
use crate::parser::*;

pub struct Position {
    x: usize,
    y: usize,
}

#[derive(Clone, Debug)]
pub struct Grid {
    squares: [[Option<StandardPiece>; 8]; 8],
}

impl HumanReadable for Grid {}

impl Indexable for Grid {
    fn validate_position(&self, position: &Position) -> Result<(), Error> {
        if position.x > 7 || position.y > 7 {
            return Err(Error::InvalidPosition);
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

impl OptimizedIndexable for Grid {
    type Piece = StandardPiece;
    type Position = Position;

    fn get_unchecked(&self, position: &Position) -> Option<StandardPiece> {
        let Position { x, y } = *position;
        self.squares[y][x]
    }

    fn set_unchecked(&mut self, position: &Position, piece: StandardPiece) {
        let Position { x, y } = *position;
        self.squares[y][x] = Some(piece);
    }

    fn remove_unchecked(&mut self, position: &Position) {
        let Position { x, y } = *position;
        self.squares[y][x] = None;
    }
}

impl Parseable for Grid {
    fn from_fen(fen: &str) -> Self {
        let mut grid = Grid {
            squares: [[None; 8]; 8],
        };
        let mut fen = fen;
        let mut x = 0;
        let mut y = 0;
        while fen.len() > 0 {
            let (piece, rest) = parse_piece_fen(&fen);
            if let Some(piece) = piece {
                grid.squares[y][x] = Some(StandardPiece::from_fen(piece));
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

    fn to_fen(&self) -> String {
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
                        result.push_str(&piece.to_fen());
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
        let grid = Grid::from_fen(opening_position);
        println!("{}", grid.human_readable());
        assert_eq!(grid.to_fen(), opening_position);
    }

    #[test]
    pub fn parses_current_player() {
        let opening_position = "nn6nn/sesw1sesw1sesw/8/8/8/8/NENW1NENW1NENW/SS6SS B";
        let gridw = Grid::from_fen(opening_position);
        let opening_position = "nn6nn/sesw1sesw1sesw/8/8/8/8/NENW1NENW1NENW/SS6SS W";
        let gridb = Grid::from_fen(opening_position);
        assert_eq!(gridw.to_fen(), gridb.to_fen());
    }

    #[test]
    pub fn piece_validation() {
        let grid = Grid {
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
}
