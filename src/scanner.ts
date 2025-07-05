// @jonesangga, 12-04-2025, MIT License.
//
// TODO: Add TokenT.Pipe later for pipe functionality.
//       Add TokenT.ColonColon for module import like use fish::Above.

// NOTE: Make sure only add item with length <= 9.
export const enum TokenT {
    BSlash    = 50,     // Single character.
    Comma     = 100,
    Dot       = 210,
    FSlash    = 220,
    Hash      = 250,
    LBrace    = 300,
    LBracket  = 400,
    LParen    = 500,
    Minus     = 600,
    Percent   = 670,
    RBrace    = 695,
    RBracket  = 700,
    RParen    = 800,
    Semicolon = 900,
    Star      = 1100,
    Amp       = 1180,   // One or more characters.
    AmpAmp    = 1190,
    Arrow     = 1195,
    Bang      = 1200,
    BangEq    = 1210,
    Colon     = 1300,
    Eq        = 1500,
    EqEq      = 1505,
    Greater   = 1520,
    GreaterEq = 1525,
    Less      = 1550,
    LessEq    = 1555,
    LR        = 1560,
    PipePipe  = 1580,
    Plus      = 1585,
    PlusPlus  = 1590,
    BoolT     = 1600,   // Literals.
    CircleT   = 1620,
    False     = 1700,
    Ident     = 1730,
    Number    = 1800,
    NumT      = 1820,
    PointT    = 1850,
    RectT     = 1880,
    String    = 1900,
    StrT      = 1910,
    True      = 2000,
    EOF       = 2100,   // Other.
    Error     = 2200,
    Else      = 2300,   // Keywords.
    Fn        = 2320,
    If        = 2400,
    Ifx       = 2405,
    Let       = 2460,
    Return    = 2800,
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
    [TokenT.BSlash]: "BSlash",
    [TokenT.CircleT]: "CircleT",
    [TokenT.Colon]: "Colon",
    [TokenT.Comma]: "Comma",
    [TokenT.Dot]: "Dot",
    [TokenT.Else]: "Else",
    [TokenT.EOF]: "EOF",
    [TokenT.Eq]: "Eq",
    [TokenT.EqEq]: "EqEq",
    [TokenT.Error]: "Error",
    [TokenT.False]: "False",
    [TokenT.Fn]: "Fn",
    [TokenT.FSlash]: "FSlash",
    [TokenT.Greater]: "Greater",
    [TokenT.GreaterEq]: "GreaterEq",
    [TokenT.Hash]: "Hash",
    [TokenT.Ident]: "Ident",
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
    [TokenT.Number]: "Number",
    [TokenT.NumT]: "NumT",
    [TokenT.Percent]: "Percent",
    [TokenT.PipePipe]: "PipePipe",
    [TokenT.Plus]: "Plus",
    [TokenT.PlusPlus]: "PlusPlus",
    [TokenT.PointT]: "PointT",
    [TokenT.RBrace]: "RBrace",
    [TokenT.RBracket]: "RBracket",
    [TokenT.RectT]: "RectT",
    [TokenT.Return]: "Return",
    [TokenT.RParen]: "RParen",
    [TokenT.Semicolon]: "Semicolon",
    [TokenT.Star]: "Star",
    [TokenT.String]: "String",
    [TokenT.StrT]: "StrT",
    [TokenT.Struct]: "Struct",
    [TokenT.Then]: "Then",
    [TokenT.True]: "True",
};

export type Token = {
    type:   TokenT,
    lexeme: string,
    line:   number,
};

function is_digit(c: string): boolean {
    return c >= '0' && c <= '9';
}

function is_alpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
           c === '_';
}

export class Scanner {
    source: string;
    start   = 0;
    current = 0;
    line    = 1;
    closedMultiComment = true;

    constructor(source: string) {
        this.source = source;
    }

    next(): Token {
        this.skip_whitespace();
        this.start = this.current;

        if (this.is_eof()) {
            if (this.closedMultiComment === false) {
                return this.token_error("multi-line comment is not closed");
            }
            return this.token_lexeme(TokenT.EOF);
        }

        let c = this.advance();
        if (is_digit(c)) return this.number_();
        if (is_alpha(c)) return this.identifier();

        switch (c) {
            case '.':  return this.token_lexeme( TokenT.Dot );
            case '%':  return this.token_lexeme( TokenT.Percent );
            case '(':  return this.token_lexeme( TokenT.LParen );
            case ')':  return this.token_lexeme( TokenT.RParen );
            case '[':  return this.token_lexeme( TokenT.LBracket );
            case ']':  return this.token_lexeme( TokenT.RBracket );
            case '{':  return this.token_lexeme( TokenT.LBrace );
            case '}':  return this.token_lexeme( TokenT.RBrace );
            case '#':  return this.token_lexeme( TokenT.Hash );
            case ';':  return this.token_lexeme( TokenT.Semicolon );
            case ',':  return this.token_lexeme( TokenT.Comma );
            case '/':  return this.token_lexeme( TokenT.FSlash );
            case '*':  return this.token_lexeme( TokenT.Star );
            case ':':  return this.token_lexeme( TokenT.Colon );
            case '\\': return this.token_lexeme( TokenT.BSlash );
            case '"':  return this.string_();

            case '>': {
                if (this.match('='))
                    return this.token_lexeme( TokenT.GreaterEq )
                else
                    return this.token_lexeme( TokenT.Greater );
            }
            case '-': {
                if (this.match('>'))
                    return this.token_lexeme( TokenT.Arrow )
                else
                    return this.token_lexeme( TokenT.Minus );
            }
            case '=': {
                if (this.match('='))
                    return this.token_lexeme( TokenT.EqEq )
                else
                    return this.token_lexeme( TokenT.Eq );
            }
            case '!': {
                if (this.match('='))
                    return this.token_lexeme( TokenT.BangEq )
                else
                    return this.token_lexeme( TokenT.Bang );
            }
            case '+': {
                if (this.match('+'))
                    return this.token_lexeme( TokenT.PlusPlus )
                else
                    return this.token_lexeme( TokenT.Plus );
            }
            case '&': {
                if (this.match('&'))
                    return this.token_lexeme( TokenT.AmpAmp )
                else
                    return this.token_lexeme( TokenT.Amp );
            }
            case '<': {
                if (this.match('='))
                    return this.token_lexeme( TokenT.LessEq )
                if (this.match('>'))
                    return this.token_lexeme( TokenT.LR )
                else
                    return this.token_lexeme( TokenT.Less );
            }
            case '|': {
                if (this.match('|'))
                    return this.token_lexeme( TokenT.PipePipe )
                else
                    break; // TODO: Update this when we implement pipe.
            }
        }
        return this.token_error(`unexpected character ${c}`);
    }

    advance(): string {
        return this.source[this.current++];
    }

    peek(): string {
        return this.source[this.current];
    }

    peek_next(): string {
        return this.source[this.current + 1];
    }

    is_eof(): boolean {
        return this.current === this.source.length;
    }

    // Make token other than String or Error.
    token_lexeme(type: TokenT): Token {
        let lexeme = this.source.slice(this.start, this.current);
        return {type, lexeme, line: this.line};
    }

    token_string(type: TokenT): Token {
        let lexeme = this.source.slice(this.start + 1, this.current - 1);
        return {type, lexeme, line: this.line};
    }

    token_error(message: string): Token {
        return {type: TokenT.Error, lexeme: message, line: this.line};
    }

    match(expected: string): boolean {
        if (this.is_eof()) return false;
        if (this.source[this.current] !== expected) return false;
        this.current++;
        return true;
    }

    identifier(): Token {
        while (is_alpha(this.peek()) || is_digit(this.peek())) {
            this.advance();
        }

        switch (this.source.slice(this.start, this.current)) {
            case "Bool":   return this.token_lexeme( TokenT.BoolT );
            case "Circle": return this.token_lexeme( TokenT.CircleT );
            case "else":   return this.token_lexeme( TokenT.Else );
            case "false":  return this.token_lexeme( TokenT.False );
            case "fn":     return this.token_lexeme( TokenT.Fn );
            case "if":     return this.token_lexeme( TokenT.If );
            case "ifx":    return this.token_lexeme( TokenT.Ifx );
            case "let":    return this.token_lexeme( TokenT.Let );
            case "Num":    return this.token_lexeme( TokenT.NumT );
            case "Point":  return this.token_lexeme( TokenT.PointT );
            case "Rect":   return this.token_lexeme( TokenT.RectT );
            case "return": return this.token_lexeme( TokenT.Return );
            case "Str":    return this.token_lexeme( TokenT.StrT );
            case "struct": return this.token_lexeme( TokenT.Struct );
            case "then":   return this.token_lexeme( TokenT.Then );
            case "true":   return this.token_lexeme( TokenT.True );
        }
        return this.token_lexeme(TokenT.Ident);
    }

    number_(): Token {
        while (is_digit(this.peek())) {
            this.advance();
        }

        // Look for a fractional part.
        if (this.peek() === '.' && is_digit(this.peek_next())) {
            this.advance();                  // Consume the ".".
            while (is_digit(this.peek())) {
                this.advance();
            }
        }

        return this.token_lexeme(TokenT.Number);
    }

    string_(): Token {
        let c = this.peek();
        while (c !== '"' && !this.is_eof()) {
            if (c === '\n') {
                this.line++;
            }
            this.advance();
            c = this.peek();
        }

        if (this.is_eof()) {
            return this.token_error("unterminated string");
        }

        this.advance();          // Consume the closing quote.
        return this.token_string(TokenT.String);
    }

    skip_whitespace(): void {
        for (;;) {
            let c = this.peek();
            switch (c) {
                case ' ':
                case '\r':
                case '\t':
                    this.advance();
                    break;

                case '\n':
                    this.line++;
                    this.advance();
                    break;

                case '/':
                    if (this.peek_next() === '/') {      // Single-line comment.
                        // NOTE: We use peek() so we don't consume newline.
                        while (this.peek() !== '\n' && !this.is_eof()) {
                            this.advance();
                        }
                    }
                    else if (this.peek_next() === '*') { // Multi-line comment.
                        this.advance();      // Consume '/'.
                        this.advance();      // Consume '*'.
                        this.closedMultiComment = false;
                        while (!this.is_eof()) {
                            let d = this.advance();
                            if (d === '*') {
                                if (this.peek() === '/') {
                                    this.advance();      // Consume '/'.
                                    this.closedMultiComment = true;
                                    break;
                                }
                            }
                            else if (d === '\n') {
                                this.line++;
                            }
                        }
                    }
                    else {
                        // We got non whitespace '/' so we return.
                        return;
                    }
                    break;

                default:
                    return;
            }
        }
    }

    // This method works with a new Scanner instance with the same source.
    // This is so that it can maintain its current state.
    all(): Token[] {
        let fresh  = new Scanner(this.source);
        let result = [];

        // NOTE: Don't change this to do-while loop because that doesn't handle EOF well.
        while (!fresh.is_eof()) {
            result.push(fresh.next());
        }
        result.push(fresh.next());       // This is to get the EOF token.
        return result;
    }

    // This method works with a new Scanner instance with the same source.
    // This is so that it can maintain its current state.
    all_pretty(): string {
        let fresh    = new Scanner(this.source);
        let result   = "";
        let lastLine = -1;

        for (;;) {
            let token = fresh.next();
            if (token.line !== lastLine) {
                result += `${ pad4(token.line) } `;
                lastLine = token.line;
            } else {
                result += "   | ";
            }
            result += `${ pad9(TokenTName[token.type]) } '${ token.lexeme }'\n`;

            if (token.type === TokenT.EOF) break;
        }
        return result;
    }
}

//--------------------------------------------------------------------
// Helpers for formating.

// NOTE: It is 9 place because the longest TokenT item's name is 9.
function pad9(str: string): string {
    return (str+'         ').slice(0, 9);
}

// NOTE: The choice of 4 place is arbitrary.
function pad4(n: number): string {
    return ('   '+n).slice(-4);
}
