// @jonesangga, 12-04-2025, MIT License.

import { TokenT, TokenTName, type Token, scanner } from "./scanner.js"
import { Op, Chunk } from "./chunk.js"
import { Kind, KindName, type Version, FGBoolean, FGNumber, FGString, FGCallable, FGFunction, type Value } from "./value.js"
import { type Info, nativeNames, userNames } from "./names.js"

let numberType: Info = { kind: Kind.Number };

type TypeCheck = {
    base: Kind;
}

let booleanT = { base: Kind.Boolean };
let numberT  = { base: Kind.Number };
let stringT  = { base: Kind.String };
let nothingT  = { base: Kind.Nothing };
let lastT = nothingT;

function assertT(actual: TypeCheck, expect: TypeCheck, msg: string): void {
    if (actual.base !== expect.base)
        error(msg);
}

// To distinguish function as argument vs function call.
let canParseArgument = false;

let canAssign = false;

const enum Precedence {
    None = 100,
    Assignment = 200, // =
    Or = 210,         // ||
    And = 220,        // &&
    Equality = 230,   // == !=
    Comparison = 250, // < > <= >=
    Term = 300,       // + -
    Factor = 400,     // * /
    Unary = 500,      // ! -
    Call = 600,       // . () _
    Primary = 700,
}

interface ParseRule {
    prefix: (() => void) | null;
    infix:  (() => void) | null;
    precedence: Precedence;
}

const rules: { [key in TokenT]: ParseRule } = {
    [TokenT.Amp]       : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.AmpAmp]    : {prefix: null,            infix: and_,    precedence: Precedence.And},
    [TokenT.Arrow]     : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Bang]      : {prefix: not,             infix: null,    precedence: Precedence.None},
    [TokenT.BangEq]    : {prefix: null,            infix: neq,     precedence: Precedence.Equality},
    [TokenT.Colon]     : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.ColonEq]   : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Comma]     : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Dollar]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Else]      : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.EOF]       : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Eq]        : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.EqEq]      : {prefix: null,            infix: eq,      precedence: Precedence.Equality},
    [TokenT.Error]     : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.False]     : {prefix: parse_boolean,   infix: null,    precedence: Precedence.None},
    [TokenT.Fn]        : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Greater]   : {prefix: null,            infix: compare, precedence: Precedence.Comparison},
    [TokenT.GreaterEq] : {prefix: null,            infix: compare, precedence: Precedence.Comparison},
    [TokenT.If]        : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Ifx]       : {prefix: parse_ifx,       infix: null,    precedence: Precedence.None},
    [TokenT.LBrace]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.LBracket]  : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Less]      : {prefix: null,            infix: compare, precedence: Precedence.Comparison},
    [TokenT.LessEq]    : {prefix: null,            infix: compare, precedence: Precedence.Comparison},
    [TokenT.LParen]    : {prefix: grouping,        infix: null,    precedence: Precedence.None},
    [TokenT.Minus]     : {prefix: negate,          infix: binary,  precedence: Precedence.Term},
    [TokenT.Name]      : {prefix: parse_name,      infix: null,    precedence: Precedence.None},
    [TokenT.Number]    : {prefix: parse_number,    infix: null,    precedence: Precedence.None},
    [TokenT.NumT]      : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Pipe]      : {prefix: null,            infix: binary,  precedence: Precedence.Term},
    [TokenT.PipePipe]  : {prefix: null,            infix: or_,     precedence: Precedence.Or},
    [TokenT.Plus]      : {prefix: null,            infix: binary,  precedence: Precedence.Term},
    [TokenT.PlusPlus]  : {prefix: null,            infix: binary_str,  precedence: Precedence.Term},
    [TokenT.Proc]      : {prefix: null,            infix: binary_str,  precedence: Precedence.Term},
    [TokenT.RBrace]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.RBracket]  : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Return]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.RParen]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Semicolon] : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Slash]     : {prefix: null,            infix: binary,  precedence: Precedence.Factor},
    [TokenT.Star]      : {prefix: null,            infix: binary,  precedence: Precedence.Factor},
    [TokenT.String]    : {prefix: parse_string,    infix: null,    precedence: Precedence.None},
    [TokenT.StrT]      : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Then]      : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.True]      : {prefix: parse_boolean,   infix: null,    precedence: Precedence.None},
}


interface Local {
    name: string;
    type: Info;
    depth: number;
}

const enum FnT {
    Function,
    Script,
}

interface Compiler {
    enclosing: Compiler | null;
    fn: FGFunction,
    type: FnT,
    locals: Local[];
    scopeDepth: number;
}

let current: Compiler;

let invalidToken = { kind: TokenT.EOF, line: -1, lexeme: "" };

let currTok = invalidToken;
let prevTok = invalidToken;

function currentChunk(): Chunk {
    return current.fn.chunk;
}

function init_compiler(compiler: Compiler, type: FnT, name: string): void {
    compiler.enclosing = current;
    compiler.fn = new FGFunction(name, [{input: [], output: Kind.Nothing}], new Chunk(name));
    compiler.type = type;

    compiler.locals = [];
    compiler.scopeDepth = 0;
    current = compiler;

    // let local: Local = { name: "", type: {kind: Kind.Nothing}, depth: 0};
    // current.locals.push(local);
}

function endCompiler(): FGFunction {
    emitReturn();
    let fn = current.fn;
    console.log( currentChunk().disassemble() );
    current = current.enclosing as Compiler;
    return fn;
}

//--------------------------------------------------------------------
// Error functions.

function error_at_current(message: string): void {
    error_at(currTok, message);
}

function error(message: string): void {
    error_at(prevTok, message);
}

function error_at(token: Token, message: string): void {
    let result = token.line + "";

    if (token.kind === TokenT.EOF)
        result += ": at end";
    else if (token.kind === TokenT.Error)
        result += ": scanner";
    else
        result += `: at '${ token.lexeme }'`;

    result += `: ${ message }\n`;
    throw new CompileError(result);
}

//--------------------------------------------------------------------

function advance(): void {
    prevTok = currTok;
    currTok = scanner.next();
    if (currTok.kind === TokenT.Error) {
        error_at_current(currTok.lexeme);
    }
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
// Emit functions.

function emitByte(byte: number): void {
    currentChunk().write(byte, prevTok.line);
}

function emitBytes(byte1: number, byte2: number): void {
    emitByte(byte1);
    emitByte(byte2);
}

function emitConstant(value: Value): void {
    emitBytes(Op.Load, makeConstant(value));
}

function emitReturn(): void {
    emitByte(Op.Ok);
}

//--------------------------------------------------------------------

function makeConstant(value: Value) {
    return currentChunk().add_value(value);
}

//--------------------------------------------------------------------

function grouping(): void {
    canParseArgument = true;
    expression();
    consume(TokenT.RParen, "expect ')' after grouping");
}

function not(): void {
    parsePrecedence(Precedence.Unary);
    assertT(lastT, booleanT, "'!' is only for boolean");
    emitByte(Op.Not);
}

function negate(): void {
    parsePrecedence(Precedence.Unary);
    assertT(lastT, numberT, "'-' is only for number");
    emitByte(Op.Neg);
}

function eq(): void {
    parsePrecedence(Precedence.Equality + 1);
    emitByte(Op.Eq);
    lastT = booleanT;
}

function neq(): void {
    parsePrecedence(Precedence.Equality + 1);
    emitByte(Op.NEq);
    lastT = booleanT;
}

// Can only compare 2 numbers or 2 string for now.

function compare(): void {
    let operator = prevTok.kind;
    let left = lastT.base;
    if (left !== Kind.Number && left !== Kind.String)
        error("can only compare strings or numbers");

    parsePrecedence(Precedence.Comparison + 1);
    if (lastT.base !== left)
        error("type not match");

    switch (operator) {
        case TokenT.Less:      emitByte(Op.LT); break;
        case TokenT.Greater:   emitByte(Op.GT); break;
        case TokenT.LessEq:    emitByte(Op.LEq); break;
        case TokenT.GreaterEq: emitByte(Op.GEq); break;
        default:               error("unhandled camparison op");
    }
    lastT = booleanT;
}

// Only for numbers.
// TODO: change lastType when implementing relation (<, >, ==).

function binary(): void {
    let operator = prevTok.lexeme;
    assertT(lastT, numberT, `'${ operator }' only for numbers`);

    let operatorType = prevTok.kind;
    let rule = rules[operatorType];
    parsePrecedence(rule.precedence + 1);

    assertT(lastT, numberT, `'${ operator }' only for numbers`);

    switch (operatorType) {
        case TokenT.Pipe:   emitByte(Op.IsDiv); lastT = booleanT; break;
        case TokenT.Plus:   emitByte(Op.Add); break;
        case TokenT.Minus:  emitByte(Op.Sub); break;
        case TokenT.Star:   emitByte(Op.Mul); break;
        case TokenT.Slash:  emitByte(Op.Div); break;
        default:            error("unhandled binary op");
    }
}

function binary_str(): void {
    let operator = prevTok.lexeme;
    assertT(lastT, stringT, `'${ operator }' only for strings`);

    let operatorType = prevTok.kind;
    let rule = rules[operatorType];
    parsePrecedence(rule.precedence + 1);

    assertT(lastT, stringT, `'${ operator }' only for strings`);
    emitByte(Op.AddStr);
}

//--------------------------------------------------------------------
// Parsing literal.

function parse_boolean(): void {
    if (prevTok.kind === TokenT.True)
        emitConstant(new FGBoolean(true));
    else
        emitConstant(new FGBoolean(false));
    lastT = booleanT;
}

function parse_number(): void {
    let value = Number(prevTok.lexeme);
    emitConstant(new FGNumber(value));
    lastT = numberT;
}

function parse_string(): void {
    emitConstant(new FGString(prevTok.lexeme));
    lastT = stringT;
}

function parse_return(): {base: Kind} {
    console.log("in parse_return()");
    expression();
    emitByte(Op.Ret);
    let resultT = lastT;
    lastT = nothingT;
    return resultT;
}

//--------------------------------------------------------------------

interface TempTypes {
    kind:     Kind;
    value?:   Value,
}

interface TempNames {
    [name: string]: TempTypes;
}

let tempNames: TempNames = {
};


function resolveLocal(compiler: Compiler, name: string): number {
    for (let i = compiler.locals.length - 1; i >= 0; i--) {
        let local = compiler.locals[i];
        if (name === local.name) {
            return i;
        }
    }

    return -1;
}

function parse_name(): void {
    let name = prevTok.lexeme;

    if (match(TokenT.Eq)) {
        if (canAssign) {
            canAssign = false;
            set_name(name);
        } else {
            error(`cannot assign ${name}`);
        }
    } else {
        canAssign = false;
        get_name(name);
    }
}

function set_name(name: string): void {
    if (current.scopeDepth > 0) {
        set_local(name);
    } else {
        set_global(name);
    }
}

function set_local(name: string): void {
    for (let i = current.locals.length - 1; i >= 0; i--) {
        let local = current.locals[i];
        if (local.depth < current.scopeDepth) {
            break;
        }
        if (name === local.name) {
            error(`${ name } already defined in this scope`);
        }
    }
    add_local(name);

    lastT = nothingT;
    canParseArgument = true;
    expression();

    emitByte(Op.SetLoc);
    current.locals[current.locals.length - 1].type = { kind: lastT.base };
    lastT = nothingT;
}

function set_global(name: string): void {
    if (Object.hasOwn(nativeNames, name)
            || Object.hasOwn(userNames, name)
            || Object.hasOwn(tempNames, name)) {
        error(`${ name } already defined`);
    }

    let index = makeConstant(new FGString(name));
    lastT = nothingT;
    canParseArgument = true;
    expression();

    emitBytes(Op.Set, index);
    emitByte(lastT.base);
    tempNames[name] = { kind: lastT.base };
    lastT = nothingT;
}

function parse_type(): {base: Kind} {
    advance();
    switch (prevTok.kind) {
        case TokenT.NumT:
            return {base: Kind.Number};
        case TokenT.StrT:
            return {base: Kind.String};
        default:
            error("expect parameter type");
            return {base: Kind.Nothing};
    }
}

function parse_params(): void {
    consume(TokenT.Name, "expect parameter name");
    let name = prevTok.lexeme;

    for (let i = current.locals.length - 1; i >= 0; i--) {
        let local = current.locals[i];
        if (local.depth < current.scopeDepth) break;
        if (name === local.name)
            error(`${ name } already defined in this scope`);
    }
    add_local(name);

    consume(TokenT.Colon, "expect `:` after parameter name");
    let t = parse_type();

    current.locals[current.locals.length - 1].type = { kind: t.base };
    current.fn.version[0].input.push(t.base);
    lastT = nothingT;
}

function fn(): void {
    consume(TokenT.Name, "expect function name");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));

    let comp: Compiler = {} as Compiler;
    init_compiler(comp, FnT.Function, name);
    beginScope();

    do {
        parse_params();
    } while (match(TokenT.Comma));
    console.log(current.fn);

    // return type
    consume(TokenT.Arrow, "expect `->` after list of params");
    let t = parse_type();

    current.fn.version[0].output = t.base;
    tempNames[name] = { kind: Kind.Callable, value: current.fn };

    consume(TokenT.Eq, "expect '=' before fn body");

    expression();
    emitBytes(Op.Ret, 1);
    assertT(lastT, t, "return type not match");

    let fn = endCompiler();
    emitConstant(fn);
    emitBytes(Op.Set, index);
    emitByte(Kind.Callable);
}

function proc(): void {
    consume(TokenT.Name, "expect procedure name");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));

    let comp: Compiler = {} as Compiler;
    init_compiler(comp, FnT.Function, name);
    beginScope();

    do {
        parse_params();
    } while (match(TokenT.Comma));
    console.log(current.fn);

    current.fn.version[0].output = Kind.Nothing;
    tempNames[name] = { kind: Kind.Callable, value: current.fn };

    consume(TokenT.LBrace, "expect '{' before proc body");

    procBody();
    emitBytes(Op.Ret, 0);

    consume(TokenT.RBrace, "expect '}' after proc body");

    let fn = endCompiler();
    emitConstant(fn);
    emitBytes(Op.Set, index);
    emitByte(Kind.Callable);
}

function procBody(): void {
    while (!check(TokenT.RBrace) && !check(TokenT.EOF)) {
        statement();
    }
}

function get_name(name: string): void {
    let arg = resolveLocal(current, name);
    if (arg != -1) {
        emitBytes(Op.GetLoc, arg);
        lastT = {base: current.locals[arg].type.kind};
    }
    else if (Object.hasOwn(nativeNames, name)) {
        console.log("in nativeNames");
        if (nativeNames[name].kind === Kind.Callable)
            global_callable(name, nativeNames, true);
        else
            global_non_callable(nativeNames, name, true);
    }
    else if (Object.hasOwn(userNames, name)) {
        if (userNames[name].kind === Kind.Callable)
            global_callable(name, userNames, false);
        else
            global_non_callable(userNames, name, false);
    }
    else if (Object.hasOwn(tempNames, name)) {
        if (tempNames[name].kind === Kind.Callable)
            global_callable(name, tempNames, false);
        else
            global_non_callable(tempNames, name, false);
    }
    else {
        error(`undefined name ${name}`);
    }
}

function matchType(expected: (Set<number> | Kind), actual: Kind): boolean {
    if (expected === Kind.Any) {
        return true;
    } else if (typeof expected === "number") {
        return actual === expected;
    } else {
        return expected.has(actual);
    }
}

function setToKinds(set_: Set<number>): string[] {
    let s = [];
    for (let kind of set_) {
        s.push(KindName[kind as Kind]);
    }
    return s;
}

function global_callable(name_: string, table: any, native: boolean): void {
    if (!canParseArgument) {
        lastT = {base: table[name_].kind };
        return;
    }
    canParseArgument = match(TokenT.Dollar);

    let name    = table[name_];
    console.log(name);
    // let version = name.version as Version[];
    let version = (name.value as FGCallable).version;
    let inputVersion: (Set<number> | Kind)[] = [];
    let gotTypes: Kind[]     = [];

    let success = true;

    let i = 0;
    let j = 0;
    for ( ; i < version.length; i++) {
        let checkNextVersion = false;
        success = true;
        inputVersion = version[i].input;

        j = 0;
        for ( ; j < gotTypes.length; j++) {
            if (!matchType(inputVersion[j], gotTypes[j])) {
                success = false;
                break;
            }
        }
        if (!success) continue;

        for (let k = j; k < inputVersion.length; k++) {
            lastT = nothingT;
            parsePrecedence(Precedence.Call);
            gotTypes.push(lastT.base);
            if (!matchType(inputVersion[k], lastT.base)) {
                checkNextVersion = true;
                success = false;
                break;
            }
        }
        if (!checkNextVersion) break;
    }

    if (!success) {
        if (typeof inputVersion[j] === "number")
            error(`in ${name_}: expect arg ${j} of type ${KindName[inputVersion[j] as Kind]}, got ${KindName[gotTypes[j]]}`);
        else
            error(`in ${name_}: expect arg ${j} of class [${setToKinds(inputVersion[j] as Set<number>)}], got ${KindName[gotTypes[j]]}`);
    }

    let index = makeConstant(name.value as FGCallable);
    if (native)
        emitBytes(Op.CallNat, index);
    else
        emitBytes(Op.CallUsr, index);
    emitByte(i);

    if (version[i].output === Kind.Nothing) {
        lastT = nothingT;
    } else {
        lastT = {base: version[i].output as Kind};
    }
}

function global_non_callable(table: any, name: string, native: boolean): void {
    let index = makeConstant(new FGString(name));
    if (native)
        emitBytes(Op.GetNat, index);
    else
        emitBytes(Op.GetUsr, index);

    lastT = {base: table[name].kind};
}

function add_local(name: string): void {
    let local: Local = { name, type: {kind: Kind.Nothing}, depth: current.scopeDepth };
    current.locals.push(local);
}

function emitJump(instruction: number): number {
    emitByte(instruction);
    emitByte(-1);            // Dummy number. See patchJump().
    return currentChunk().code.length - 1;
}

function patchJump(offset: number): void {
    // -1 to adjust for the bytecode for the jump offset itself.
    let jump = currentChunk().code.length - offset - 1;
    currentChunk().code[offset] = jump;
}

// test boolean type!!!
//
function parse_if(): void {
    expression();
    assertT(lastT, booleanT, "conditional expression must be boolean");

    let thenJump = emitJump(Op.JmpF);
    emitByte(Op.Pop);
    statement();

    let elseJump = emitJump(Op.Jmp);
    patchJump(thenJump);
    emitByte(Op.Pop);

    if (match(TokenT.Else))
        statement();
    patchJump(elseJump);
}

function parse_ifx(): void {
    expression();
    assertT(lastT, booleanT, "conditional expression must be boolean");

    let thenJump = emitJump(Op.JmpF);
    emitByte(Op.Pop);
    consume(TokenT.Then, "then is missing");
    expression();
    let trueT = lastT;

    let elseJump = emitJump(Op.Jmp);
    patchJump(thenJump);
    emitByte(Op.Pop);

    consume(TokenT.Else, "else is missing");
    canParseArgument = true;
    expression();
    assertT(trueT, lastT, "true and false branch didn't match");

    patchJump(elseJump);
}

function emitLoop(loopStart: number): void {
    emitByte(Op.JmpBack);
    let offset = currentChunk().code.length - loopStart + 1;
    emitByte(-offset);
}

function parse_loop(): void {
    beginScope();

    lastT = nothingT;
    expression();
    assertT(lastT, numberT, "start of range must be number");
    let start = current.locals.length;
    let startRange: Local = { name: "_Start", type: numberType, depth: current.scopeDepth };
    current.locals.push(startRange);

    consume(TokenT.Comma, "expect ',' between start and end");

    lastT = nothingT;
    expression();
    assertT(lastT, numberT, "end of range must be number");
    let openRightId = currentChunk().values.length;
    emitConstant(new FGNumber(0));
    emitByte(Op.Add);
    let endRange: Local = { name: "_End", type: numberType, depth: current.scopeDepth };
    current.locals.push(endRange);

    // Parse optional step.
    if (match(TokenT.Comma)) {
        expression();
    } else {
        // Manually add step. Default is 1.
        emitConstant(new FGNumber(1));
    }
    let stepRange: Local = { name: "_Step", type: numberType, depth: current.scopeDepth };
    current.locals.push(stepRange);

    if (match(TokenT.RParen)) {
        currentChunk().values[openRightId] = new FGNumber(-1);
    } else {
        consume(TokenT.RBracket, "expect ']' in range");
    }

    if (!match(TokenT.Name)) {
        error_at_current("expect name for iterator");
    }

    let name = prevTok.lexeme;
    for (let i = current.locals.length - 1; i >= 0; i--) {
        let local = current.locals[i];
        if (local.depth < current.scopeDepth) break;
        if (name === local.name)
            error(`${ name } already defined in this scope`);
    }
    current.locals[start].name = name;
    emitByte(Op.SetLoc);

    let loopStart = currentChunk().code.length;

    emitBytes(Op.Cond, start);

    let exitJump = emitJump(Op.JmpF);
    emitByte(Op.Pop);                   // Discard the result of Op.Cond.

    // Parse the body. Handle new block.
    if (match(TokenT.LBrace)) {
        while (!check(TokenT.RBrace) && !check(TokenT.EOF)) {
            declaration();
        }
        consume(TokenT.RBrace, "expect '}' after block");

        // Pop additional locals from the stack.
        while (current.locals.length > start + 3) {
            emitByte(Op.Pop);
            current.locals.pop();
        }
    } else {
        statement();
    }

    // Increment the iterator.
    emitBytes(Op.Inc, start);
    emitLoop(loopStart);

    patchJump(exitJump);
    emitByte(Op.Pop);   // For false.
    endScope();         // For lower bound.
    lastT = nothingT;
}

// function parse_for(): void {
    // beginScope();
    // if (match(TokenT.Semicolon)) {
        // // No initializer.
    // } else if (match(TokenT.Name)) {
        // canParseArgument = true;
        // canAssign = true;
        // parse_name();
        // // varDeclaration();
    // } else {
        // error("Need initializer in for loop");
        // // expressionStatement();
    // }

    // let loopStart = currentChunk().code.length;

    // let exitJump = -1;
    // if (!match(TokenT.Semicolon)) {
        // expression();
        // consume(TokenT.Semicolon, "expect ';' after loop condition");

        // // Jump out of the loop if the condition is false.
        // exitJump = emitJump(Op.JmpF);
        // emitByte(Op.Pop); // Condition.
    // }

    // if (!match(TokenT.RParen)) {
        // let bodyJump = emitJump(Op.Jmp);
        // let incrementStart = currentChunk().code.length;
        // expression();
        // emitByte(Op.Pop);
        // consume(TokenT.RParen, "expect ')' after for clauses");

        // emitLoop(loopStart);
        // loopStart = incrementStart;
        // patchJump(bodyJump);
    // }

    // statement();
    // emitLoop(loopStart);

    // if (exitJump != -1) {
        // patchJump(exitJump);
        // emitByte(Op.Pop); // Condition.
    // }

    // endScope();
// }

function and_(): void {
    assertT(lastT, booleanT, "operands of '&&' must be boolean");

    let endJump = emitJump(Op.JmpF);
    emitByte(Op.Pop);

    parsePrecedence(Precedence.And);
    assertT(lastT, booleanT, "operands of '&&' must be boolean");

    patchJump(endJump);
}

function or_(): void {
    assertT(lastT, booleanT, "operands of '||' must be boolean");

    let elseJump = emitJump(Op.JmpF);
    let endJump = emitJump(Op.Jmp);

    patchJump(elseJump);
    emitByte(Op.Pop);

    parsePrecedence(Precedence.Or);
    assertT(lastT, booleanT, "operands of '||' must be boolean");

    patchJump(endJump);
}

function parsePrecedence(precedence: Precedence): void {
    // prev();
    // curr();
    advance();
    let prefixRule = rules[prevTok.kind].prefix;
    if (prefixRule === null) {
        error("expect expression");
        return;
    }

    prefixRule();

    while (precedence <= rules[currTok.kind].precedence) {
        advance();
        let infixRule = rules[prevTok.kind].infix;
        if (infixRule === null) {
            error("expect infix operator");
            return;
        }
        infixRule();
    }
}

function expression(): void {
    parsePrecedence(Precedence.Assignment);
}

function identifierConstant(name: Token): number {
    return makeConstant(new FGString(name.lexeme));
}

function prev() {
    console.log(TokenTName[prevTok.kind]);
}
function curr() {
    console.log(TokenTName[currTok.kind]);
}

function declaration(): void {
    if (match(TokenT.Fn)) {
        fn();
    } else if (match(TokenT.Proc)) {
        proc();
    } else {
        statement();
    }
}

function statement(): void {
    if (match(TokenT.Name)) {
        canParseArgument = true;
        canAssign = true;
        parse_name();
    } else if (match(TokenT.LBrace)) {
        beginScope();
        block();
        endScope();
    } else if (match(TokenT.If)) {
        parse_if();
    } else if (match(TokenT.LBracket)
            || match(TokenT.LParen)) {
        parse_loop();
    } else if (match(TokenT.Return)) {
        parse_return();
    } else if (match(TokenT.Semicolon)) {
        // This is optional statement delimiter. Nothing to do.
    } else {
        error_at_current(`cannot start statement with ${ TokenTName[currTok.kind] }`);
    }

    assertT(lastT, nothingT, "forbidden expression statement");
}

function beginScope(): void {
    current.scopeDepth++;
}

function block(): void {
    while (!check(TokenT.RBrace) && !check(TokenT.EOF)) {
        declaration();
    }
    consume(TokenT.RBrace, "expect '}' after block");
}

// TODO: should we use variable localCount so we don't need pop()?
function endScope(): void {
    current.scopeDepth--;

    while (current.locals.length > 0 &&
        current.locals[current.locals.length - 1].depth > current.scopeDepth
    ) {
        emitByte(Op.Pop);
        current.locals.pop();
    }
}

interface CompilerResult {
    success: boolean;
    message?: string;
    result?: FGFunction,
}

class CompileError extends Error {}

const compiler = {
    compile(source: string): CompilerResult {
        scanner.init(source);
        let comp: Compiler = {enclosing: null, fn: new FGFunction("test", [], new Chunk("")), type: FnT.Function, locals: [], scopeDepth: 0};
        init_compiler(comp, FnT.Script, "TOP");

        tempNames = {};
        prevTok = invalidToken;
        currTok = invalidToken;

        try {
            advance();
            while (!match(TokenT.EOF)) {
                declaration();
            }
            return { success: true, result: endCompiler() };
        }
        catch(error: unknown) {
            if (error instanceof CompileError) {
                // console.log("catch CompileError");
                console.log(error);
                return { success: false, message: error.message };
            } else {
                // console.log("catch Error");
                console.log(error);
                return { success: false, message: (error as Error).message };
            }
        }
    }
};

export { compiler };
