// @jonesangga, 08-06-2025, MIT License.
//
// TODO: Test error messages in file.

import { type Token, TokenT, Scanner } from "./scanner.js"
import { AST, AssignNode, BinaryOp, BinaryNode, BooleanNode, CallNode, CallVoidNode,
         EmptyStmtNode, ExprStmtNode, FileNode, GetPropNode, IdentNode, IndexNode, ListNode,
         NegativeNode, NumberNode, SetPropNode, StringNode, UseNode, VarDeclNode } from "./ast.js";

const enum Prec {
    None = 100,
    Assignment = 200, // =
    Or = 210,         // ||
    And = 220,        // &&
    Equality = 230,   // == !=
    Comparison = 250, // < > <= >=
    Term = 300,       // + - |
    Factor = 400,     // * /
    Unary = 500,      // ! -
    Call = 600,       // . (
    Primary = 700,
}

interface ParseRule {
    prefix: ((parser: Parser) => AST) | null;
    infix:  ((parser: Parser, lhs: AST) => AST) | null;
    prec:   Prec;
}

const rules: { [key in TokenT]: ParseRule } = {
    [TokenT.Amp]       : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.AmpAmp]    : {prefix: null,             infix: null,            prec: Prec.And},
    [TokenT.Arrow]     : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Bang]      : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.BangEq]    : {prefix: null,             infix: null,            prec: Prec.Equality},
    [TokenT.BoolT]     : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.BSlash]    : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.CircleT]   : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Colon]     : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Comma]     : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Dot]       : {prefix: null,             infix: dot,             prec: Prec.Call},
    [TokenT.Else]      : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.EOF]       : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Eq]        : {prefix: null,             infix: assign_var,      prec: Prec.Assignment},
    [TokenT.EqEq]      : {prefix: null,             infix: null,            prec: Prec.Equality},
    [TokenT.Error]     : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.False]     : {prefix: parse_boolean,    infix: null,            prec: Prec.None},
    [TokenT.Fn]        : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.FSlash]    : {prefix: null,             infix: numeric_binary,  prec: Prec.Factor},
    [TokenT.Greater]   : {prefix: null,             infix: null,            prec: Prec.Comparison},
    [TokenT.GreaterEq] : {prefix: null,             infix: null,            prec: Prec.Comparison},
    [TokenT.Hash]      : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Ident]     : {prefix: parse_ident,      infix: null,            prec: Prec.None},
    [TokenT.If]        : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Ifx]       : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.LBrace]    : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.LBracket]  : {prefix: parse_list,       infix: index_list,      prec: Prec.Call},
    [TokenT.Less]      : {prefix: null,             infix: null,            prec: Prec.Comparison},
    [TokenT.LessEq]    : {prefix: null,             infix: null,            prec: Prec.Comparison},
    [TokenT.LParen]    : {prefix: null,             infix: call,            prec: Prec.Call},
    [TokenT.LR]        : {prefix: null,             infix: null,            prec: Prec.Term},
    [TokenT.Let]       : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Minus]     : {prefix: negate,           infix: numeric_binary,  prec: Prec.Term},
    [TokenT.Number]    : {prefix: parse_number,     infix: null,            prec: Prec.None},
    [TokenT.NumT]      : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Percent]   : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.PipePipe]  : {prefix: null,             infix: null,            prec: Prec.Or},
    [TokenT.Plus]      : {prefix: null,             infix: numeric_binary,  prec: Prec.Term},
    [TokenT.PlusPlus]  : {prefix: null,             infix: null,            prec: Prec.Term},
    [TokenT.PointT]    : {prefix: null,             infix: null,            prec: Prec.Term},
    [TokenT.RBrace]    : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.RBracket]  : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.RectT]     : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Return]    : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.RParen]    : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Semicolon] : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Star]      : {prefix: null,             infix: numeric_binary,  prec: Prec.Factor},
    [TokenT.String]    : {prefix: parse_string,     infix: null,            prec: Prec.None},
    [TokenT.StrT]      : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Struct]    : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Then]      : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.True]      : {prefix: parse_boolean,    infix: null,            prec: Prec.None},
    [TokenT.Use]       : {prefix: null,             infix: null,            prec: Prec.None},
}

//--------------------------------------------------------------------
// Error functions.

// Error when dealing with current token.
function error_at_current(parser: Parser, message: string): never {
    error_at(parser.currTok, message);
}

// Error when dealing with previous token.
function error(parser: Parser, message: string): never {
    error_at(parser.prevTok, message);
}

// The actual error handling function. It will throw error and stop the parser.
function error_at(token: Token, message: string): never {
    let result = "parser: " + token.line + "";

    if (token.type === TokenT.EOF)
        result += ": at end";
    else if (token.type === TokenT.Error)
        result += ": scanner";
    else
        result += `: at '${ token.lexeme }'`;

    result += `: ${ message }\n`;
    throw new Error(result);
}

//--------------------------------------------------------------------

function advance(parser: Parser): void {
    parser.prevTok = parser.currTok;
    parser.currTok = parser.scanner.next();
    if (parser.currTok.type === TokenT.Error)
        error_at_current(parser, parser.currTok.lexeme);
}

function check(parser: Parser, type: TokenT): boolean {
    return parser.currTok.type === type;
}

function match(parser: Parser, type: TokenT): boolean {
    if (parser.currTok.type === type) {
        advance(parser);
        return true;
    }
    return false;
}

function consume(parser: Parser, type: TokenT, message: string): void {
    if (parser.currTok.type === type) {
        advance(parser);
        return;
    }
    error_at_current(parser, message);
}

//--------------------------------------------------------------------
// Parsing literal.

function parse_boolean(parser: Parser): BooleanNode {
    return new BooleanNode(parser.prevTok.line, parser.prevTok.type === TokenT.True);
}

function parse_number(parser: Parser): NumberNode {
    return new NumberNode(parser.prevTok.line, Number(parser.prevTok.lexeme));
}

function parse_string(parser: Parser): StringNode {
    return new StringNode(parser.prevTok.line, parser.prevTok.lexeme);
}

// Currently there is no namespace.
// TODO: Support parsing the `.` in namespace, like `Seg.FromPoints()`.
function call(parser: Parser, lhs: AST): CallNode {
    if (!(lhs instanceof IdentNode) &&
            !(lhs instanceof GetPropNode))
        error(parser, "invalid syntax for function call");
    let line = parser.prevTok.line;
    let args: AST[] = [];
    if (!check(parser, TokenT.RParen)) {
        do {
            args.push(expression(parser));
        } while (match(parser, TokenT.Comma));
    }
    consume(parser, TokenT.RParen, "expect ')' after argument list");
    return new CallNode(line, lhs, args, -1);   // The version -1 is dummy. It is completed in typechecker.
}

function parse_ident(parser: Parser): IdentNode {
    return new IdentNode(parser.prevTok.line, parser.prevTok.lexeme);
}

function parse_list(parser: Parser): ListNode {
    let line = parser.prevTok.line;
    let items: AST[] = [];
    if (!check(parser, TokenT.RBracket)) {
        do {
            items.push(expression(parser));
        } while (match(parser, TokenT.Comma));
    }
    consume(parser, TokenT.RBracket, "expect ']' after list items");
    return new ListNode(line, items);
}

// TODO: how about list[i][j]?
function index_list(parser: Parser, lhs: AST): IndexNode {
    let line = parser.prevTok.line;
    let rhs = expression(parser);
    consume(parser, TokenT.RBracket, "expect ']' after list indexing");
    return new IndexNode(line, lhs, rhs);
}

function assign_var(parser: Parser, lhs: AST): AssignNode {
    if (!(lhs instanceof IdentNode))
        error(parser, "invalid assignment target");
    let line = parser.prevTok.line;
    let rhs = parse_prec(parser, Prec.Assignment + 1);
    return new AssignNode(line, lhs, rhs);
}

function dot(parser: Parser, obj: AST): GetPropNode | SetPropNode {
    let line = parser.prevTok.line;
    consume(parser, TokenT.Ident, "expect property name after '.'");
    let name = parser.prevTok.lexeme;

    // Setter.
    if (match(parser, TokenT.Eq)) {
        let rhs = parse_prec(parser, Prec.Assignment + 1);
        return new SetPropNode(line, obj, name, rhs);
    }
    return new GetPropNode(line, obj, name);
}

//--------------------------------------------------------------------

function negate(parser: Parser): NegativeNode {
    let line = parser.prevTok.line;
    let rhs = parse_prec(parser, Prec.Unary);
    return new NegativeNode(line, rhs);
}

// The result of these operators is of type Num.
function numeric_binary(parser: Parser, lhs: AST): BinaryNode {
    let operator = parser.prevTok.type;
    let rhs = parse_prec(parser, rules[operator].prec + 1);

    switch (operator) {
        case TokenT.FSlash: return new BinaryNode(parser.prevTok.line, lhs, BinaryOp.Divide, rhs);
        case TokenT.Minus:  return new BinaryNode(parser.prevTok.line, lhs, BinaryOp.Subtract, rhs);
        case TokenT.Plus:   return new BinaryNode(parser.prevTok.line, lhs, BinaryOp.Add, rhs);
        case TokenT.Star:   return new BinaryNode(parser.prevTok.line, lhs, BinaryOp.Multiply, rhs);
        default:            error(parser, "unhandled numeric binary operator");
    }
}

function declaration(parser: Parser): AST {
    if (match(parser, TokenT.Let)) {
        return var_definition(parser);
    } else if (match(parser, TokenT.Use)) {
        return parse_use(parser);
    } else {
        return stmt(parser);
    }
}

function parse_use(parser: Parser): UseNode {
    let line = parser.prevTok.line;
    consume(parser, TokenT.Ident, "expect variable name");
    let name = parser.prevTok.lexeme;
    return new UseNode(line, name);
}

// Definition must be followed by initialization.
function var_definition(parser: Parser): VarDeclNode {
    let line = parser.prevTok.line;
    consume(parser, TokenT.Ident, "expect variable name");
    let name = parser.prevTok.lexeme;
    consume(parser, TokenT.Eq, "expect '=' in definition");
    let init = expression(parser);
    return new VarDeclNode(line, name, init);
}

function stmt(parser: Parser): AST {
    if (check(parser, TokenT.Ident)) {
        // It is either assignment or calling function that doesn't return value.
        return assign_or_call_void(parser);
    }
    else if (match(parser, TokenT.BSlash)) {
        return expr_stmt(parser);
    }
    else if (match(parser, TokenT.Semicolon)) {
        // Nothing to do. This is optional statement delimiter.
        return new EmptyStmtNode(parser.prevTok.line);
    }
    error_at_current(parser, "forbiden expr stmt");
}

function assign_or_call_void(parser: Parser): AssignNode | CallVoidNode | SetPropNode {
    let ast = expression(parser);
    if (ast instanceof AssignNode ||
            ast instanceof SetPropNode)
        return ast;
    if (ast instanceof CallNode)
        return new CallVoidNode(ast.line, ast);
    error(parser, "use :- for expression statement");
}

function expr_stmt(parser: Parser): ExprStmtNode {
    let line = parser.prevTok.line;
    let expr = expression(parser);
    return new ExprStmtNode(line, expr);
}

function expression(parser: Parser): AST {
    return parse_prec(parser, Prec.Assignment);
}

function parse_prec(parser: Parser, prec: Prec): AST {
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

type Result<T> =
    | { ok: true,  value: T }
    | { ok: false, error: Error };

type Parser = {
    scanner: Scanner,
    prevTok: Token,
    currTok: Token,
};

export function parse(source: string): Result<FileNode> {
    let scanner = new Scanner(source);
    let invalidTok = { type: TokenT.EOF, line: -1, lexeme: "" };
    let parser = {scanner, prevTok: invalidTok, currTok: invalidTok};

    let stmts: AST[] = [];

    try {
        advance(parser);
        while (!match(parser, TokenT.EOF))
            stmts.push(declaration(parser));
        return {
            ok: true,
            value: new FileNode(0, stmts),
        };
    }
    catch(error: unknown) {
        return {
            ok: false,
            error: (error instanceof Error) ? error : new Error("unknown error"),
        };
    }
}
