var TokenT;
(function (TokenT) {
    TokenT[TokenT["Comma"] = 100] = "Comma";
    TokenT[TokenT["Dollar"] = 200] = "Dollar";
    TokenT[TokenT["LBrace"] = 300] = "LBrace";
    TokenT[TokenT["LBracket"] = 400] = "LBracket";
    TokenT[TokenT["LParen"] = 500] = "LParen";
    TokenT[TokenT["Minus"] = 600] = "Minus";
    TokenT[TokenT["RBrace"] = 695] = "RBrace";
    TokenT[TokenT["RBracket"] = 700] = "RBracket";
    TokenT[TokenT["RParen"] = 800] = "RParen";
    TokenT[TokenT["Semicolon"] = 900] = "Semicolon";
    TokenT[TokenT["Slash"] = 1000] = "Slash";
    TokenT[TokenT["Star"] = 1100] = "Star";
    TokenT[TokenT["Amp"] = 1180] = "Amp";
    TokenT[TokenT["AmpAmp"] = 1190] = "AmpAmp";
    TokenT[TokenT["Bang"] = 1200] = "Bang";
    TokenT[TokenT["BangEq"] = 1210] = "BangEq";
    TokenT[TokenT["Colon"] = 1300] = "Colon";
    TokenT[TokenT["ColonEq"] = 1400] = "ColonEq";
    TokenT[TokenT["Eq"] = 1500] = "Eq";
    TokenT[TokenT["EqEq"] = 1505] = "EqEq";
    TokenT[TokenT["Greater"] = 1520] = "Greater";
    TokenT[TokenT["GreaterEq"] = 1525] = "GreaterEq";
    TokenT[TokenT["Less"] = 1550] = "Less";
    TokenT[TokenT["LessEq"] = 1555] = "LessEq";
    TokenT[TokenT["Pipe"] = 1575] = "Pipe";
    TokenT[TokenT["PipePipe"] = 1580] = "PipePipe";
    TokenT[TokenT["Plus"] = 1585] = "Plus";
    TokenT[TokenT["PlusPlus"] = 1590] = "PlusPlus";
    TokenT[TokenT["False"] = 1600] = "False";
    TokenT[TokenT["Name"] = 1700] = "Name";
    TokenT[TokenT["Number"] = 1800] = "Number";
    TokenT[TokenT["String"] = 1900] = "String";
    TokenT[TokenT["True"] = 2000] = "True";
    TokenT[TokenT["EOF"] = 2100] = "EOF";
    TokenT[TokenT["Error"] = 2200] = "Error";
    TokenT[TokenT["Else"] = 2300] = "Else";
    TokenT[TokenT["If"] = 2400] = "If";
})(TokenT || (TokenT = {}));
;
const TokenTName = {
    [1180]: "Amp",
    [1190]: "AmpAmp",
    [1200]: "Bang",
    [1210]: "BangEq",
    [1300]: "Colon",
    [1400]: "ColonEq",
    [100]: "Comma",
    [200]: "Dollar",
    [2300]: "Else",
    [2100]: "EOF",
    [1500]: "Eq",
    [1505]: "EqEq",
    [2200]: "Error",
    [1600]: "False",
    [1520]: "Greater",
    [1525]: "GreaterEq",
    [2400]: "If",
    [300]: "LBrace",
    [400]: "LBracket",
    [1550]: "Less",
    [1555]: "LessEq",
    [500]: "LParen",
    [600]: "Minus",
    [1700]: "Name",
    [1800]: "Number",
    [1575]: "Pipe",
    [1580]: "PipePipe",
    [1585]: "Plus",
    [1590]: "PlusPlus",
    [695]: "RBrace",
    [700]: "RBracket",
    [800]: "RParen",
    [900]: "Semicolon",
    [1000]: "Slash",
    [1100]: "Star",
    [1900]: "String",
    [2000]: "True",
};
let source = "";
let start = 0;
let current = 0;
let line = 1;
function is_digit(c) {
    return c >= '0' && c <= '9';
}
function is_alpha(c) {
    return (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        c === '_';
}
function advance() {
    current++;
    return source[current - 1];
}
function is_at_end() {
    return current === source.length;
}
function peek() {
    return source[current];
}
function peek_next() {
    return source[current + 1];
}
function match(expected) {
    if (is_at_end())
        return false;
    if (source[current] !== expected)
        return false;
    current++;
    return true;
}
function token_lexeme(kind) {
    let lexeme = source.slice(start, current);
    return { kind, lexeme, line };
}
function token_string(kind) {
    let lexeme = source.slice(start + 1, current - 1);
    return { kind, lexeme, line };
}
function token_error(errorMessage) {
    return { kind: 2200, lexeme: errorMessage, line };
}
function name_type() {
    switch (source.slice(start, current)) {
        case "else": return 2300;
        case "false": return 1600;
        case "if": return 2400;
        case "true": return 2000;
    }
    return 1700;
}
function name() {
    while (is_alpha(peek()) || is_digit(peek()))
        advance();
    return token_lexeme(name_type());
}
function number_() {
    while (is_digit(peek()))
        advance();
    if (peek() === '.' && is_digit(peek_next())) {
        advance();
        while (is_digit(peek()))
            advance();
    }
    return token_lexeme(1800);
}
function string_() {
    while (peek() != '"' && !is_at_end()) {
        if (peek() == '\n')
            line++;
        advance();
    }
    if (is_at_end())
        return token_error("unterminated string");
    advance();
    return token_string(1900);
}
function skip_whitespace() {
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
    init(source_) {
        source = source_;
        start = 0;
        current = 0;
        line = 1;
    },
    next() {
        skip_whitespace();
        start = current;
        if (is_at_end())
            return token_lexeme(2100);
        let c = advance();
        if (is_digit(c))
            return number_();
        if (is_alpha(c))
            return name();
        switch (c) {
            case '(': return token_lexeme(500);
            case ')': return token_lexeme(800);
            case '[': return token_lexeme(400);
            case ']': return token_lexeme(700);
            case '{': return token_lexeme(300);
            case '}': return token_lexeme(695);
            case '$': return token_lexeme(200);
            case ';': return token_lexeme(900);
            case ',': return token_lexeme(100);
            case '-': return token_lexeme(600);
            case '/': return token_lexeme(1000);
            case '*': return token_lexeme(1100);
            case '"': return string_();
            case '|': return token_lexeme(match('|') ? 1580 : 1575);
            case '&': return token_lexeme(match('&') ? 1190 : 1180);
            case ':': return token_lexeme(match('=') ? 1400 : 1300);
            case '<': return token_lexeme(match('=') ? 1555 : 1550);
            case '>': return token_lexeme(match('=') ? 1525 : 1520);
            case '=': return token_lexeme(match('=') ? 1505 : 1500);
            case '!': return token_lexeme(match('=') ? 1210 : 1200);
            case '+': return token_lexeme(match('+') ? 1590 : 1585);
        }
        return token_error(`unexpected character ${c}`);
    },
    all() {
        let result = [];
        do {
            result.push(this.next());
        } while (!is_at_end());
        result.push(this.next());
        return result;
    },
    all_string() {
        let result = "";
        let line = -1;
        for (;;) {
            let token = this.next();
            if (token.line !== line) {
                result += `${pad4(token.line)} `;
                line = token.line;
            }
            else {
                result += "   | ";
            }
            result += `${pad9(TokenTName[token.kind])} '${token.lexeme}'\n`;
            if (token.kind === 2100)
                break;
        }
        return result;
    }
};
function pad9(str) {
    return (str + '         ').slice(0, 9);
}
function pad4(n) {
    return ('   ' + n).slice(-4);
}
export { TokenT, TokenTName, scanner };
