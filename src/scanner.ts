// @jonesangga, 12-04-2025, MIT License.
//
// TODO: Support multiline comment.

export const enum TokenT {
    Comma     = 100,    // Single character.
    Dollar    = 200,
    Dot       = 210,
    Hash      = 250,
    LBrace    = 300,
    LBracket  = 400,
    LParen    = 500,
    Minus     = 600,
    RBrace    = 695,
    RBracket  = 700,
    RParen    = 800,
    Semicolon = 900,
    Slash     = 1000,
    Star      = 1100,
    Amp       = 1180,   // One or more characters.
    AmpAmp    = 1190,
    Arrow     = 1195,
    Bang      = 1200,
    BangEq    = 1210,
    Colon     = 1300,
    ColonEq   = 1400,
    DivBy     = 1450,
    Eq        = 1500,
    EqEq      = 1505,
    Greater   = 1520,
    GreaterEq = 1525,
    Less      = 1550,
    LessEq    = 1555,
    LR        = 1560,
    Pipe      = 1575,
    PipePipe  = 1580,
    Plus      = 1585,
    PlusPlus  = 1590,
    Callable  = 1650,   // Literals.
    False     = 1700,
    Number    = 1800,
    String    = 1900,
    True      = 2000,
    EOF       = 2100,   // Other.
    Error     = 2200,
    BoolT     = 2220,   // Keywords.
    CircleT   = 2230,
    Else      = 2300,
    Fn        = 2320,
    If        = 2400,
    Ifx       = 2405,
    Global    = 2450,
    Let       = 2460,
    Mut       = 2500,
    NCallable = 2540,
    Nonlocal  = 2550,
    NumT      = 2600,
    Proc      = 2750,
    Return    = 2800,
    StrT      = 2900,
    Struct    = 2910,
    Then      = 3000,
};

export const TokenTName: {
    [N in (keyof typeof TokenT) as (typeof TokenT)[N]]: N
} = {
    [TokenT.Amp]: "Amp",
    [TokenT.AmpAmp]: "AmpAmp",
    [TokenT.Arrow]: "Arrow",
    [TokenT.BoolT]: "BoolT",
    [TokenT.Bang]: "Bang",
    [TokenT.BangEq]: "BangEq",
    [TokenT.Callable]: "Callable",
    [TokenT.CircleT]: "CircleT",
    [TokenT.Colon]: "Colon",
    [TokenT.ColonEq]: "ColonEq",
    [TokenT.Comma]: "Comma",
    [TokenT.DivBy]: "DivBy",
    [TokenT.Dollar]: "Dollar",
    [TokenT.Dot]: "Dot",
    [TokenT.Else]: "Else",
    [TokenT.EOF]: "EOF",
    [TokenT.Eq]: "Eq",
    [TokenT.EqEq]: "EqEq",
    [TokenT.Error]: "Error",
    [TokenT.False]: "False",
    [TokenT.Fn]: "Fn",
    [TokenT.Global]: "Global",
    [TokenT.Greater]: "Greater",
    [TokenT.GreaterEq]: "GreaterEq",
    [TokenT.Hash]: "Hash",
    [TokenT.If]: "If",
    [TokenT.Ifx]: "Ifx",
    [TokenT.LBrace]: "LBrace",
    [TokenT.LBracket]: "LBracket",
    [TokenT.Less]: "Less",
    [TokenT.LessEq]: "LessEq",
    [TokenT.LParen]: "LParen",
    [TokenT.LR]: "LR",
    [TokenT.Let]: "Let",
    [TokenT.Minus]: "Minus",
    [TokenT.Mut]: "Mut",
    [TokenT.NCallable]: "NCallable",
    [TokenT.Nonlocal]: "Nonlocal",
    [TokenT.Number]: "Number",
    [TokenT.NumT]: "NumT",
    [TokenT.Pipe]: "Pipe",
    [TokenT.PipePipe]: "PipePipe",
    [TokenT.Plus]: "Plus",
    [TokenT.PlusPlus]: "PlusPlus",
    [TokenT.Proc]: "Proc",
    [TokenT.RBrace]: "RBrace",
    [TokenT.RBracket]: "RBracket",
    [TokenT.Return]: "Return",
    [TokenT.RParen]: "RParen",
    [TokenT.Semicolon]: "Semicolon",
    [TokenT.Slash]: "Slash",
    [TokenT.Star]: "Star",
    [TokenT.String]: "String",
    [TokenT.StrT]: "StrT",
    [TokenT.Struct]: "Struct",
    [TokenT.Then]: "Then",
    [TokenT.True]: "True",
};

export type Token = {
    kind:   TokenT,
    lexeme: string,
    line:   number,
};

let source  = "";
let start   = 0;
let current = 0;
let line    = 1;

function is_digit(c: string): boolean {
    return c >= '0' && c <= '9';
}

function is_lower(c: string): boolean {
    return c >= 'a' && c <= 'z';
}

function is_upper(c: string): boolean {
    return c >= 'A' && c <= 'Z';
}

function is_alpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
           c === '_';
}

function advance(): string {
    return source[current++];
}

function is_eof(): boolean {
    return current === source.length;
}

function peek(): string {
    return source[current];
}

function peek_next(): string {
    return source[current + 1];
}

function match(expected: string): boolean {
    if (is_eof()) return false;
    if (source[current] !== expected) return false;
    current++;
    return true;
}

// Make token other than String or Error.
function token_lexeme(kind: TokenT): Token {
    let lexeme = source.slice(start, current);
    return { kind, lexeme, line };
}

function token_string(kind: TokenT): Token {
    let lexeme = source.slice(start + 1, current - 1);
    return { kind, lexeme, line };
}

function token_error(message: string): Token {
    return { kind: TokenT.Error, lexeme: message, line };
}

// Scan functions, procedures, and types.
function pascal_case(): Token {
    while (is_alpha(peek()) || is_digit(peek()))
        advance();

    switch (source.slice(start, current)) {
        case "Bool":   return token_lexeme( TokenT.BoolT );
        case "Circle": return token_lexeme( TokenT.CircleT );
        case "Num":    return token_lexeme( TokenT.NumT );
        case "Str":    return token_lexeme( TokenT.StrT );
    }
    return token_lexeme( TokenT.Callable );
}

// Scan non-callable names, keywords, true, false.
function non_pascal_case(): Token {
    while (is_alpha(peek()) || is_digit(peek()))
        advance();

    switch (source.slice(start, current)) {
        case "else":     return token_lexeme( TokenT.Else );
        case "false":    return token_lexeme( TokenT.False );
        case "fn":       return token_lexeme( TokenT.Fn );
        case "if":       return token_lexeme( TokenT.If );
        case "ifx":      return token_lexeme( TokenT.Ifx );
        case "global":   return token_lexeme( TokenT.Global );
        case "let":      return token_lexeme( TokenT.Let );
        case "mut":      return token_lexeme( TokenT.Mut );
        case "nonlocal": return token_lexeme( TokenT.Nonlocal );
        case "proc":     return token_lexeme( TokenT.Proc );
        case "return":   return token_lexeme( TokenT.Return );
        case "struct":   return token_lexeme( TokenT.Struct );
        case "then":     return token_lexeme( TokenT.Then );
        case "true":     return token_lexeme( TokenT.True );
    }
    return token_lexeme( TokenT.NCallable );
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
    while (peek() != '"' && !is_eof()) {
        if (peek() == '\n')
            line++;
        advance();
    }

    if (is_eof()) return token_error("unterminated string");

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
            case '/':
                if (peek_next() === '/') {
                    while (peek() !== '\n' && !is_eof())
                        advance();
                } else {
                    return;
                }
                break;
            default:
                return;
        }
    }
}

export const scanner = {
    init(source_: string): void {
        source  = source_;
        start   = 0;
        current = 0;
        line    = 1;
    },

    next(): Token {
        skip_whitespace();
        start = current;

        if (is_eof()) return token_lexeme(TokenT.EOF);

        let c = advance();
        if (is_digit(c)) return number_();
        if (is_lower(c)) return non_pascal_case();
        if (is_upper(c)) return pascal_case();
        
        switch (c) {
            case '.': return token_lexeme(TokenT.Dot);
            case '(': return token_lexeme(TokenT.LParen);
            case ')': return token_lexeme(TokenT.RParen);
            case '[': return token_lexeme(TokenT.LBracket);
            case ']': return token_lexeme(TokenT.RBracket);
            case '{': return token_lexeme(TokenT.LBrace);
            case '}': return token_lexeme(TokenT.RBrace);
            case '$': return token_lexeme(TokenT.Dollar);
            case '#': return token_lexeme(TokenT.Hash);
            case ';': return token_lexeme(TokenT.Semicolon);
            case ',': return token_lexeme(TokenT.Comma);
            case '/': return token_lexeme(TokenT.Slash);
            case '*': return token_lexeme(TokenT.Star);
            case '"': return string_();

            case '-': return token_lexeme(
                match('>') ? TokenT.Arrow : TokenT.Minus);
            case '|': {
                if (match('|')) return token_lexeme(TokenT.PipePipe);
                if (match('>')) return token_lexeme(TokenT.Pipe);
                return token_lexeme(TokenT.DivBy);
            }
            case '&': return token_lexeme(
                match('&') ? TokenT.AmpAmp : TokenT.Amp);
            case ':': return token_lexeme(
                match('=') ? TokenT.ColonEq : TokenT.Colon);
            case '<': {
                if (match('=')) return token_lexeme(TokenT.LessEq);
                if (match('>')) return token_lexeme(TokenT.LR);
                return token_lexeme(TokenT.Less);
            }
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
        while (!is_eof())
            result.push(this.next());
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
