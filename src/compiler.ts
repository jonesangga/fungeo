// @jonesangga, 12-04-2025, MIT License.

import { TokenT, TokenTName, type Token, scanner } from "./scanner.js"
import { Op, Chunk } from "./chunk.js"
import { Kind, KindName, FGBoolean, FGNumber, FGString, FGCallable, type Value } from "./value.js"
import { type Types, type Version, names } from "./names.js"

let invalidType: Types = { kind: Kind.Nothing };
let numberType: Types = { kind: Kind.Number };
let lastType: Types = invalidType;

// To distinguish function as argument vs function call.
let canParseArgument = false;

let canAssign = false;

const enum Precedence {
    None,
    Assignment, // =
    Term,       // + -
    Factor,     // * /
    Unary,      // ! -
    Call,       // . () _
    Primary
}

interface ParseRule {
    prefix: (() => void) | null;
    infix:  (() => void) | null;
    precedence: Precedence;
}

let rules: ParseRule[] = [];
rules[TokenT.Bang]      = {prefix: unary,           infix: null,    precedence: Precedence.None};
rules[TokenT.Colon]     = {prefix: null,            infix: null,    precedence: Precedence.None};
rules[TokenT.ColonEq]   = {prefix: null,            infix: null,    precedence: Precedence.None};
rules[TokenT.Comma]     = {prefix: null,            infix: null,    precedence: Precedence.None};
rules[TokenT.EOF]       = {prefix: null,            infix: null,    precedence: Precedence.None};
rules[TokenT.False]     = {prefix: parse_boolean,   infix: null,    precedence: Precedence.None};
// rules[TokenT.LBracket]    = {prefix: parse_list,  infix: indexlist,    precedence: Precedence.Call};
rules[TokenT.LParen]    = {prefix: grouping,        infix: null,    precedence: Precedence.None};
rules[TokenT.Minus]     = {prefix: unary,           infix: binary,  precedence: Precedence.Term};
rules[TokenT.Name]      = {prefix: parse_name,      infix: null,    precedence: Precedence.None};
rules[TokenT.Number]    = {prefix: parse_number,    infix: null,    precedence: Precedence.None};
rules[TokenT.Plus]      = {prefix: null,            infix: binary,  precedence: Precedence.Term};
rules[TokenT.RBracket]  = {prefix: null,            infix: null,    precedence: Precedence.None};
rules[TokenT.RParen]    = {prefix: null,            infix: null,    precedence: Precedence.None};
rules[TokenT.Semicolon] = {prefix: null,            infix: null,    precedence: Precedence.None};
rules[TokenT.Slash]     = {prefix: null,            infix: binary,  precedence: Precedence.Factor};
rules[TokenT.Star]      = {prefix: null,            infix: binary,  precedence: Precedence.Factor};
rules[TokenT.String]    = {prefix: parse_string,    infix: null,    precedence: Precedence.None};
rules[TokenT.True]      = {prefix: parse_boolean,   infix: null,    precedence: Precedence.None};

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

function unary(): void {
    let operatorType = parser.previous.kind;
    parsePrecedence(Precedence.Unary);

    switch (operatorType) {
        case TokenT.Bang:
            if (lastType.kind !== Kind.Boolean) {
                error("'!' only for boolean");
            }
            emitByte(Op.Not);
            break;

        case TokenT.Minus:
            if (lastType.kind !== Kind.Number) {
                error("'-' only for number");
            }
            emitByte(Op.Neg);
            break;

        default:
            error("unhandled unary op");
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

function parse_name(): void {
    let name = parser.previous.lexeme;

    if (Object.hasOwn(names, name)) {
        canAssign = false;
        if (check(TokenT.Eq))
            error(`${ name } already defined`);

        if (names[name].kind === Kind.Callable)
            parse_callable(name);
        else
            parse_non_callable(names, name);
    }
    else if (Object.hasOwn(tempNames, name)) {
        canAssign = false;
        if (check(TokenT.Eq))
            error(`${ name } already defined`);

        if (tempNames[name].kind === Kind.Callable)
            parse_callable(name);
        else
            parse_non_callable(tempNames, name);
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
    if (!canParseArgument) {
        lastType = names[name_];
        return;
    }
    canParseArgument = match(TokenT.Dollar);

    let name    = names[name_];
    let version = name.version as Version[];
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

    emitBytes(Op.Call, i);
    emitConstant(new FGCallable(name.call as (n: number) => void));
    if (version[i].output === Kind.Nothing) {
        lastType = invalidType;
    } else {
        lastType = {kind: version[i].output as Kind};
    }
}

function parse_non_callable(table: any, name: string): void {
    let index = makeConstant(new FGString(name));
    emitBytes(Op.Get, index);
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

function call(name: string): void {
    let constant = currentChunk().add_value(new FGString(name));

    let argCount = 0;
    do {
        expression();
        argCount++;
    } while (!match(TokenT.EOF));
    emitBytes(Op.Call, constant);
    emitByte(argCount);
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
