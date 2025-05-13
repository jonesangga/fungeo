// @jonesangga, 12-04-2025, MIT License.

import { TokenT, TokenTName, type Token, scanner } from "./scanner.js"
import { Op, Chunk } from "./chunk.js"
import { Kind, KindName, type Version, FGBoolean, FGNumber, FGString, FGCallable, type Value } from "./value.js"
import { type Types, nativeNames, userNames } from "./names.js"

let invalidType: Types = { kind: Kind.Nothing };
let numberType: Types = { kind: Kind.Number };
let booleanType: Types = { kind: Kind.Boolean };
let lastType: Types = invalidType;

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
    [TokenT.Greater]   : {prefix: null,            infix: compare, precedence: Precedence.Comparison},
    [TokenT.GreaterEq] : {prefix: null,            infix: compare, precedence: Precedence.Comparison},
    [TokenT.If]        : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.LBrace]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.LBracket]  : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Less]      : {prefix: null,            infix: compare, precedence: Precedence.Comparison},
    [TokenT.LessEq]    : {prefix: null,            infix: compare, precedence: Precedence.Comparison},
    [TokenT.LParen]    : {prefix: grouping,        infix: null,    precedence: Precedence.None},
    [TokenT.Minus]     : {prefix: negate,          infix: binary,  precedence: Precedence.Term},
    [TokenT.Name]      : {prefix: parse_name,      infix: null,    precedence: Precedence.None},
    [TokenT.Number]    : {prefix: parse_number,    infix: null,    precedence: Precedence.None},
    [TokenT.Pipe]      : {prefix: null,            infix: binary,  precedence: Precedence.Term},
    [TokenT.PipePipe]  : {prefix: null,            infix: or_,     precedence: Precedence.Or},
    [TokenT.Plus]      : {prefix: null,            infix: binary,  precedence: Precedence.Term},
    [TokenT.PlusPlus]  : {prefix: null,            infix: binary_str,  precedence: Precedence.Term},
    [TokenT.RBrace]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.RBracket]  : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.RParen]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Semicolon] : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Slash]     : {prefix: null,            infix: binary,  precedence: Precedence.Factor},
    [TokenT.Star]      : {prefix: null,            infix: binary,  precedence: Precedence.Factor},
    [TokenT.String]    : {prefix: parse_string,    infix: null,    precedence: Precedence.None},
    [TokenT.True]      : {prefix: parse_boolean,   infix: null,    precedence: Precedence.None},
}


interface Local {
    name: string;
    type: Types;
    depth: number;
}

interface Compiler {
    locals: Local[];
    scopeDepth: number;
}

let current: Compiler = {locals: [], scopeDepth: 0};

let invalidToken = { kind: TokenT.EOF, line: -1, lexeme: "" };

let parser: { current: Token, previous: Token } = {
    current: invalidToken,
    previous: invalidToken,
};

let compilingChunk: Chunk;

function currentChunk(): Chunk {
    return compilingChunk;
}

function init_compiler(compiler: Compiler): void {
    compiler.locals = [];
    compiler.scopeDepth = 0;
    current = compiler;
}

//--------------------------------------------------------------------
// Error functions.

function error_at_current(message: string): void {
    error_at(parser.current, message);
}

function error(message: string): void {
    error_at(parser.previous, message);
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
    parser.previous = parser.current;
    parser.current = scanner.next();
    if (parser.current.kind === TokenT.Error) {
        error_at_current(parser.current.lexeme);
    }
}

function check(kind: TokenT): boolean {
    return parser.current.kind === kind;
}

function match(kind: TokenT): boolean {
    if (parser.current.kind === kind) {
        advance();
        return true;
    }
    return false;
}

function consume(kind: TokenT, message: string): void {
    if (parser.current.kind === kind) {
        advance();
        return;
    }
    error_at_current(message);
}

//--------------------------------------------------------------------
// Emit functions.

function emitByte(byte: number): void {
    currentChunk().write(byte, parser.previous.line);
}

function emitBytes(byte1: number, byte2: number): void {
    emitByte(byte1);
    emitByte(byte2);
}

function emitConstant(value: Value): void {
    emitBytes(Op.Load, makeConstant(value));
}

function emitReturn(): void {
    emitByte(Op.Ret);
}

//--------------------------------------------------------------------

function endCompiler(): void {
    emitReturn();
    // disassembleChunk(currentChunk(), "code");
}

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
    if (lastType.kind !== Kind.Boolean) {
        error(`'!' is only for boolean`);
    }
    emitByte(Op.Not);
}

function negate(): void {
    parsePrecedence(Precedence.Unary);
    if (lastType.kind !== Kind.Number) {
        error(`'-' is only for number`);
    }
    emitByte(Op.Neg);
}

function eq(): void {
    parsePrecedence(Precedence.Equality + 1);
    emitByte(Op.Eq);
    lastType = {kind: Kind.Boolean};
}

function neq(): void {
    parsePrecedence(Precedence.Equality + 1);
    emitByte(Op.NEq);
    lastType = {kind: Kind.Boolean};
}

// Can only compare 2 numbers or 2 string for now.

function compare(): void {
    let operator = parser.previous.kind;
    let left = lastType.kind;
    if (left !== Kind.Number && left !== Kind.String)
        error("can only compare strings or numbers");

    parsePrecedence(Precedence.Comparison + 1);
    if (lastType.kind !== left)
        error("type not match");

    switch (operator) {
        case TokenT.Less:      emitByte(Op.LT); break;
        case TokenT.Greater:   emitByte(Op.GT); break;
        case TokenT.LessEq:    emitByte(Op.LEq); break;
        case TokenT.GreaterEq: emitByte(Op.GEq); break;
        default:               error("unhandled camparison op");
    }
    lastType = {kind: Kind.Boolean};
}

// Only for numbers.
// TODO: change lastType when implementing relation (<, >, ==).

function binary(): void {
    let operator = parser.previous.lexeme;
    if (lastType.kind !== Kind.Number) {
        error(`'${ operator }' only for numbers`);
    }

    let operatorType = parser.previous.kind;
    let rule = rules[operatorType];
    parsePrecedence(rule.precedence + 1);

    if (lastType.kind !== Kind.Number) {
        error(`'${ operator }' only for numbers`);
    }

    switch (operatorType) {
        case TokenT.Pipe:   emitByte(Op.IsDiv); lastType = booleanType; break;
        case TokenT.Plus:   emitByte(Op.Add); break;
        case TokenT.Minus:  emitByte(Op.Sub); break;
        case TokenT.Star:   emitByte(Op.Mul); break;
        case TokenT.Slash:  emitByte(Op.Div); break;
        default:            error("unhandled binary op");
    }
}

function binary_str(): void {
    let operator = parser.previous.lexeme;
    if (lastType.kind !== Kind.String) {
        error(`'${ operator }' only for strings`);
    }

    let operatorType = parser.previous.kind;
    let rule = rules[operatorType];
    parsePrecedence(rule.precedence + 1);

    if (lastType.kind !== Kind.String) {
        error(`'${ operator }' only for strings`);
    }

    emitByte(Op.AddStr);
}

//--------------------------------------------------------------------
// Parsing literal.

function parse_boolean(): void {
    if (parser.previous.kind === TokenT.True)
        emitConstant(new FGBoolean(true));
    else
        emitConstant(new FGBoolean(false));
    lastType = {kind: Kind.Boolean};
}

function parse_number(): void {
    let value = Number(parser.previous.lexeme);
    emitConstant(new FGNumber(value));
    lastType = numberType;
}

function parse_string(): void {
    emitConstant(new FGString(parser.previous.lexeme));
    lastType = {kind: Kind.String};
}

//--------------------------------------------------------------------

interface TempTypes {
    kind:     Kind;
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
    let name = parser.previous.lexeme;

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

    lastType = invalidType;
    canParseArgument = true;
    expression();

    emitByte(Op.SetLoc);
    current.locals[current.locals.length - 1].type = { kind: lastType.kind };
    lastType = invalidType;
}

function set_global(name: string): void {
    if (Object.hasOwn(nativeNames, name)
            || Object.hasOwn(userNames, name)
            || Object.hasOwn(tempNames, name)) {
        error(`${ name } already defined`);
    }

    let index = makeConstant(new FGString(name));
    lastType = invalidType;
    canParseArgument = true;
    expression();

    emitBytes(Op.Set, index);
    emitByte(lastType.kind);
    tempNames[name] = { kind: lastType.kind };
    lastType = invalidType;
}

function get_name(name: string): void {
    let arg = resolveLocal(current, name);
    if (arg != -1) {
        emitBytes(Op.GetLoc, arg);
        lastType = current.locals[arg].type;
    }
    else if (Object.hasOwn(nativeNames, name)) {
        if (nativeNames[name].kind === Kind.Callable)
            global_callable(name);
        else
            global_non_callable(nativeNames, name, true);
    }
    else if (Object.hasOwn(userNames, name)) {
        if (userNames[name].kind === Kind.Callable)
            global_callable(name);
        else
            global_non_callable(userNames, name, false);
    }
    else if (Object.hasOwn(tempNames, name)) {
        if (tempNames[name].kind === Kind.Callable)
            global_callable(name);
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

function global_callable(name_: string): void {
    if (!canParseArgument) {
        lastType = nativeNames[name_];
        return;
    }
    canParseArgument = match(TokenT.Dollar);

    let name    = nativeNames[name_];
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
            lastType = invalidType;
            expression();
            gotTypes.push(lastType.kind);
            if (!matchType(inputVersion[k], lastType.kind)) {
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
    emitBytes(Op.CallNat, index);
    emitByte(i);
    if (version[i].output === Kind.Nothing) {
        lastType = invalidType;
    } else {
        lastType = {kind: version[i].output as Kind};
    }
}

function global_non_callable(table: any, name: string, native: boolean): void {
    let index = makeConstant(new FGString(name));
    if (native)
        emitBytes(Op.GetNat, index);
    else
        emitBytes(Op.GetUsr, index);

    lastType = {kind: table[name].kind};
}

function add_local(name: string): void {
    let local: Local = { name, type: invalidType, depth: current.scopeDepth };
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
    if (lastType.kind !== Kind.Boolean) {
        error(`conditional expression must be boolean`);
    }

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

function emitLoop(loopStart: number): void {
    emitByte(Op.JmpBack);
    let offset = currentChunk().code.length - loopStart + 1;
    emitByte(-offset);
}

function parse_loop(): void {
    beginScope();

    lastType = invalidType;
    expression();
    if (lastType.kind !== Kind.Number) {
        error("start of range must be number");
    }
    let start = current.locals.length;
    let startRange: Local = { name: "_Start", type: numberType, depth: current.scopeDepth };
    current.locals.push(startRange);

    consume(TokenT.Comma, "expect ',' between start and end");

    lastType = invalidType;
    expression();
    if (lastType.kind !== Kind.Number) {
        error("end of range must be number");
    }
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

    consume(TokenT.RBracket, "expect ']' in range");
    consume(TokenT.Arrow, "expect '->' after range");


    if (!match(TokenT.Name)) {
        error_at_current("expect name for iterator");
    }

    let name = parser.previous.lexeme;
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
    lastType = invalidType;
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
    if (lastType.kind !== Kind.Boolean) {
        error("operands of '&&' must be boolean");
    }

    let endJump = emitJump(Op.JmpF);
    emitByte(Op.Pop);

    parsePrecedence(Precedence.And);
    if (lastType.kind !== Kind.Boolean) {
        error("operands of '&&' must be boolean");
    }

    patchJump(endJump);
}

function or_(): void {
    if (lastType.kind !== Kind.Boolean) {
        error("operands of '||' must be boolean");
    }

    let elseJump = emitJump(Op.JmpF);
    let endJump = emitJump(Op.Jmp);

    patchJump(elseJump);
    emitByte(Op.Pop);

    parsePrecedence(Precedence.Or);
    if (lastType.kind !== Kind.Boolean) {
        error("operands of '||' must be boolean");
    }

    patchJump(endJump);
}

function parsePrecedence(precedence: Precedence): void {
    // prev();
    // curr();
    advance();
    let prefixRule = rules[parser.previous.kind].prefix;
    if (prefixRule === null) {
        error("expect expression");
        return;
    }

    prefixRule();

    while (precedence <= rules[parser.current.kind].precedence) {
        advance();
        let infixRule = rules[parser.previous.kind].infix;
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
    console.log(TokenTName[parser.previous.kind]);
}
function curr() {
    console.log(TokenTName[parser.current.kind]);
}

function declaration(): void {
    statement();
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
    } else if (match(TokenT.Semicolon)) {
        // This is optional statement delimiter. Nothing to do.
    } else {
        error_at_current(`cannot start statement with ${ TokenTName[parser.current.kind] }`);
    }

    if (lastType !== invalidType) {
        error("forbidden expression statement");
    }
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
}

class CompileError extends Error {}

const compiler = {
    compile(source: string, chunk: Chunk): CompilerResult {
        scanner.init(source);
        let comp: Compiler = {locals: [], scopeDepth: 0};
        init_compiler(comp);

        compilingChunk = chunk;
        tempNames = {};
        parser.previous = invalidToken;
        parser.current = invalidToken;

        try {
            advance();
            while (!match(TokenT.EOF)) {
                declaration();
            }
            endCompiler();
            return { success: true };
        }
        catch(error: unknown) {
            if (error instanceof CompileError) {
                // console.log("catch CompileError");
                // console.log(error);
                return { success: false, message: error.message };
            } else {
                // console.log("catch Error");
                // console.log(error);
                return { success: false, message: (error as Error).message };
            }
        }
    }
};

export { compiler };
