var TokenT;
(function (TokenT) {
    TokenT[TokenT["Comma"] = 0] = "Comma";
    TokenT[TokenT["Dollar"] = 1] = "Dollar";
    TokenT[TokenT["Semicolon"] = 2] = "Semicolon";
    TokenT[TokenT["LParen"] = 3] = "LParen";
    TokenT[TokenT["RParen"] = 4] = "RParen";
    TokenT[TokenT["LBracket"] = 5] = "LBracket";
    TokenT[TokenT["RBracket"] = 6] = "RBracket";
    TokenT[TokenT["Minus"] = 7] = "Minus";
    TokenT[TokenT["Plus"] = 8] = "Plus";
    TokenT[TokenT["Slash"] = 9] = "Slash";
    TokenT[TokenT["Star"] = 10] = "Star";
    TokenT[TokenT["Bang"] = 11] = "Bang";
    TokenT[TokenT["Colon"] = 12] = "Colon";
    TokenT[TokenT["ColonEq"] = 13] = "ColonEq";
    TokenT[TokenT["Eq"] = 14] = "Eq";
    TokenT[TokenT["Name"] = 15] = "Name";
    TokenT[TokenT["Number"] = 16] = "Number";
    TokenT[TokenT["String"] = 17] = "String";
    TokenT[TokenT["True"] = 18] = "True";
    TokenT[TokenT["False"] = 19] = "False";
    TokenT[TokenT["EOF"] = 20] = "EOF";
    TokenT[TokenT["Error"] = 21] = "Error";
})(TokenT || (TokenT = {}));
;
const TokenTName = {
    [11]: "Bang",
    [12]: "Colon",
    [13]: "ColonEq",
    [0]: "Comma",
    [1]: "Dollar",
    [20]: "EOF",
    [14]: "Eq",
    [21]: "Error",
    [19]: "False",
    [5]: "LBracket",
    [3]: "LParen",
    [7]: "Minus",
    [15]: "Name",
    [16]: "Number",
    [8]: "Plus",
    [6]: "RBracket",
    [4]: "RParen",
    [2]: "Semicolon",
    [9]: "Slash",
    [10]: "Star",
    [17]: "String",
    [18]: "True",
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
function make_token(kind) {
    return { kind, start, end: current, line };
}
function error_token(errorMessage) {
    return { kind: 21, start, end: current, line, errorMessage };
}
function name_type() {
    switch (source.slice(start, current)) {
        case "false": return 19;
        case "true": return 18;
    }
    return 15;
}
function name() {
    while (is_alpha(peek()) || is_digit(peek()))
        advance();
    return make_token(name_type());
}
function number_() {
    while (is_digit(peek()))
        advance();
    if (peek() === '.' && is_digit(peek_next())) {
        advance();
        while (is_digit(peek()))
            advance();
    }
    return make_token(16);
}
function string_() {
    while (peek() != '"' && !is_at_end()) {
        if (peek() == '\n')
            line++;
        advance();
    }
    if (is_at_end())
        return error_token("unterminated string");
    advance();
    return make_token(17);
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
            return make_token(20);
        let c = advance();
        if (is_digit(c))
            return number_();
        if (is_alpha(c))
            return name();
        switch (c) {
            case '(': return make_token(3);
            case ')': return make_token(4);
            case '[': return make_token(5);
            case ']': return make_token(6);
            case '$': return make_token(1);
            case ';': return make_token(2);
            case ':': return make_token(match('=') ? 13 : 12);
            case ',': return make_token(0);
            case '-': return make_token(7);
            case '+': return make_token(8);
            case '/': return make_token(9);
            case '*': return make_token(10);
            case '!': return make_token(11);
            case '=': return make_token(14);
            case '"': return string_();
        }
        return error_token("unexpected character");
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
            result += `${pad9(TokenTName[token.kind])} '${source.slice(token.start, token.end)}'\n`;
            if (token.kind === 20)
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
