import { Scanner } from "./scanner.js";
import { AssignNode, BinaryNode, BooleanNode, CallNode, CallVoidNode, EmptyStmtNode, ExprStmtNode, FileNode, GetPropNode, IdentNode, IndexNode, ListNode, NegativeNode, NumberNode, SetPropNode, StringNode, UseNode, VarDeclNode } from "./ast.js";
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
function error_at_current(parser, message) {
    error_at(parser.currTok, message);
}
function error(parser, message) {
    error_at(parser.prevTok, message);
}
function error_at(token, message) {
    let result = "parser: " + token.line + "";
    if (token.type === 2100)
        result += ": at end";
    else if (token.type === 2200)
        result += ": scanner";
    else
        result += `: at '${token.lexeme}'`;
    result += `: ${message}\n`;
    throw new Error(result);
}
function advance(parser) {
    parser.prevTok = parser.currTok;
    parser.currTok = parser.scanner.next();
    if (parser.currTok.type === 2200)
        error_at_current(parser, parser.currTok.lexeme);
}
function check(parser, type) {
    return parser.currTok.type === type;
}
function match(parser, type) {
    if (parser.currTok.type === type) {
        advance(parser);
        return true;
    }
    return false;
}
function consume(parser, type, message) {
    if (parser.currTok.type === type) {
        advance(parser);
        return;
    }
    error_at_current(parser, message);
}
function parse_boolean(parser) {
    return new BooleanNode(parser.prevTok.line, parser.prevTok.type === 2000);
}
function parse_number(parser) {
    return new NumberNode(parser.prevTok.line, Number(parser.prevTok.lexeme));
}
function parse_string(parser) {
    return new StringNode(parser.prevTok.line, parser.prevTok.lexeme);
}
function call(parser, lhs) {
    if (!(lhs instanceof IdentNode) &&
        !(lhs instanceof GetPropNode))
        error(parser, "invalid syntax for function call");
    let line = parser.prevTok.line;
    let args = [];
    if (!check(parser, 800)) {
        do {
            args.push(expression(parser));
        } while (match(parser, 100));
    }
    consume(parser, 800, "expect ')' after argument list");
    return new CallNode(line, lhs, args, -1);
}
function parse_ident(parser) {
    return new IdentNode(parser.prevTok.line, parser.prevTok.lexeme);
}
function parse_list(parser) {
    let line = parser.prevTok.line;
    let items = [];
    if (!check(parser, 700)) {
        do {
            items.push(expression(parser));
        } while (match(parser, 100));
    }
    consume(parser, 700, "expect ']' after list items");
    return new ListNode(line, items);
}
function index_list(parser, lhs) {
    let line = parser.prevTok.line;
    let rhs = expression(parser);
    consume(parser, 700, "expect ']' after list indexing");
    return new IndexNode(line, lhs, rhs);
}
function assign_var(parser, lhs) {
    if (!(lhs instanceof IdentNode))
        error(parser, "invalid assignment target");
    let line = parser.prevTok.line;
    let rhs = parse_prec(parser, 200 + 1);
    return new AssignNode(line, lhs, rhs);
}
function dot(parser, obj) {
    let line = parser.prevTok.line;
    consume(parser, 1730, "expect property name after '.'");
    let name = parser.prevTok.lexeme;
    if (match(parser, 1500)) {
        let rhs = parse_prec(parser, 200 + 1);
        return new SetPropNode(line, obj, name, rhs);
    }
    return new GetPropNode(line, obj, name);
}
function negate(parser) {
    let line = parser.prevTok.line;
    let rhs = parse_prec(parser, 500);
    return new NegativeNode(line, rhs);
}
function numeric_binary(parser, lhs) {
    let operator = parser.prevTok.type;
    let rhs = parse_prec(parser, rules[operator].prec + 1);
    switch (operator) {
        case 220: return new BinaryNode(parser.prevTok.line, lhs, 1, rhs);
        case 600: return new BinaryNode(parser.prevTok.line, lhs, 3, rhs);
        case 1585: return new BinaryNode(parser.prevTok.line, lhs, 0, rhs);
        case 1100: return new BinaryNode(parser.prevTok.line, lhs, 2, rhs);
        default: error(parser, "unhandled numeric binary operator");
    }
}
function declaration(parser) {
    if (match(parser, 2460)) {
        return var_definition(parser);
    }
    else if (match(parser, 2050)) {
        return parse_use(parser);
    }
    else {
        return stmt(parser);
    }
}
function parse_use(parser) {
    let line = parser.prevTok.line;
    consume(parser, 1730, "expect variable name");
    let name = parser.prevTok.lexeme;
    return new UseNode(line, name);
}
function var_definition(parser) {
    let line = parser.prevTok.line;
    consume(parser, 1730, "expect variable name");
    let name = parser.prevTok.lexeme;
    consume(parser, 1500, "expect '=' in definition");
    let init = expression(parser);
    return new VarDeclNode(line, name, init);
}
function stmt(parser) {
    if (check(parser, 1730)) {
        return assign_or_call_void(parser);
    }
    else if (match(parser, 50)) {
        return expr_stmt(parser);
    }
    else if (match(parser, 900)) {
        return new EmptyStmtNode(parser.prevTok.line);
    }
    error_at_current(parser, "forbiden expr stmt");
}
function assign_or_call_void(parser) {
    let ast = expression(parser);
    if (ast instanceof AssignNode ||
        ast instanceof SetPropNode)
        return ast;
    if (ast instanceof CallNode)
        return new CallVoidNode(ast.line, ast);
    error(parser, "use :- for expression statement");
}
function expr_stmt(parser) {
    let line = parser.prevTok.line;
    let expr = expression(parser);
    return new ExprStmtNode(line, expr);
}
function expression(parser) {
    return parse_prec(parser, 200);
}
function parse_prec(parser, prec) {
    advance(parser);
    let prefixRule = rules[parser.prevTok.type].prefix;
    if (prefixRule === null)
        error(parser, "expect expression");
    let lhs = prefixRule(parser);
    while (prec <= rules[parser.currTok.type].prec) {
        advance(parser);
        let infixRule = rules[parser.prevTok.type].infix;
        if (infixRule === null)
            error(parser, "expect infix operator");
        lhs = infixRule(parser, lhs);
    }
    return lhs;
}
export function parse(source) {
    let scanner = new Scanner(source);
    let invalidTok = { type: 2100, line: -1, lexeme: "" };
    let parser = { scanner, prevTok: invalidTok, currTok: invalidTok };
    let stmts = [];
    try {
        advance(parser);
        while (!match(parser, 2100))
            stmts.push(declaration(parser));
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
