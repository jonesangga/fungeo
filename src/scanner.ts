// @jonesangga, 12-04-2025, MIT License.
//
// TODO: Support comment single and multiline.
//       Add token # for list and string length.

const enum TokenT {
    Comma = 100,      // Single character.
    Dollar = 200,
    LBrace = 300,
    LBracket = 400,
    LParen = 500,
    Minus = 600,
    RBrace = 695,
    RBracket = 700,
    RParen = 800,
    Semicolon = 900,
    Slash = 1000,
    Star = 1100,
    Amp = 1180,       // One or more characters.
    AmpAmp = 1190,
    Arrow = 1195,
    Bang = 1200,
    BangEq = 1210,
    Colon = 1300,
    ColonEq = 1400,
    Eq = 1500,
    EqEq = 1505,
    Greater = 1520,
    GreaterEq = 1525,
    Less = 1550,
    LessEq = 1555,
    Pipe = 1575,
    PipePipe = 1580,
    Plus = 1585,
    PlusPlus = 1590,
    False = 1600,      // Literals.
    Name = 1700,
    Number = 1800,
    String = 1900,
    True = 2000,
    EOF = 2100,        // Other.
    Error = 2200,
    Else = 2300,       // Keywords.
    Fn = 2320,
    If = 2400,
    NumT = 260,
    Return = 2800,
    StrT = 2900,
};

const TokenTName: { [key in TokenT]: string } = {
    [TokenT.Amp]: "Amp",
    [TokenT.AmpAmp]: "AmpAmp",
    [TokenT.Arrow]: "Arrow",
    [TokenT.Bang]: "Bang",
    [TokenT.BangEq]: "BangEq",
    [TokenT.Colon]: "Colon",
    [TokenT.ColonEq]: "ColonEq",
    [TokenT.Comma]: "Comma",
    [TokenT.Dollar]: "Dollar",
    [TokenT.Else]: "Else",
    [TokenT.EOF]: "EOF",
    [TokenT.Eq]: "Eq",
    [TokenT.EqEq]: "EqEq",
    [TokenT.Error]: "Error",
    [TokenT.False]: "False",
    [TokenT.Fn]: "Fn",
    [TokenT.Greater]: "Greater",
    [TokenT.GreaterEq]: "GreaterEq",
    [TokenT.If]: "If",
    [TokenT.LBrace]: "LBrace",
    [TokenT.LBracket]: "LBracket",
    [TokenT.Less]: "Less",
    [TokenT.LessEq]: "LessEq",
    [TokenT.LParen]: "LParen",
    [TokenT.Minus]: "Minus",
    [TokenT.Name]: "Name",
    [TokenT.Number]: "Number",
    [TokenT.NumT]: "NumT",
    [TokenT.Pipe]: "Pipe",
    [TokenT.PipePipe]: "PipePipe",
    [TokenT.Plus]: "Plus",
    [TokenT.PlusPlus]: "PlusPlus",
    [TokenT.RBrace]: "RBrace",
    [TokenT.RBracket]: "RBracket",
    [TokenT.Return]: "Return",
    [TokenT.RParen]: "RParen",
    [TokenT.Semicolon]: "Semicolon",
    [TokenT.Slash]: "Slash",
    [TokenT.Star]: "Star",
    [TokenT.String]: "String",
    [TokenT.StrT]: "StrT",
    [TokenT.True]: "True",
};

interface Token {
    kind:          TokenT;
    line:          number;
    lexeme:        string;
}

let source  = "";
let start   = 0;
let current = 0;
let line    = 1;

function is_digit(c: string): boolean {
    return c >= '0' && c <= '9';
}

function is_alpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
           c === '_';
}

function advance(): string {
    current++;
    return source[current - 1];
}

function is_at_end(): boolean {
    return current === source.length;
}

function peek(): string {
    return source[current];
}

function peek_next(): string {
    return source[current + 1];
}

function match(expected: string): boolean {
    if (is_at_end()) return false;
    if (source[current] !== expected) return false;
    current++;
    return true;
}

function token_lexeme(kind: TokenT): Token {
    let lexeme = source.slice(start, current);
    return { kind, lexeme, line };
}

function token_string(kind: TokenT): Token {
    let lexeme = source.slice(start + 1, current - 1);
    return { kind, lexeme, line };
}

function token_error(errorMessage: string): Token {
    return { kind: TokenT.Error, lexeme: errorMessage, line };
}

function name_type(): TokenT {
    switch (source.slice(start, current)) {
        case "else":    return TokenT.Else;
        case "false":   return TokenT.False;
        case "fn":     return TokenT.Fn;
        case "if":      return TokenT.If;
        case "Num":  return TokenT.NumT;
        case "return":  return TokenT.Return;
        case "Str":  return TokenT.StrT;
        case "true":    return TokenT.True;
    }

    return TokenT.Name;
}

function name(): Token {
    while (is_alpha(peek()) || is_digit(peek()))
        advance();
    return token_lexeme(name_type());
}

function number_(): Token {
    while (is_digit(peek()))
        advance();

    // Look for a fractional part.
    if (peek() === '.' && is_digit(peek_next())) {
        advance();                  // Consume the ".".
        while (is_digit(peek()))
            advance();
    }

    return token_lexeme(TokenT.Number);
}

function string_(): Token {
    while (peek() != '"' && !is_at_end()) {
        if (peek() == '\n')
            line++;
        advance();
    }

    if (is_at_end())
        return token_error("unterminated string");

    advance();          // Consume the closing quote.
    return token_string(TokenT.String);
}

function skip_whitespace(): void {
    for (;;) {
        let c = peek();
        switch (c) {
            case ' ':
            case '\r':
            case '\t':
                advance();
                break;
            case '\n':
                line++;
                advance();
                break;
            default:
                return;
        }
    }
}

const scanner = {
    init(source_: string): void {
        source  = source_;
        start   = 0;
        current = 0;
        line    = 1;
    },

    next(): Token {
        skip_whitespace();
        start = current;

        if (is_at_end()) return token_lexeme(TokenT.EOF);

        let c = advance();
        if (is_digit(c)) return number_();
        if (is_alpha(c)) return name();
        
        switch (c) {
            case '(': return token_lexeme(TokenT.LParen);
            case ')': return token_lexeme(TokenT.RParen);
            case '[': return token_lexeme(TokenT.LBracket);
            case ']': return token_lexeme(TokenT.RBracket);
            case '{': return token_lexeme(TokenT.LBrace);
            case '}': return token_lexeme(TokenT.RBrace);
            case '$': return token_lexeme(TokenT.Dollar);
            case ';': return token_lexeme(TokenT.Semicolon);
            case ',': return token_lexeme(TokenT.Comma);
            case '/': return token_lexeme(TokenT.Slash);
            case '*': return token_lexeme(TokenT.Star);
            case '"': return string_();

            case '-': return token_lexeme(
                match('>') ? TokenT.Arrow : TokenT.Minus);
            case '|': return token_lexeme(
                match('|') ? TokenT.PipePipe : TokenT.Pipe);
            case '&': return token_lexeme(
                match('&') ? TokenT.AmpAmp : TokenT.Amp);
            case ':': return token_lexeme(
                match('=') ? TokenT.ColonEq : TokenT.Colon);
            case '<': return token_lexeme(
                match('=') ? TokenT.LessEq : TokenT.Less);
            case '>': return token_lexeme(
                match('=') ? TokenT.GreaterEq : TokenT.Greater);
            case '=': return token_lexeme(
                match('=') ? TokenT.EqEq : TokenT.Eq);
            case '!': return token_lexeme(
                match('=') ? TokenT.BangEq : TokenT.Bang);
            case '+': return token_lexeme(
                match('+') ? TokenT.PlusPlus : TokenT.Plus);
        }
     
        return token_error(`unexpected character ${c}`);
    },

    all(): Token[] {
        let result = [];
        do {
            result.push(this.next());
        } while (!is_at_end());

        result.push(this.next());       // Get the EOF token.
        return result;
    },

    all_string(): string {
        let result = "";
        let line = -1;

        for (;;) {
            let token = this.next();
            if (token.line !== line) {
                result += `${ pad4(token.line) } `;
                line = token.line;
            } else {
                result += "   | ";
            }
            result += `${ pad9(TokenTName[token.kind]) } '${ token.lexeme }'\n`;

            if (token.kind === TokenT.EOF) break;
        }
        return result;
    }
}

// Helpers for formating.
function pad9(str: string): string {
    return (str+'         ').slice(0, 9);
}

function pad4(n: number): string {
    return ('   '+n).slice(-4);
}

export { TokenT, TokenTName, Token, scanner };
