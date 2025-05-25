// @jonesangga, 12-04-2025, MIT License.

import { TokenT, TokenTName, type Token, scanner } from "./scanner.js"
import { Op, Chunk } from "./chunk.js"
import { CallT, Kind, KindName, FGBoolean, FGNumber, FGString, FGCallNative, FGCallUser, type Value } from "./value.js"
import { type Info, nativeNames } from "./names.js"
import { userNames } from "./vm.js"

let numberType: Info = { kind: Kind.Number };

let booleanT = [Kind.Boolean];
let numberT  = [Kind.Number];
let stringT  = [Kind.String];
let nothingT = [Kind.Nothing];
let lastT: TypeCheck = nothingT;

type TypeCheck = number[];

function assertT(actual: TypeCheck, expected: TypeCheck, msg: string): void {
    if (actual.length === expected.length) {
        for (let i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                error(msg);
            }
        }
    } else {
        error(msg);
    }
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
    Term = 300,       // + - |
    Factor = 400,     // * /
    Unary = 500,      // ! -
    Call = 600,       // . ( _
    Primary = 700,
}

interface ParseRule {
    prefix: (() => void) | null;
    infix:  (() => void) | null;
    precedence: Precedence;
}

const rules: { [key in TokenT]: ParseRule } = {
    [TokenT.Amp]       : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.AmpAmp]    : {prefix: null,            infix: and,     precedence: Precedence.And},
    [TokenT.Arrow]     : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Bang]      : {prefix: not,             infix: null,    precedence: Precedence.None},
    [TokenT.BangEq]    : {prefix: null,            infix: neq,     precedence: Precedence.Equality},
    [TokenT.BoolT]     : {prefix: null,            infix: null,    precedence: Precedence.None},
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
    [TokenT.Greater]   : {prefix: null,            infix: boolean_compare, precedence: Precedence.Comparison},
    [TokenT.GreaterEq] : {prefix: null,            infix: boolean_compare, precedence: Precedence.Comparison},
    [TokenT.If]        : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Ifx]       : {prefix: parse_ifx,       infix: null,    precedence: Precedence.None},
    [TokenT.LBrace]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.LBracket]  : {prefix: parse_list,      infix: null,    precedence: Precedence.None},
    [TokenT.Less]      : {prefix: null,            infix: boolean_compare, precedence: Precedence.Comparison},
    [TokenT.LessEq]    : {prefix: null,            infix: boolean_compare, precedence: Precedence.Comparison},
    [TokenT.LParen]    : {prefix: grouping,        infix: null,    precedence: Precedence.None},
    [TokenT.Minus]     : {prefix: negate,          infix: numeric_binary,  precedence: Precedence.Term},
    [TokenT.Name]      : {prefix: parse_name,      infix: null,    precedence: Precedence.None},
    [TokenT.Number]    : {prefix: parse_number,    infix: null,    precedence: Precedence.None},
    [TokenT.NumT]      : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Pipe]      : {prefix: null,            infix: boolean_isdiv,  precedence: Precedence.Term},
    [TokenT.PipePipe]  : {prefix: null,            infix: or,      precedence: Precedence.Or},
    [TokenT.Plus]      : {prefix: null,            infix: numeric_binary,  precedence: Precedence.Term},
    [TokenT.PlusPlus]  : {prefix: null,            infix: concat,  precedence: Precedence.Term},
    [TokenT.Proc]      : {prefix: null,            infix: null,    precedence: Precedence.Term},
    [TokenT.RBrace]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.RBracket]  : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Return]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.RParen]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Semicolon] : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Slash]     : {prefix: null,            infix: numeric_binary,  precedence: Precedence.Factor},
    [TokenT.Star]      : {prefix: null,            infix: numeric_binary,  precedence: Precedence.Factor},
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

// TODO: what about Procedure?
const enum FnT {
    Function,
    Procedure,
    Top,
}

interface Compiler {
    enclosing:  Compiler | null;
    kind:       FnT,
    fn:         FGCallUser,
    locals:     Local[];
    scopeDepth: number;
}

let current: Compiler;

let invalidTok = { kind: TokenT.EOF, line: -1, lexeme: "" };
let currTok = invalidTok;
let prevTok = invalidTok;

function currentChunk(): Chunk {
    return current.fn.chunk;
}

function begin_compiler(kind: FnT, name: string): void {
    let compiler: Compiler = {
        enclosing: current,
        fn: new FGCallUser(
            name,
            CallT.Function,
            [{
                input: [],
                output: Kind.Nothing
            }],
            new Chunk(name),
        ),
        kind: kind,
        locals: [],
        scopeDepth: 0,
    };
    current = compiler;
}

function endCompiler(): FGCallUser {
    emitReturn();
    let fn = current.fn;
    console.log( currentChunk().disassemble() );
    current = current.enclosing as Compiler;
    return fn;
}

//--------------------------------------------------------------------
// Compilation error functions.

// Error when dealing with current token.
function error_at_current(message: string): never {
    error_at(currTok, message);
}

// Error when dealing with previous token.
function error(message: string): never {
    error_at(prevTok, message);
}

// The actual error handling function. It will throw error and stop the compilation.
function error_at(token: Token, message: string): never {
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
// Parsing unary operators.

// TODO: Make () valid. It is for calling proc that doesn't have argument.
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

//--------------------------------------------------------------------
// Parsing binary operators.

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

function and(): void {
    assertT(lastT, booleanT, "operands of '&&' must be booleans");

    let endJump = emitJump(Op.JmpF);
    emitByte(Op.Pop);

    parsePrecedence(Precedence.And);
    assertT(lastT, booleanT, "operands of '&&' must be booleans");

    patchJump(endJump);
}

function or(): void {
    assertT(lastT, booleanT, "operands of '||' must be booleans");

    let elseJump = emitJump(Op.JmpF);
    let endJump = emitJump(Op.Jmp);

    patchJump(elseJump);
    emitByte(Op.Pop);

    parsePrecedence(Precedence.Or);
    assertT(lastT, booleanT, "operands of '||' must be booleans");

    patchJump(endJump);
}

function boolean_isdiv(): void {
    assertT(lastT, numberT, `'|' only for numbers`);
    parsePrecedence(Precedence.Term + 1);
    assertT(lastT, numberT, `'|' only for numbers`);
    emitByte(Op.IsDiv);
    lastT = booleanT;
}

// Can only compare 2 numbers or 2 string for now.
function boolean_compare(): void {
    let opType = prevTok.kind;
    let operator = prevTok.lexeme;
    let left = lastT[0];
    if (left !== Kind.Number && left !== Kind.String)
        error("can only compare strings and numbers");

    parsePrecedence(Precedence.Comparison + 1);
    if (lastT[0] !== left)
        error("operands type for comparison didn't match");

    switch (opType) {
        case TokenT.Greater:   emitByte(Op.GT); break;
        case TokenT.GreaterEq: emitByte(Op.GEq); break;
        case TokenT.Less:      emitByte(Op.LT); break;
        case TokenT.LessEq:    emitByte(Op.LEq); break;
        default:               error(`unhandled operator ${operator}`);
    }
    lastT = booleanT;
}

// The result of these operators is of type Num.
function numeric_binary(): void {
    let operator = prevTok.lexeme;
    assertT(lastT, numberT, `'${ operator }' only for numbers`);

    let opType = prevTok.kind;
    parsePrecedence(rules[opType].precedence + 1);
    assertT(lastT, numberT, `'${ operator }' only for numbers`);

    switch (opType) {
        case TokenT.Minus:  emitByte(Op.Sub); break;
        case TokenT.Plus:   emitByte(Op.Add); break;
        case TokenT.Slash:  emitByte(Op.Div); break;
        case TokenT.Star:   emitByte(Op.Mul); break;
        default:            error(`unhandled operator ${ operator }`);
    }
}
// function concat(): void {
    // let operator = prevTok.lexeme;
    // assertT(lastT, stringT, `'${ operator }' only for strings`);

    // let opType = prevTok.kind;
    // parsePrecedence(rules[opType].precedence + 1);
    // assertT(lastT, stringT, `'${ operator }' only for strings`);

    // emitByte(Op.AddStr);
// }

// TODO: Separate this. User <> for string, ++ for list.
function concat(): void {
    let left = lastT[0];

    if (left === Kind.String) {
        parsePrecedence(Precedence.Term + 1);
        if (lastT[0] !== Kind.String)
            error("operands type for '++' didn't match");
        emitByte(Op.AddStr);
    }
    else if (left === Kind.List) {
        let elT = lastT[2] as Kind;
        parsePrecedence(Precedence.Term + 1);
        console.log(elT, lastT);
        if (lastT[0] !== Kind.List
            || lastT[2] !== elT)
            error("operands type for '++' didn't match");
        emitBytes(Op.AddList, elT);
    }
    else {
        error("'++' only for strings and lists");
    }
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

function parse_list(): void {
    let length = 0;
    let listT = nothingT;

    if (!check(TokenT.RBracket)) {
        canParseArgument = true;
        lastT = nothingT;
        expression();
        listT = lastT;
        length++;
        while (match(TokenT.Comma)) {
            canParseArgument = true;
            lastT = nothingT;
            expression();
            assertT(lastT, listT, `in list[]: expect argument of type ${KindName[listT[0]]}, got ${KindName[lastT[0] as Kind]}`);
            length++;
        }
    }
    consume(TokenT.RBracket, "expect ']' after list elements");
    emitBytes(Op.List, length);
    emitByte(listT[0]);
    lastT = [Kind.List, length, listT[0]];
}

function parse_return(): void {
    console.log("in parse_return()");
    expression();
    emitByte(Op.Ret);
    lastT = nothingT;
}

//--------------------------------------------------------------------

interface TempTypes {
    kind:    Kind;
    value?:  Value,
    elKind?: Kind,
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
    current.locals[current.locals.length - 1].type = { kind: lastT[0] };
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
    emitByte(lastT[0]);
    if (lastT[0] === Kind.List)
        tempNames[name] = { kind: lastT[0], elKind: lastT[2] };
    else
        tempNames[name] = { kind: lastT[0] };
    lastT = nothingT;
}

// TODO: refactor this!
function get_name(name: string): void {
    let arg = resolveLocal(current, name);
    if (arg != -1) {
        emitBytes(Op.GetLoc, arg);
        lastT = [current.locals[arg].type.kind];
    }
    else if (Object.hasOwn(nativeNames, name)) {
        get_global(nativeNames, name, true);
    }
    else if (Object.hasOwn(userNames, name)) {
        get_global(userNames, name, false);
    }
    else if (Object.hasOwn(tempNames, name)) {
        get_global(tempNames, name, false);
    }
    else {
        error(`undefined name ${name}`);
    }
}

// TODO: refactor this!
function get_global(table: any, name: string, isNative: boolean): void {
    switch (table[name].kind) {
        case Kind.CallNative:
            global_callable(name, table, isNative);
            break;
        case Kind.CallUser:
            global_callable(name, table, isNative);
            break;
        default:
            global_non_callable(table, name, isNative);
    }
}

// This also work for procedure that doesn't have parameter.
// TODO: refactor this!
//       check canParseArgument in the caller.

function global_callable(name_: string, table: any, native: boolean): void {
    if (!canParseArgument) {
        global_non_callable(table, name_, native);
        return;
    }
    canParseArgument = match(TokenT.Dollar);

    let name    = table[name_];
    emitConstant(name.value as FGCallNative);

    let version = (name.value as FGCallNative).version;
    let inputVersion: (Kind[] | Kind)[] = [];
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
            if (canParseArgument)
                expression();
            else
                parsePrecedence(Precedence.Call);
            gotTypes.push(lastT[0]);
            if (!matchType(inputVersion[k], lastT[0])) {
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
            error(`in ${name_}: expect arg ${j} of class [${setToKinds(inputVersion[j] as Kind[])}], got ${KindName[gotTypes[j]]}`);
    }

    let arity = version[i].input.length;
    if (native)
        emitBytes(Op.CallNat, arity);
    else
        emitBytes(Op.CallUsr, arity);
    emitByte(i);

    if (version[i].output === Kind.Nothing)
        lastT = nothingT;
    else
        lastT = [version[i].output as Kind];
}

function global_non_callable(table: any, name: string, native: boolean): void {
    console.log("in global_non_callable()");
    let index = makeConstant(new FGString(name));
    if (native)
        emitBytes(Op.GetNat, index);
    else
        emitBytes(Op.GetUsr, index);

    console.log(table[name]);
    if (table[name].kind === Kind.List)
        lastT = [Kind.List, table[name].length, table[name].elKind];
    else
        lastT = [table[name].kind];
}

function parse_type(): TypeCheck {
    advance();
    switch (prevTok.kind) {
        case TokenT.BoolT:
            return booleanT;
        case TokenT.NumT:
            return numberT;
        case TokenT.StrT:
            return stringT;
        default:
            error("expect parameter type");
            // return nothingT;
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

    current.locals[current.locals.length - 1].type = { kind: t[0] };
    current.fn.version[0].input.push(t[0]);
    lastT = nothingT;
}

function fn(): void {
    consume(TokenT.Name, "expect function name");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));

    begin_compiler(FnT.Function, name);
    beginScope();

    do {
        parse_params();
    } while (match(TokenT.Comma));

    // return type
    consume(TokenT.Arrow, "expect `->` after list of params");
    let t = parse_type();

    current.fn.version[0].output = t[0];
    tempNames[name] = { kind: Kind.CallUser, value: current.fn };

    consume(TokenT.Eq, "expect '=' before fn body");

    expression();
    emitBytes(Op.Ret, 1);
    assertT(lastT, t, "return type not match");

    let fn = endCompiler();
    emitConstant(fn);
    emitBytes(Op.Set, index);
    emitByte(Kind.CallUser);
}

function proc(): void {
    consume(TokenT.Name, "expect procedure name");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));

    begin_compiler(FnT.Function, name);
    beginScope();

    do {
        parse_params();
    } while (match(TokenT.Comma));

    current.fn.version[0].output = Kind.Nothing;
    tempNames[name] = { kind: Kind.CallUser, value: current.fn };

    consume(TokenT.LBrace, "expect '{' before proc body");

    procBody();
    emitBytes(Op.Ret, 0);

    consume(TokenT.RBrace, "expect '}' after proc body");

    let fn = endCompiler();
    emitConstant(fn);
    emitBytes(Op.Set, index);
    emitByte(Kind.CallUser);
}

function procBody(): void {
    while (!check(TokenT.RBrace) && !check(TokenT.EOF)) {
        statement();
    }
}

function matchType(expected: (Kind[] | Kind), actual: Kind): boolean {
    if (expected === Kind.Any) {
        return true;
    } else if (typeof expected === "number") {
        return actual === expected;
    } else {
        return expected.includes(actual);
    }
}

function setToKinds(set_: Kind[]): string[] {
    let s = [];
    for (let kind of set_) {
        s.push(KindName[kind as Kind]);
    }
    return s;
}

function add_local(name: string): void {
    let local: Local = { name, type: {kind: Kind.Nothing}, depth: current.scopeDepth };
    current.locals.push(local);
}

// Return the index of jump argument. The argument will be overwritten in patchJump().
//
function emitJump(instruction: number): number {
    emitByte(instruction);
    emitByte(-1);            // Dummy number. Will be overwritten in patchJump().
    return currentChunk().code.length - 1;
}

function patchJump(offset: number): void {
    // -1 to adjust for the bytecode for the jump offset itself.
    let jump = currentChunk().code.length - offset - 1;
    currentChunk().code[offset] = jump;
}

//--------------------------------------------------------------------
// Parsing control flow.

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
    let offset = currentChunk().code.length - loopStart + 1;    // +1 for for the Op.JmpBack argument.
    emitByte(-offset);
}

function parse_loop(): void {
    beginScope();
    let openLeft = prevTok.kind === TokenT.LParen;

    expression();
    assertT(lastT, numberT, "start of range must be numeric");
    let start = current.locals.length;
    current.locals.push({ name: "_Start", type: numberType, depth: current.scopeDepth });

    consume(TokenT.Comma, "expect ',' between start and end of range");

    expression();
    assertT(lastT, numberT, "end of range must be numeric");
    current.locals.push({ name: "_End", type: numberType, depth: current.scopeDepth });

    // Parse optional step.
    if (match(TokenT.Comma)) {
        expression();
        assertT(lastT, numberT, "step of range must be numeric");
    } else {
        // Manually add step. Default is 1. Even when the range is decreasing.
        emitConstant(new FGNumber(1));
    }
    current.locals.push({ name: "_Step", type: numberType, depth: current.scopeDepth });

    let openRight: boolean;
    if (match(TokenT.RParen)) {
        openRight = true;
    } else {
        openRight = false;
        consume(TokenT.RBracket, "expect ']' in range");
    }

    if (!match(TokenT.Name))
        error_at_current("expect name for iterator");
    let name = prevTok.lexeme;
    // No need to check conflicting name because it is the first name in this scope.
    current.locals[start].name = name;  // Patch the _Start name.
    emitByte(Op.SetLoc);

    emitByte(Op.Loop)

    let openLeftJump = openLeft ? emitJump(Op.Jmp) : -1;
    let loopStart = currentChunk().code.length;

    if (openRight)
        emitBytes(Op.CkExc, start);
    else
        emitBytes(Op.CkInc, start);

    let exitJump = emitJump(Op.JmpF);
    emitByte(Op.Pop);                   // Discard the result of Op.Cond.

    // Parse the body.
    if (match(TokenT.LBrace)) {
        block();
        // Pop locals not related to range.
        while (current.locals.length > start + 3) {
            emitByte(Op.Pop);
            current.locals.pop();
        }
    } else {
        statement();
    }

    if (openLeftJump !== -1)
        patchJump(openLeftJump);

    // Increment the iterator.
    emitBytes(Op.Inc, start);
    emitLoop(loopStart);

    patchJump(exitJump);
    emitByte(Op.Pop);   // For false.
    endScope();         // For local name end range.
    lastT = nothingT;
}

function parsePrecedence(precedence: Precedence): void {
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

// TODO: change error message in else to output types in FG.
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

    assertT(lastT, nothingT, "expression statement is not supported");
}

function beginScope(): void {
    current.scopeDepth++;
}

// The '{' must be already consumed.
function block(): void {
    while (!check(TokenT.RBrace) && !check(TokenT.EOF))
        declaration();
    consume(TokenT.RBrace, "expect '}' at the end of block");
}

function endScope(): void {
    current.scopeDepth--;
    while (current.locals.length > 0
            && current.locals[current.locals.length - 1].depth > current.scopeDepth) {
        emitByte(Op.Pop);
        current.locals.pop();
    }
}

class CompileError extends Error {}

type Result<T, E = Error> =
    | { ok: true, value: T }
    | { ok: false, error: E };

export const compiler = {
    compile(source: string): Result<FGCallUser, Error> {
        tempNames = {};         // Reset temporary name table.
        prevTok = invalidTok;
        currTok = invalidTok;
        lastT = nothingT;       // Reset last type.

        scanner.init(source);
        begin_compiler(FnT.Top, "TOP");

        try {
            advance();
            while (!match(TokenT.EOF))
                declaration();
            return { ok: true, value: endCompiler() };
        }
        catch(error: unknown) {
            if (error instanceof Error) return { ok: false, error };
            return { ok: false, error: new Error("unknown error") };
        }
    }
};
