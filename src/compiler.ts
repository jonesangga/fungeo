// @jonesangga, 12-04-2025, MIT License.

import { TokenT, TokenTName, type Token, scanner } from "./scanner.js"
import { Op, Chunk } from "./chunk.js"
import { Kind, KindName, type Version, FGBoolean, FGNumber, FGString, FGCallable, type Value } from "./value.js"
import { type Types, nativeNames, userNames } from "./names.js"

let invalidType: Types = { kind: Kind.Nothing };
let numberType: Types = { kind: Kind.Number };
let lastType: Types = invalidType;

// To distinguish function as argument vs function call.
let canParseArgument = false;

let canAssign = false;

const enum Precedence {
    None = 100,
    Assignment = 200, // =
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
    [TokenT.Bang]      : {prefix: not,             infix: null,    precedence: Precedence.None},
    [TokenT.BangEq]    : {prefix: null,            infix: neq,     precedence: Precedence.Equality},
    [TokenT.Colon]     : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.ColonEq]   : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Comma]     : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Dollar]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.EOF]       : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Eq]        : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.EqEq]      : {prefix: null,            infix: eq,      precedence: Precedence.Equality},
    [TokenT.Error]     : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.False]     : {prefix: parse_boolean,   infix: null,    precedence: Precedence.None},
    [TokenT.Greater]   : {prefix: null,            infix: compare, precedence: Precedence.Comparison},
    [TokenT.GreaterEq] : {prefix: null,            infix: compare, precedence: Precedence.Comparison},
    [TokenT.LBracket]  : {prefix: grouping,        infix: null,    precedence: Precedence.None},
    [TokenT.Less]      : {prefix: null,            infix: compare, precedence: Precedence.Comparison},
    [TokenT.LessEq]    : {prefix: null,            infix: compare, precedence: Precedence.Comparison},
    [TokenT.LParen]    : {prefix: grouping,        infix: null,    precedence: Precedence.None},
    [TokenT.Minus]     : {prefix: negate,          infix: binary,  precedence: Precedence.Term},
    [TokenT.Name]      : {prefix: parse_name,      infix: null,    precedence: Precedence.None},
    [TokenT.Number]    : {prefix: parse_number,    infix: null,    precedence: Precedence.None},
    [TokenT.Plus]      : {prefix: null,            infix: binary,  precedence: Precedence.Term},
    [TokenT.PlusPlus]  : {prefix: null,            infix: binary_str,  precedence: Precedence.Term},
    [TokenT.RBracket]  : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.RParen]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Semicolon] : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Slash]     : {prefix: null,            infix: binary,  precedence: Precedence.Factor},
    [TokenT.Star]      : {prefix: null,            infix: binary,  precedence: Precedence.Factor},
    [TokenT.String]    : {prefix: parse_string,    infix: null,    precedence: Precedence.None},
    [TokenT.True]      : {prefix: parse_boolean,   infix: null,    precedence: Precedence.None},
}

let invalidToken = { kind: TokenT.EOF, line: -1, lexeme: "" };

let parser: { current: Token, previous: Token } = {
    current: invalidToken,
    previous: invalidToken,
};

let compilingChunk: Chunk;

function currentChunk(): Chunk {
    return compilingChunk;
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
        error("can only coompare strings or numbers");

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

// TODO: clean up this.
function parse_name(): void {
    let name = parser.previous.lexeme;

    if (Object.hasOwn(nativeNames, name)) {
        canAssign = false;
        if (check(TokenT.Eq))
            error(`${ name } already defined`);

        if (nativeNames[name].kind === Kind.Callable)
            parse_callable(name);
        else
            parse_non_callable(nativeNames, name, true);
    }
    else if (Object.hasOwn(userNames, name)) {
        canAssign = false;
        if (check(TokenT.Eq))
            error(`${ name } already defined`);

        if (userNames[name].kind === Kind.Callable)
            parse_callable(name);
        else
            parse_non_callable(userNames, name, false);
    }
    else if (Object.hasOwn(tempNames, name)) {
        canAssign = false;
        if (check(TokenT.Eq))
            error(`${ name } already defined`);

        if (tempNames[name].kind === Kind.Callable)
            parse_callable(name);
        else
            parse_non_callable(tempNames, name, false);
    }
    else {
        if (!canAssign) {
            error(`undefined name ${name}`);
        } else {
            canAssign = false;
            parse_definition(name);
        }
    }
}

function matchType(expected: (Set<number> | Kind), actual: Kind): boolean {
    console.log(expected, actual);
    if (expected === Kind.Any) {
        console.log("type any");
        return true;
    } else if (typeof expected === "number") {
        console.log("type number");
        return actual === expected;
    } else {
        console.log("type Set");
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

function parse_callable(name_: string): void {
    console.log("in parse_callable()");
    if (!canParseArgument) {
        lastType = nativeNames[name_];
        return;
    }
    canParseArgument = match(TokenT.Dollar);
    console.log("can parse argument");

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
                console.log(`inputVersion[${k}] is ${inputVersion[k]}`);
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

function parse_non_callable(table: any, name: string, native: boolean): void {
    let index = makeConstant(new FGString(name));
    if (native)
        emitBytes(Op.GetNat, index);
    else
        emitBytes(Op.GetUsr, index);
    // if (table[name].kind === Kind.List) {
        // lastType = {kind: table[name].kind, listKind: table[name].listKind};
    // } else {
        lastType = {kind: table[name].kind};
    // }
    console.log("in parse_non_callable() lastType = ", lastType);
}

function parse_definition(name: string): void {
    let index = makeConstant(new FGString(name));
    consume(TokenT.Eq, "expect '=' after variable declaration");

    lastType = invalidType;
    canParseArgument = true;
    expression();

    // if (isGeoKind(lastType.kind)) {
        // emitBytes(Op.AssignGObj, index);
    // } else {
        emitBytes(Op.Set, index);
    // }
    emitByte(lastType.kind);
    tempNames[name] = {kind: lastType.kind};
    lastType = invalidType;
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
    } else if (match(TokenT.Semicolon)) {
        // This is optional statement delimiter. Nothing to do.
    } else {
        error_at_current(`cannot start statement with ${ TokenTName[parser.current.kind] }`);
    }

    if (lastType !== invalidType) {
        error("forbidden expression statement");
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
