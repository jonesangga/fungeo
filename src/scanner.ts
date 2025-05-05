// @jonesangga, 12-04-2025, MIT License.
//
// TODO: Parse negative number instead of TokenT.Minus + TokenT.Number.
//       Support comment.

const enum TokenT {
    // Single character.
    Comma, Dollar, Semicolon,
    LParen, RParen, LBracket, RBracket,
    Minus, Plus, Slash, Star,

    // One or more characters.
    Bang, Colon, ColonEq, Eq,

    // Literals.
    Name, Number, String, True, False,

    EOF, Error,
};

const TokenTName: { [key in TokenT]: string } = {
    [TokenT.Bang]: "Bang",
    [TokenT.Colon]: "Colon",
    [TokenT.ColonEq]: "ColonEq",
    [TokenT.Comma]: "Comma",
    [TokenT.Dollar]: "Dollar",
    [TokenT.EOF]: "EOF",
    [TokenT.Eq]: "Eq",
    [TokenT.Error]: "Error",
    [TokenT.False]: "False",
    [TokenT.LBracket]: "LBracket",
    [TokenT.LParen]: "LParen",
    [TokenT.Minus]: "Minus",
    [TokenT.Name]: "Name",
    [TokenT.Number]: "Number",
    [TokenT.Plus]: "Plus",
    [TokenT.RBracket]: "RBracket",
    [TokenT.RParen]: "RParen",
    [TokenT.Semicolon]: "Semicolon",
    [TokenT.Slash]: "Slash",
    [TokenT.Star]: "Star",
    [TokenT.String]: "String",
    [TokenT.True]: "True",
};

interface Token {
    kind:          TokenT;
    line:          number;
    lexeme?:       string;
    errorMessage?: string;
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

function token_no_lexeme(kind: TokenT): Token {
    return { kind, line };
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
    return { kind: TokenT.Error, errorMessage, line };
}

function name_type(): TokenT {
    switch (source.slice(start, current)) {
        case "false":   return TokenT.False;
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

        if (is_at_end()) return token_no_lexeme(TokenT.EOF);

        let c = advance();
        if (is_digit(c)) return number_();
        if (is_alpha(c)) return name();
        
        switch (c) {
            case '(': return token_no_lexeme(TokenT.LParen);
            case ')': return token_no_lexeme(TokenT.RParen);
            case '[': return token_no_lexeme(TokenT.LBracket);
            case ']': return token_no_lexeme(TokenT.RBracket);
            case '$': return token_no_lexeme(TokenT.Dollar);
            case ';': return token_no_lexeme(TokenT.Semicolon);
            case ':': return token_no_lexeme(
                match('=') ? TokenT.ColonEq : TokenT.Colon);
            case ',': return token_no_lexeme(TokenT.Comma);
            case '-': return token_no_lexeme(TokenT.Minus);
            case '+': return token_no_lexeme(TokenT.Plus);
            case '/': return token_no_lexeme(TokenT.Slash);
            case '*': return token_no_lexeme(TokenT.Star);
            case '!': return token_no_lexeme(TokenT.Bang);
            case '=': return token_no_lexeme(TokenT.Eq);
            case '"': return string_();
        }
     
        return token_error("unexpected character");
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
            result += `${ pad9(TokenTName[token.kind]) } '${ Object.hasOwn(token, "lexeme") ? token.lexeme : "" }'\n`;

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
