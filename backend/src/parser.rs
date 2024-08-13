use regex::Regex;

/// Accepts the number out of a string and returns a
/// tuple with the number and the remaining string
/// if the first character is not a number, it returns None
pub fn parse_number<'a>(input: &'a str) -> (Option<usize>, &'a str) {
    if input.is_empty() {
        return (None, input);
    }
    let c = input.chars().nth(0).unwrap();
    if !c.is_numeric() {
        return (None, input);
    }

    let number = c.to_digit(10).unwrap();
    (Some(number as usize), &input[1..])
}

/// Accepts a string with "/" as the first character
/// and returns a tuple with "/" and the remaining string
/// if the first character is not "/", it returns None
pub fn parse_row<'a>(input: &'a str) -> (Option<&'a str>, &'a str) {
    if input.is_empty() {
        return (None, input);
    }
    let c = input.chars().nth(0).unwrap();
    if c == '/' {
        return (Some("/"), &input[1..]);
    }
    (None, input)
}

/// Accepts a whitespace led string and returns a tuple
/// with the whitespace and the remaining string
/// if the first character is not whitespace, it returns None
pub fn parse_whitespace<'a>(input: &'a str) -> (Option<&'a str>, &'a str) {
    Regex::new(r"^\s+")
        .unwrap()
        .find(input)
        .map(|m| (Some(m.as_str()), &input[m.end()..]))
        .unwrap_or((None, input))
}

/// Accepts a string leading with W,B,w or b and returns a tuple
/// with the first string and the remaining string
/// if the first character is not expected return None
pub fn parse_current_player<'a>(input: &'a str) -> (Option<&'a str>, &'a str) {
    if input.is_empty() {
        return (None, input);
    }
    let c = input.chars().nth(0).unwrap();
    match c {
        'W' => (Some(&input[0..1]), &input[1..]),
        'B' => (Some(&input[0..1]), &input[1..]),
        'b' => (Some(&input[0..1]), &input[1..]),
        'w' => (Some(&input[0..1]), &input[1..]),
        _ => (None, input),
    }
}

/// Accepts a string leading with a piece descriptor (such as NN, WW, etc..)
/// and returns a tuple with the piece descriptor and the remaining string
pub fn parse_piece_fen<'a>(input: &'a str) -> (Option<&'a str>, &'a str) {
    if input.len() < 2 {
        return (None, input);
    }
    let test = &input[0..2];
    match test {
        "NN" => (Some("NN"), &input[2..]),
        "WW" => (Some("WW"), &input[2..]),
        "SS" => (Some("SS"), &input[2..]),
        "EE" => (Some("EE"), &input[2..]),
        "NW" => (Some("NW"), &input[2..]),
        "NE" => (Some("NE"), &input[2..]),
        "SW" => (Some("SW"), &input[2..]),
        "SE" => (Some("SE"), &input[2..]),
        "nn" => (Some("nn"), &input[2..]),
        "ww" => (Some("ww"), &input[2..]),
        "ss" => (Some("ss"), &input[2..]),
        "ee" => (Some("ee"), &input[2..]),
        "nw" => (Some("nw"), &input[2..]),
        "ne" => (Some("ne"), &input[2..]),
        "sw" => (Some("sw"), &input[2..]),
        "se" => (Some("se"), &input[2..]),
        _ => (None, input),
    }
}
