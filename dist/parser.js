import { scanner } from "./scanner.js";
import { AssignNode, BinaryNode, BooleanNode, CallNode, CallVoidNode, ExprStmtNode, FileNode, GetPropNode, IdentNode, IndexNode, ListNode, NegativeNode, NumberNode, SetPropNode, StringNode, UseNode, VarDeclNode } from "./ast.js";
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
    [1600]: { prefix: null, infix: null, prec: 100 },
    [50]: { prefix: null, infix: null, prec: 100 },
    [1620]: { prefix: null, infix: null, prec: 100 },
    [1300]: { prefix: null, infix: null, prec: 100 },
    [100]: { prefix: null, infix: null, prec: 100 },
    [210]: { prefix: null, infix: dot, prec: 600 },
    [2300]: { prefix: null, infix: null, prec: 100 },
    [2100]: { prefix: null, infix: null, prec: 100 },
    [1500]: { prefix: null, infix: assign_var, prec: 200 },
    [1505]: { prefix: null, infix: null, prec: 230 },
    [2200]: { prefix: null, infix: null, prec: 100 },
    [1700]: { prefix: parse_boolean, infix: null, prec: 100 },
    [2320]: { prefix: null, infix: null, prec: 100 },
    [220]: { prefix: null, infix: numeric_binary, prec: 400 },
    [1520]: { prefix: null, infix: null, prec: 250 },
    [1525]: { prefix: null, infix: null, prec: 250 },
    [250]: { prefix: null, infix: null, prec: 100 },
    [1730]: { prefix: parse_ident, infix: null, prec: 100 },
    [2400]: { prefix: null, infix: null, prec: 100 },
    [2405]: { prefix: null, infix: null, prec: 100 },
    [300]: { prefix: null, infix: null, prec: 100 },
    [400]: { prefix: parse_list, infix: index_list, prec: 600 },
    [1550]: { prefix: null, infix: null, prec: 250 },
    [1555]: { prefix: null, infix: null, prec: 250 },
    [500]: { prefix: null, infix: call, prec: 600 },
    [1560]: { prefix: null, infix: null, prec: 300 },
    [2460]: { prefix: null, infix: null, prec: 100 },
    [600]: { prefix: negate, infix: numeric_binary, prec: 300 },
    [1800]: { prefix: parse_number, infix: null, prec: 100 },
    [1820]: { prefix: null, infix: null, prec: 100 },
    [670]: { prefix: null, infix: null, prec: 100 },
    [1580]: { prefix: null, infix: null, prec: 210 },
    [1585]: { prefix: null, infix: numeric_binary, prec: 300 },
    [1590]: { prefix: null, infix: null, prec: 300 },
    [1850]: { prefix: null, infix: null, prec: 300 },
    [695]: { prefix: null, infix: null, prec: 100 },
    [700]: { prefix: null, infix: null, prec: 100 },
    [1880]: { prefix: null, infix: null, prec: 100 },
    [2800]: { prefix: null, infix: null, prec: 100 },
    [800]: { prefix: null, infix: null, prec: 100 },
    [900]: { prefix: null, infix: null, prec: 100 },
    [1100]: { prefix: null, infix: numeric_binary, prec: 400 },
    [1900]: { prefix: parse_string, infix: null, prec: 100 },
    [1910]: { prefix: null, infix: null, prec: 100 },
    [2910]: { prefix: null, infix: null, prec: 100 },
    [3000]: { prefix: null, infix: null, prec: 100 },
    [2000]: { prefix: parse_boolean, infix: null, prec: 100 },
    [2050]: { prefix: null, infix: null, prec: 100 },
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
function call(lhs) {
    if (!(lhs instanceof IdentNode) &&
        !(lhs instanceof GetPropNode))
        error("invalid syntax for function call");
    let line = prevTok.line;
    let args = [];
    if (!check(800)) {
        do {
            args.push(expression());
        } while (match(100));
    }
    consume(800, "expect ')' after argument list");
    return new CallNode(line, lhs, args, -1);
}
function parse_ident() {
    return new IdentNode(prevTok.line, prevTok.lexeme);
}
function parse_list() {
    let line = prevTok.line;
    let items = [];
    if (!check(700)) {
        do {
            items.push(expression());
        } while (match(100));
    }
    consume(700, "expect ']' after list items");
    return new ListNode(line, items);
}
function index_list(lhs) {
    let line = prevTok.line;
    let rhs = expression();
    consume(700, "expect ']' after list indexing");
    return new IndexNode(line, lhs, rhs);
}
function assign_var(lhs) {
    if (!(lhs instanceof IdentNode))
        error("invalid assignment target");
    let line = prevTok.line;
    let rhs = parse_prec(200 + 1);
    return new AssignNode(line, lhs, rhs);
}
function dot(obj) {
    let line = prevTok.line;
    consume(1730, "expect property name after '.'");
    let name = prevTok.lexeme;
    if (match(1500)) {
        let rhs = parse_prec(200 + 1);
        return new SetPropNode(line, obj, name, rhs);
    }
    return new GetPropNode(line, obj, name);
}
function negate() {
    let line = prevTok.line;
    let rhs = parse_prec(500);
    return new NegativeNode(line, rhs);
}
function numeric_binary(lhs) {
    let operator = prevTok.kind;
    let rhs = parse_prec(rules[operator].prec + 1);
    switch (operator) {
        case 220: return new BinaryNode(prevTok.line, lhs, 1, rhs);
        case 600: return new BinaryNode(prevTok.line, lhs, 3, rhs);
        case 1585: return new BinaryNode(prevTok.line, lhs, 0, rhs);
        case 1100: return new BinaryNode(prevTok.line, lhs, 2, rhs);
        default: error("unhandled numeric binary operator");
    }
}
function declaration() {
    if (match(2460)) {
        return var_decl();
    }
    else if (match(2050)) {
        return parse_use();
    }
    else {
        return stmt();
    }
}
function parse_use() {
    let line = prevTok.line;
    consume(1730, "expect variable name");
    let name = prevTok.lexeme;
    return new UseNode(line, name);
}
function var_decl() {
    let line = prevTok.line;
    consume(1730, "expect variable name");
    let name = prevTok.lexeme;
    consume(1500, "expect '=' in variable declaration");
    let init = expression();
    return new VarDeclNode(line, name, init);
}
function stmt() {
    if (check(1730)) {
        return assign_or_call_void();
    }
    else if (match(50)) {
        return expr_stmt();
    }
    error_at_current("forbiden expr stmt");
}
function assign_or_call_void() {
    let ast = expression();
    if (ast instanceof AssignNode ||
        ast instanceof SetPropNode)
        return ast;
    if (ast instanceof CallNode)
        return new CallVoidNode(ast.line, ast);
    error("use :- for expression statement");
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
