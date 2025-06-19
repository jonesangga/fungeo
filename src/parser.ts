// @jonesangga, 08-06-2025, MIT License.
//
// TODO: Test error messages in file.

import { type Token, TokenT, scanner } from "./scanner.js"
import { AST, AssignNode, BinaryOp, BinaryNode, BooleanNode, CallNode, ExprStmtNode, FileNode, GetPropNode, IdentNode,
         NumberNode, SetPropNode, StringNode, VarDeclNode } from "./ast.js";

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
    prefix: (() => AST) | null;
    infix:  ((lhs: AST) => AST) | null;
    prec:   Prec;
}

const rules: { [key in TokenT]: ParseRule } = {
    [TokenT.Amp]       : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.AmpAmp]    : {prefix: null,             infix: null,            prec: Prec.And},
    [TokenT.Arrow]     : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Bang]      : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.BangEq]    : {prefix: null,             infix: null,            prec: Prec.Equality},
    [TokenT.BoolT]     : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.CircleT]   : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Colon]     : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.ColonEq]   : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.ColonMin]  : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Comma]     : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.DivBy]     : {prefix: null,             infix: null,            prec: Prec.Term},
    [TokenT.Dot]       : {prefix: null,             infix: dot,             prec: Prec.Call},
    [TokenT.Else]      : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.EOF]       : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Eq]        : {prefix: null,             infix: assign_var,      prec: Prec.Assignment},
    [TokenT.EqEq]      : {prefix: null,             infix: null,            prec: Prec.Equality},
    [TokenT.Error]     : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.False]     : {prefix: parse_boolean,    infix: null,            prec: Prec.None},
    [TokenT.Fn]        : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Global]    : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Greater]   : {prefix: null,             infix: null,            prec: Prec.Comparison},
    [TokenT.GreaterEq] : {prefix: null,             infix: null,            prec: Prec.Comparison},
    [TokenT.Hash]      : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Ident]     : {prefix: parse_ident,      infix: null,            prec: Prec.None},
    [TokenT.If]        : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Ifx]       : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.LBrace]    : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.LBracket]  : {prefix: null,             infix: null,            prec: Prec.Call},
    [TokenT.Less]      : {prefix: null,             infix: null,            prec: Prec.Comparison},
    [TokenT.LessEq]    : {prefix: null,             infix: null,            prec: Prec.Comparison},
    [TokenT.LParen]    : {prefix: null,             infix: call,            prec: Prec.Call},
    [TokenT.LR]        : {prefix: null,             infix: null,            prec: Prec.Term},
    [TokenT.Let]       : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Mut]       : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Minus]     : {prefix: null,             infix: numeric_binary,  prec: Prec.Term},
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
    [TokenT.Slash]     : {prefix: null,             infix: numeric_binary,  prec: Prec.Factor},
    [TokenT.Star]      : {prefix: null,             infix: numeric_binary,  prec: Prec.Factor},
    [TokenT.String]    : {prefix: parse_string,     infix: null,            prec: Prec.None},
    [TokenT.StrT]      : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Struct]    : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.Then]      : {prefix: null,             infix: null,            prec: Prec.None},
    [TokenT.True]      : {prefix: parse_boolean,    infix: null,            prec: Prec.None},
}

let invalidTok = { kind: TokenT.EOF, line: -1, lexeme: "" };
let currTok = invalidTok;
let prevTok = invalidTok;

//--------------------------------------------------------------------
// Error functions.

// Error when dealing with current token.
function error_at_current(message: string): never {
    error_at(currTok, message);
}

// Error when dealing with previous token.
function error(message: string): never {
    error_at(prevTok, message);
}

// The actual error handling function. It will throw error and stop the parser.
function error_at(token: Token, message: string): never {
    let result = "parser: " + token.line + "";

    if (token.kind === TokenT.EOF)
        result += ": at end";
    else if (token.kind === TokenT.Error)
        result += ": scanner";
    else
        result += `: at '${ token.lexeme }'`;

    result += `: ${ message }\n`;
    throw new Error(result);
}

//--------------------------------------------------------------------

function advance(): void {
    prevTok = currTok;
    currTok = scanner.next();
    if (currTok.kind === TokenT.Error)
        error_at_current(currTok.lexeme);
}

function check(kind: TokenT): boolean {
    return currTok.kind === kind;
}

function match(kind: TokenT): boolean {
    if (currTok.kind === kind) {
        advance();
        return true;
    }
    return false;
}

function consume(kind: TokenT, message: string): void {
    if (currTok.kind === kind) {
        advance();
        return;
    }
    error_at_current(message);
}

//--------------------------------------------------------------------
// Parsing literal.

function parse_boolean(): BooleanNode {
    return new BooleanNode(prevTok.line, prevTok.kind === TokenT.True);
}

function parse_number(): NumberNode {
    return new NumberNode(prevTok.line, Number(prevTok.lexeme));
}

function parse_string(): StringNode {
    return new StringNode(prevTok.line, prevTok.lexeme);
}

// Currently there is no namespace.
// TODO: Support parsing the `.` in namespace, like `Seg.FromPoints()`.
function call(lhs: AST): CallNode {
    let line = prevTok.line;
    let args: AST[] = [];
    if (!check(TokenT.RParen)) {
        do {
            args.push(expression());
        } while (match(TokenT.Comma));
    }
    consume(TokenT.RParen, "expect ')' after argument list");
    return new CallNode(line, lhs, args);
}

function parse_ident(): IdentNode {
    return new IdentNode(prevTok.line, prevTok.lexeme);
}

function assign_var(lhs: AST): AssignNode {
    if (!(lhs instanceof IdentNode))
        error("invalid assignment target");
    let line = prevTok.line;
    let rhs = parse_prec(Prec.Assignment + 1);
    return new AssignNode(line, lhs, rhs);
}

function dot(obj: AST): GetPropNode | SetPropNode {
    let line = prevTok.line;
    consume(TokenT.Ident, "expect property name after '.'");
    let name = prevTok.lexeme;

    // Setter.
    if (match(TokenT.Eq)) {
        let rhs = expression();
        return new SetPropNode(line, obj, name, rhs);
    }
    return new GetPropNode(line, obj, name);
}

//--------------------------------------------------------------------

// The result of these operators is of type Num.
function numeric_binary(lhs: AST): BinaryNode {
    let operator = prevTok.kind;
    let rhs = parse_prec(rules[operator].prec + 1);

    switch (operator) {
        case TokenT.Minus: return new BinaryNode(prevTok.line, lhs, BinaryOp.Subtract, rhs);
        case TokenT.Plus:  return new BinaryNode(prevTok.line, lhs, BinaryOp.Add, rhs);
        case TokenT.Slash: return new BinaryNode(prevTok.line, lhs, BinaryOp.Divide, rhs);
        case TokenT.Star:  return new BinaryNode(prevTok.line, lhs, BinaryOp.Multiply, rhs);
        default:           error("unhandled numeric binary operator");
    }
}

function declaration(): AST {
    if (match(TokenT.Let)) {
        return var_decl();
    } else {
        return stmt();
    }
}

// Declaration must be followed by initialization.
function var_decl(): VarDeclNode {
    let line = prevTok.line;
    consume(TokenT.Ident, "expect variable name");
    let name = prevTok.lexeme;
    consume(TokenT.Eq, "expect '=' in variable declaration");
    let init = expression();
    return new VarDeclNode(line, name, init);
}

function stmt(): AST {
    if (check(TokenT.Ident)) {
        return expression();
    }
    else if (match(TokenT.ColonMin)) {
        return expr_stmt();
    }
    error_at_current("forbiden expr stmt");
}

function expr_stmt(): ExprStmtNode {
    let line = prevTok.line;
    let expr = expression();
    return new ExprStmtNode(line, expr);
}

function expression(): AST {
    return parse_prec(Prec.Assignment);
}

function parse_prec(prec: Prec): AST {
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

type Result<T> =
    | { ok: true,  value: T }
    | { ok: false, error: Error };

export function parse(source: string): Result<FileNode> {
    scanner.init(source);
    prevTok = invalidTok;
    currTok = invalidTok;

    let stmts: AST[] = [];

    try {
        advance();
        while (!match(TokenT.EOF))
            stmts.push(declaration());
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
