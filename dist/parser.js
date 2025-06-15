import { scanner } from "./scanner.js";
import { AssignNode, BinaryNode, BooleanNode, CallNode, ExprStmtNode, FileNode, FnNode, NumberNode, StringNode, VarDeclNode, VarNode } from "./ast.js";
var Prec;
(function (Prec) {
    Prec[Prec["None"] = 100] = "None";
    Prec[Prec["Assignment"] = 200] = "Assignment";
    Prec[Prec["Or"] = 210] = "Or";
    Prec[Prec["And"] = 220] = "And";
    Prec[Prec["Equality"] = 230] = "Equality";
    Prec[Prec["Comparison"] = 250] = "Comparison";
    Prec[Prec["Term"] = 300] = "Term";
    Prec[Prec["Factor"] = 400] = "Factor";
    Prec[Prec["Unary"] = 500] = "Unary";
    Prec[Prec["Call"] = 600] = "Call";
    Prec[Prec["Primary"] = 700] = "Primary";
})(Prec || (Prec = {}));
const rules = {
    [1180]: { prefix: null, infix: null, prec: 100 },
    [1190]: { prefix: null, infix: null, prec: 220 },
    [1195]: { prefix: null, infix: null, prec: 100 },
    [1200]: { prefix: null, infix: null, prec: 100 },
    [1210]: { prefix: null, infix: null, prec: 230 },
    [2220]: { prefix: null, infix: null, prec: 100 },
    [2230]: { prefix: null, infix: null, prec: 100 },
    [1300]: { prefix: null, infix: null, prec: 100 },
    [1400]: { prefix: null, infix: null, prec: 100 },
    [1410]: { prefix: null, infix: null, prec: 100 },
    [100]: { prefix: null, infix: null, prec: 100 },
    [1450]: { prefix: null, infix: null, prec: 300 },
    [210]: { prefix: null, infix: null, prec: 600 },
    [2300]: { prefix: null, infix: null, prec: 100 },
    [2100]: { prefix: null, infix: null, prec: 100 },
    [1500]: { prefix: null, infix: null, prec: 100 },
    [1505]: { prefix: null, infix: null, prec: 230 },
    [2200]: { prefix: null, infix: null, prec: 100 },
    [1700]: { prefix: parse_boolean, infix: null, prec: 100 },
    [2320]: { prefix: null, infix: null, prec: 100 },
    [1720]: { prefix: parse_fnname, infix: null, prec: 100 },
    [2450]: { prefix: null, infix: null, prec: 100 },
    [1520]: { prefix: null, infix: null, prec: 250 },
    [1525]: { prefix: null, infix: null, prec: 250 },
    [250]: { prefix: null, infix: null, prec: 100 },
    [2400]: { prefix: null, infix: null, prec: 100 },
    [2405]: { prefix: null, infix: null, prec: 100 },
    [300]: { prefix: null, infix: null, prec: 100 },
    [400]: { prefix: null, infix: null, prec: 600 },
    [1550]: { prefix: null, infix: null, prec: 250 },
    [1555]: { prefix: null, infix: null, prec: 250 },
    [500]: { prefix: null, infix: call, prec: 600 },
    [1560]: { prefix: null, infix: null, prec: 300 },
    [2460]: { prefix: null, infix: null, prec: 100 },
    [2500]: { prefix: null, infix: null, prec: 100 },
    [600]: { prefix: null, infix: numeric_binary, prec: 300 },
    [1800]: { prefix: parse_number, infix: null, prec: 100 },
    [2600]: { prefix: null, infix: null, prec: 100 },
    [670]: { prefix: null, infix: null, prec: 100 },
    [1580]: { prefix: null, infix: null, prec: 210 },
    [1585]: { prefix: null, infix: numeric_binary, prec: 300 },
    [1590]: { prefix: null, infix: null, prec: 300 },
    [2700]: { prefix: null, infix: null, prec: 300 },
    [695]: { prefix: null, infix: null, prec: 100 },
    [700]: { prefix: null, infix: null, prec: 100 },
    [2780]: { prefix: null, infix: null, prec: 100 },
    [2800]: { prefix: null, infix: null, prec: 100 },
    [800]: { prefix: null, infix: null, prec: 100 },
    [900]: { prefix: null, infix: null, prec: 100 },
    [1000]: { prefix: null, infix: numeric_binary, prec: 400 },
    [1100]: { prefix: null, infix: numeric_binary, prec: 400 },
    [1900]: { prefix: parse_string, infix: null, prec: 100 },
    [2900]: { prefix: null, infix: null, prec: 100 },
    [2910]: { prefix: null, infix: null, prec: 100 },
    [3000]: { prefix: null, infix: null, prec: 100 },
    [2000]: { prefix: parse_boolean, infix: null, prec: 100 },
    [3100]: { prefix: parse_varname, infix: null, prec: 100 },
};
let invalidTok = { kind: 2100, line: -1, lexeme: "" };
let currTok = invalidTok;
let prevTok = invalidTok;
function error_at_current(message) {
    error_at(currTok, message);
}
function error(message) {
    error_at(prevTok, message);
}
function error_at(token, message) {
    let result = "parser: " + token.line + "";
    if (token.kind === 2100)
        result += ": at end";
    else if (token.kind === 2200)
        result += ": scanner";
    else
        result += `: at '${token.lexeme}'`;
    result += `: ${message}\n`;
    throw new Error(result);
}
function advance() {
    prevTok = currTok;
    currTok = scanner.next();
    if (currTok.kind === 2200)
        error_at_current(currTok.lexeme);
}
function check(kind) {
    return currTok.kind === kind;
}
function match(kind) {
    if (currTok.kind === kind) {
        advance();
        return true;
    }
    return false;
}
function consume(kind, message) {
    if (currTok.kind === kind) {
        advance();
        return;
    }
    error_at_current(message);
}
function parse_boolean() {
    return new BooleanNode(prevTok.line, prevTok.kind === 2000);
}
function parse_number() {
    return new NumberNode(prevTok.line, Number(prevTok.lexeme));
}
function parse_string() {
    return new StringNode(prevTok.line, prevTok.lexeme);
}
function parse_fnname() {
    return new FnNode(prevTok.line, prevTok.lexeme);
}
function call_fn() {
    let lhs = parse_fnname();
    consume(500, "expect '(' in function call");
    return call(lhs);
}
function call(lhs) {
    let line = prevTok.line;
    let args = [];
    if (!check(800)) {
        do {
            args.push(expression());
        } while (match(100));
    }
    consume(800, "expect ')' after argument list");
    return new CallNode(line, lhs, args);
}
function parse_varname() {
    return new VarNode(prevTok.line, prevTok.lexeme);
}
function assign_var() {
    let name = prevTok.lexeme;
    consume(1500, "expect '=' in assignmet");
    let line = prevTok.line;
    let rhs = expression();
    return new AssignNode(line, name, rhs);
}
function numeric_binary(lhs) {
    let operator = prevTok.kind;
    let rhs = parse_prec(rules[operator].prec + 1);
    switch (operator) {
        case 600: return new BinaryNode(prevTok.line, lhs, 3, rhs);
        case 1585: return new BinaryNode(prevTok.line, lhs, 0, rhs);
        case 1000: return new BinaryNode(prevTok.line, lhs, 1, rhs);
        case 1100: return new BinaryNode(prevTok.line, lhs, 2, rhs);
        default: error("unhandled numeric binary operator");
    }
}
function declaration() {
    if (match(2460)) {
        return var_decl();
    }
    else {
        return stmt();
    }
}
function var_decl() {
    consume(3100, "expect variable name");
    let name = prevTok.lexeme;
    consume(1500, "expect '=' in variable declaration");
    let init = expression();
    return new VarDeclNode(0, name, init);
}
function stmt() {
    if (match(3100)) {
        return assign_var();
    }
    else if (match(1720)) {
        return call_fn();
    }
    else if (match(1410)) {
        return expr_stmt();
    }
    error_at_current("forbiden expr stmt");
}
function expr_stmt() {
    let line = prevTok.line;
    let expr = expression();
    return new ExprStmtNode(line, expr);
}
function expression() {
    return parse_prec(200);
}
function parse_prec(prec) {
    advance();
    let prefixRule = rules[prevTok.kind].prefix;
    if (prefixRule === null)
        error("expect expression");
    let lhs = prefixRule();
    while (prec <= rules[currTok.kind].prec) {
        advance();
        let infixRule = rules[prevTok.kind].infix;
        if (infixRule === null)
            error("expect infix operator");
        lhs = infixRule(lhs);
    }
    return lhs;
}
export function parse(source) {
    scanner.init(source);
    prevTok = invalidTok;
    currTok = invalidTok;
    let stmts = [];
    try {
        advance();
        while (!match(2100))
            stmts.push(declaration());
        return {
            ok: true,
            value: new FileNode(0, stmts),
        };
    }
    catch (error) {
        return {
            ok: false,
            error: (error instanceof Error) ? error : new Error("unknown error"),
        };
    }
}
