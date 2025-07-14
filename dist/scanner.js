;
export const TokenTName = {
    [1180]: "Amp",
    [1190]: "AmpAmp",
    [1195]: "Arrow",
    [1600]: "BoolT",
    [1200]: "Bang",
    [1210]: "BangEq",
    [50]: "BSlash",
    [1620]: "CircleT",
    [1300]: "Colon",
    [1305]: "Colon2",
    [100]: "Comma",
    [210]: "Dot",
    [2300]: "Else",
    [2100]: "EOF",
    [1500]: "Eq",
    [1505]: "EqEq",
    [2200]: "Error",
    [1700]: "False",
    [2320]: "Fn",
    [220]: "FSlash",
    [1520]: "Greater",
    [1525]: "GreaterEq",
    [250]: "Hash",
    [1730]: "Ident",
    [2400]: "If",
    [2405]: "Ifx",
    [300]: "LBrace",
    [400]: "LBracket",
    [1550]: "Less",
    [1555]: "LessEq",
    [500]: "LParen",
    [1560]: "LR",
    [2460]: "Let",
    [600]: "Minus",
    [1800]: "Number",
    [1820]: "NumT",
    [670]: "Percent",
    [1580]: "PipePipe",
    [1585]: "Plus",
    [1590]: "PlusPlus",
    [1850]: "PointT",
    [695]: "RBrace",
    [700]: "RBracket",
    [1880]: "RectT",
    [2800]: "Return",
    [800]: "RParen",
    [900]: "Semicolon",
    [1100]: "Star",
    [1900]: "String",
    [1910]: "StrT",
    [2910]: "Struct",
    [3000]: "Then",
    [2000]: "True",
};
function is_digit(c) {
    return c >= '0' && c <= '9';
}
function is_alpha(c) {
    return (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        c === '_';
}
export class Scanner {
    source;
    start = 0;
    current = 0;
    line = 1;
    closedMultiComment = true;
    constructor(source) {
        this.source = source;
    }
    next() {
        this.skip_whitespace();
        this.start = this.current;
        if (this.is_eof()) {
            if (this.closedMultiComment === false) {
                return this.token_error("multi-line comment is not closed");
            }
            return this.token_lexeme(2100);
        }
        let c = this.advance();
        if (is_digit(c))
            return this.number_();
        if (is_alpha(c))
            return this.identifier();
        switch (c) {
            case '.': return this.token_lexeme(210);
            case '%': return this.token_lexeme(670);
            case '(': return this.token_lexeme(500);
            case ')': return this.token_lexeme(800);
            case '[': return this.token_lexeme(400);
            case ']': return this.token_lexeme(700);
            case '{': return this.token_lexeme(300);
            case '}': return this.token_lexeme(695);
            case '#': return this.token_lexeme(250);
            case ';': return this.token_lexeme(900);
            case ',': return this.token_lexeme(100);
            case '/': return this.token_lexeme(220);
            case '*': return this.token_lexeme(1100);
            case '\\': return this.token_lexeme(50);
            case '"': return this.string_();
            case ':': {
                if (this.match(':'))
                    return this.token_lexeme(1305);
                else
                    return this.token_lexeme(1300);
            }
            case '>': {
                if (this.match('='))
                    return this.token_lexeme(1525);
                else
                    return this.token_lexeme(1520);
            }
            case '-': {
                if (this.match('>'))
                    return this.token_lexeme(1195);
                else
                    return this.token_lexeme(600);
            }
            case '=': {
                if (this.match('='))
                    return this.token_lexeme(1505);
                else
                    return this.token_lexeme(1500);
            }
            case '!': {
                if (this.match('='))
                    return this.token_lexeme(1210);
                else
                    return this.token_lexeme(1200);
            }
            case '+': {
                if (this.match('+'))
                    return this.token_lexeme(1590);
                else
                    return this.token_lexeme(1585);
            }
            case '&': {
                if (this.match('&'))
                    return this.token_lexeme(1190);
                else
                    return this.token_lexeme(1180);
            }
            case '<': {
                if (this.match('='))
                    return this.token_lexeme(1555);
                if (this.match('>'))
                    return this.token_lexeme(1560);
                else
                    return this.token_lexeme(1550);
            }
            case '|': {
                if (this.match('|'))
                    return this.token_lexeme(1580);
                else
                    break;
            }
        }
        return this.token_error(`unexpected character ${c}`);
    }
    advance() {
        return this.source[this.current++];
    }
    peek() {
        return this.source[this.current];
    }
    peek_next() {
        return this.source[this.current + 1];
    }
    is_eof() {
        return this.current === this.source.length;
    }
    token_lexeme(type) {
        let lexeme = this.source.slice(this.start, this.current);
        return { type, lexeme, line: this.line };
    }
    token_string(type) {
        let lexeme = this.source.slice(this.start + 1, this.current - 1);
        return { type, lexeme, line: this.line };
    }
    token_error(message) {
        return { type: 2200, lexeme: message, line: this.line };
    }
    match(expected) {
        if (this.is_eof())
            return false;
        if (this.source[this.current] !== expected)
            return false;
        this.current++;
        return true;
    }
    identifier() {
        while (is_alpha(this.peek()) || is_digit(this.peek())) {
            this.advance();
        }
        switch (this.source.slice(this.start, this.current)) {
            case "Bool": return this.token_lexeme(1600);
            case "Circle": return this.token_lexeme(1620);
            case "else": return this.token_lexeme(2300);
            case "false": return this.token_lexeme(1700);
            case "fn": return this.token_lexeme(2320);
            case "if": return this.token_lexeme(2400);
            case "ifx": return this.token_lexeme(2405);
            case "let": return this.token_lexeme(2460);
            case "Num": return this.token_lexeme(1820);
            case "Point": return this.token_lexeme(1850);
            case "Rect": return this.token_lexeme(1880);
            case "return": return this.token_lexeme(2800);
            case "Str": return this.token_lexeme(1910);
            case "struct": return this.token_lexeme(2910);
            case "then": return this.token_lexeme(3000);
            case "true": return this.token_lexeme(2000);
        }
        return this.token_lexeme(1730);
    }
    number_() {
        while (is_digit(this.peek())) {
            this.advance();
        }
        if (this.peek() === '.' && is_digit(this.peek_next())) {
            this.advance();
            while (is_digit(this.peek())) {
                this.advance();
            }
        }
        return this.token_lexeme(1800);
    }
    string_() {
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
        this.advance();
        return this.token_string(1900);
    }
    skip_whitespace() {
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
                    if (this.peek_next() === '/') {
                        while (this.peek() !== '\n' && !this.is_eof()) {
                            this.advance();
                        }
                    }
                    else if (this.peek_next() === '*') {
                        this.advance();
                        this.advance();
                        this.closedMultiComment = false;
                        while (!this.is_eof()) {
                            let d = this.advance();
                            if (d === '*') {
                                if (this.peek() === '/') {
                                    this.advance();
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
                        return;
                    }
                    break;
                default:
                    return;
            }
        }
    }
    all() {
        let fresh = new Scanner(this.source);
        let result = [];
        while (!fresh.is_eof()) {
            result.push(fresh.next());
        }
        result.push(fresh.next());
        return result;
    }
    all_pretty() {
        let fresh = new Scanner(this.source);
        let result = "";
        let lastLine = -1;
        for (;;) {
            let token = fresh.next();
            if (token.line !== lastLine) {
                result += `${pad4(token.line)} `;
                lastLine = token.line;
            }
            else {
                result += "   | ";
            }
            result += `${pad9(TokenTName[token.type])} '${token.lexeme}'\n`;
            if (token.type === 2100)
                break;
        }
        return result;
    }
}
function pad9(str) {
    return (str + '         ').slice(0, 9);
}
function pad4(n) {
    return ('   ' + n).slice(-4);
}
