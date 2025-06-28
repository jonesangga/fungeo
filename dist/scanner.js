export var TokenT;
(function (TokenT) {
    TokenT[TokenT["Comma"] = 100] = "Comma";
    TokenT[TokenT["Dot"] = 210] = "Dot";
    TokenT[TokenT["FSlash"] = 220] = "FSlash";
    TokenT[TokenT["Hash"] = 250] = "Hash";
    TokenT[TokenT["LBrace"] = 300] = "LBrace";
    TokenT[TokenT["LBracket"] = 400] = "LBracket";
    TokenT[TokenT["LParen"] = 500] = "LParen";
    TokenT[TokenT["Minus"] = 600] = "Minus";
    TokenT[TokenT["Percent"] = 670] = "Percent";
    TokenT[TokenT["RBrace"] = 695] = "RBrace";
    TokenT[TokenT["RBracket"] = 700] = "RBracket";
    TokenT[TokenT["RParen"] = 800] = "RParen";
    TokenT[TokenT["Semicolon"] = 900] = "Semicolon";
    TokenT[TokenT["Star"] = 1100] = "Star";
    TokenT[TokenT["Amp"] = 1180] = "Amp";
    TokenT[TokenT["AmpAmp"] = 1190] = "AmpAmp";
    TokenT[TokenT["Arrow"] = 1195] = "Arrow";
    TokenT[TokenT["Bang"] = 1200] = "Bang";
    TokenT[TokenT["BangEq"] = 1210] = "BangEq";
    TokenT[TokenT["BSlash"] = 1220] = "BSlash";
    TokenT[TokenT["Colon"] = 1300] = "Colon";
    TokenT[TokenT["ColonEq"] = 1400] = "ColonEq";
    TokenT[TokenT["DivBy"] = 1450] = "DivBy";
    TokenT[TokenT["Eq"] = 1500] = "Eq";
    TokenT[TokenT["EqEq"] = 1505] = "EqEq";
    TokenT[TokenT["Greater"] = 1520] = "Greater";
    TokenT[TokenT["GreaterEq"] = 1525] = "GreaterEq";
    TokenT[TokenT["Less"] = 1550] = "Less";
    TokenT[TokenT["LessEq"] = 1555] = "LessEq";
    TokenT[TokenT["LR"] = 1560] = "LR";
    TokenT[TokenT["PipePipe"] = 1580] = "PipePipe";
    TokenT[TokenT["Plus"] = 1585] = "Plus";
    TokenT[TokenT["PlusPlus"] = 1590] = "PlusPlus";
    TokenT[TokenT["False"] = 1700] = "False";
    TokenT[TokenT["Ident"] = 1730] = "Ident";
    TokenT[TokenT["Number"] = 1800] = "Number";
    TokenT[TokenT["String"] = 1900] = "String";
    TokenT[TokenT["True"] = 2000] = "True";
    TokenT[TokenT["Use"] = 2050] = "Use";
    TokenT[TokenT["EOF"] = 2100] = "EOF";
    TokenT[TokenT["Error"] = 2200] = "Error";
    TokenT[TokenT["BoolT"] = 2220] = "BoolT";
    TokenT[TokenT["CircleT"] = 2230] = "CircleT";
    TokenT[TokenT["Else"] = 2300] = "Else";
    TokenT[TokenT["Fn"] = 2320] = "Fn";
    TokenT[TokenT["If"] = 2400] = "If";
    TokenT[TokenT["Ifx"] = 2405] = "Ifx";
    TokenT[TokenT["Global"] = 2450] = "Global";
    TokenT[TokenT["Let"] = 2460] = "Let";
    TokenT[TokenT["Mut"] = 2500] = "Mut";
    TokenT[TokenT["NumT"] = 2600] = "NumT";
    TokenT[TokenT["PointT"] = 2700] = "PointT";
    TokenT[TokenT["RectT"] = 2780] = "RectT";
    TokenT[TokenT["Return"] = 2800] = "Return";
    TokenT[TokenT["StrT"] = 2900] = "StrT";
    TokenT[TokenT["Struct"] = 2910] = "Struct";
    TokenT[TokenT["Then"] = 3000] = "Then";
})(TokenT || (TokenT = {}));
;
export const TokenTName = {
    [1180]: "Amp",
    [1190]: "AmpAmp",
    [1195]: "Arrow",
    [2220]: "BoolT",
    [1200]: "Bang",
    [1210]: "BangEq",
    [1220]: "BSlash",
    [2230]: "CircleT",
    [1300]: "Colon",
    [1400]: "ColonEq",
    [100]: "Comma",
    [1450]: "DivBy",
    [210]: "Dot",
    [2300]: "Else",
    [2100]: "EOF",
    [1500]: "Eq",
    [1505]: "EqEq",
    [2200]: "Error",
    [1700]: "False",
    [2320]: "Fn",
    [220]: "FSlash",
    [2450]: "Global",
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
    [2500]: "Mut",
    [1800]: "Number",
    [2600]: "NumT",
    [670]: "Percent",
    [1580]: "PipePipe",
    [1585]: "Plus",
    [1590]: "PlusPlus",
    [2700]: "PointT",
    [695]: "RBrace",
    [700]: "RBracket",
    [2780]: "RectT",
    [2800]: "Return",
    [800]: "RParen",
    [900]: "Semicolon",
    [1100]: "Star",
    [1900]: "String",
    [2900]: "StrT",
    [2910]: "Struct",
    [3000]: "Then",
    [2000]: "True",
    [2050]: "Use",
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
    return source[current++];
}
function is_eof() {
    return current === source.length;
}
function peek() {
    return source[current];
}
function peek_next() {
    return source[current + 1];
}
function match(expected) {
    if (is_eof())
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
function token_error(message) {
    return { kind: 2200, lexeme: message, line };
}
function identifier() {
    while (is_alpha(peek()) || is_digit(peek()))
        advance();
    switch (source.slice(start, current)) {
        case "Bool": return token_lexeme(2220);
        case "Circle": return token_lexeme(2230);
        case "else": return token_lexeme(2300);
        case "false": return token_lexeme(1700);
        case "fn": return token_lexeme(2320);
        case "if": return token_lexeme(2400);
        case "ifx": return token_lexeme(2405);
        case "global": return token_lexeme(2450);
        case "let": return token_lexeme(2460);
        case "mut": return token_lexeme(2500);
        case "Num": return token_lexeme(2600);
        case "Point": return token_lexeme(2700);
        case "Rect": return token_lexeme(2780);
        case "return": return token_lexeme(2800);
        case "Str": return token_lexeme(2900);
        case "struct": return token_lexeme(2910);
        case "then": return token_lexeme(3000);
        case "true": return token_lexeme(2000);
        case "use": return token_lexeme(2050);
    }
    return token_lexeme(1730);
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
    while (peek() != '"' && !is_eof()) {
        if (peek() == '\n')
            line++;
        advance();
    }
    if (is_eof())
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
            case '/':
                if (peek_next() === '/') {
                    while (peek() !== '\n' && !is_eof())
                        advance();
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
export const scanner = {
    init(source_) {
        source = source_;
        start = 0;
        current = 0;
        line = 1;
    },
    next() {
        skip_whitespace();
        start = current;
        if (is_eof())
            return token_lexeme(2100);
        let c = advance();
        if (is_digit(c))
            return number_();
        if (is_alpha(c))
            return identifier();
        switch (c) {
            case '.': return token_lexeme(210);
            case '%': return token_lexeme(670);
            case '(': return token_lexeme(500);
            case ')': return token_lexeme(800);
            case '[': return token_lexeme(400);
            case ']': return token_lexeme(700);
            case '{': return token_lexeme(300);
            case '}': return token_lexeme(695);
            case '#': return token_lexeme(250);
            case ';': return token_lexeme(900);
            case ',': return token_lexeme(100);
            case '/': return token_lexeme(220);
            case '*': return token_lexeme(1100);
            case '\\': return token_lexeme(1220);
            case '"': return string_();
            case '-': return token_lexeme(match('>') ? 1195 : 600);
            case '|': {
                if (match('|'))
                    return token_lexeme(1580);
                return token_lexeme(1450);
            }
            case '&': return token_lexeme(match('&') ? 1190 : 1180);
            case ':': {
                if (match('='))
                    return token_lexeme(1400);
                return token_lexeme(1300);
            }
            case '<': {
                if (match('='))
                    return token_lexeme(1555);
                if (match('>'))
                    return token_lexeme(1560);
                return token_lexeme(1550);
            }
            case '>': return token_lexeme(match('=') ? 1525 : 1520);
            case '=': return token_lexeme(match('=') ? 1505 : 1500);
            case '!': return token_lexeme(match('=') ? 1210 : 1200);
            case '+': return token_lexeme(match('+') ? 1590 : 1585);
        }
        return token_error(`unexpected character ${c}`);
    },
    all() {
        let result = [];
        while (!is_eof())
            result.push(this.next());
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
