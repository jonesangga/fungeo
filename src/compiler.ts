// @jonesangga, 12-04-2025, MIT License.

import { TokenT, type Token, scanner } from "./scanner.js"
import { Op, Chunk } from "./chunk.js"
import { Kind, KindName, FGNumber, FGString, FGCallable, type Value } from "./value.js"
import { type Types, type Version, names } from "./names.js"

let source = "";
let invalidType: Types = {kind: Kind.Nothing};
let numberType: Types = {kind: Kind.Number};
let lastType: Types = invalidType;
let canParseArgument = false as Boolean;
let canAssign = false as Boolean;

const enum Precedence {
    None,
    Assignment, // =
    Term,        // + -
    Factor,      // * /
    Unary,       // ! -
    Call,        // . () _
    PREC_PRIMARY
}

interface ParseRule {
    prefix: (() => void) | null;
    infix:  (() => void) | null;
    precedence: Precedence;
}

let parser: { current: Token, previous: Token } = {
    current:  {kind: TokenT.EOF, start: 0, end: 0, line: 0},
    previous: {kind: TokenT.EOF, start: 0, end: 0, line: 0},
};

let compilingChunk: Chunk;

function currentChunk(): Chunk {
    return compilingChunk;
}


function emitReturn(): void {
    emitByte(Op.Return);
}

function endCompiler(): void {
    emitReturn();
    // disassembleChunk(currentChunk(), "code");
}

function errorAtCurrent(message: string): void {
    errorAt(parser.current, message);
}

function error(message: string): void {
    errorAt(parser.previous, message);
}

function errorAt(token: Token, message: string): void {
    let result = "";
    result += `[line ${ token.line }] Error`;

    if (token.kind === TokenT.EOF) {
        result += " at end";
    } else if (token.kind === TokenT.Error) {
        // Nothing.
    } else {
        result += ` at '${ source.slice(token.start, token.end)  }'`;
    }

    result += `: ${ message }\n`;
    throw new CompileError(message);
}

function consume(kind: TokenT, message: string): void {
    if (parser.current.kind === kind) {
        advance();
        return;
    }

    errorAtCurrent(message);
}

function check(kind: TokenT): boolean {
    return parser.current.kind === kind;
}

function match(kind: TokenT): boolean {
    if (!check(kind)) return false;
    advance();
    return true;
}

function advance(): void {
    parser.previous = parser.current;

    for (;;) {
        parser.current = scanner.next();
        if (parser.current.kind !== TokenT.Error)
            break;

        errorAtCurrent(parser.current.errorMessage as string);
    }
}

function emitByte(byte: number): void {
    // writeChunk(currentChunk(), byte, parser.previous.line);
    currentChunk().write(byte, parser.previous.line);
}

function emitBytes(byte1: number, byte2: number): void {
    emitByte(byte1);
    emitByte(byte2);
}

function makeConstant(value: Value) {
    let constant = currentChunk().add_constant(value);
    return constant;
}

function emitConstant(value: Value): void {
    emitBytes(Op.Constant, makeConstant(value));
}

function grouping(): void {
    canParseArgument = true;
    expression();
    consume(TokenT.RParen, "Expect ')' after expression.");
}

function binary(): void {
    let operatorType = parser.previous.kind;
    let rule = getRule(operatorType);
    parsePrecedence(rule.precedence + 1);

    switch (operatorType) {
        case TokenT.Plus:          emitByte(Op.Add); break;
        case TokenT.Minus:         emitByte(Op.Sub); break;
        case TokenT.Star:          emitByte(Op.Mul); break;
        case TokenT.Slash:         emitByte(Op.Div); break;
        default: return; // Unreachable.
    }
}

function literal(): void {
    switch (parser.previous.kind) {
        case TokenT.False:   emitByte(Op.False); break;
        case TokenT.True:    emitByte(Op.True); break;
        default: return; // Unreachable.
    }
}

function parse_number(): void {
    let value = Number(source.slice(parser.previous.start, parser.previous.end));
    emitConstant(new FGNumber(value));
    lastType = numberType;
}

function parsestring(): void {
    emitConstant(new FGString(source.slice(parser.previous.start + 1,
                                              parser.previous.end - 1)));
    lastType = {kind: Kind.String};
}

interface TempTypes {
    kind:     Kind;
}

interface TempNames {
    [name: string]: TempTypes;
}

let tempNames: TempNames = {
};

function parse_name(): void {
    let name = source.slice(parser.previous.start, parser.previous.end);

    if (Object.hasOwn(names, name)) {
        canAssign = false;
        if (check(TokenT.Eq)) {
            error(`Use := to reassign`);
        }
        if (check(TokenT.ColonEq)) {
            error(`:= is coming soon`);
        }

        if (names[name].kind === Kind.Callable) {
            parse_callable(name);
        } else {
            parse_non_callable(names, name);
        }
    }
    else if (Object.hasOwn(tempNames, name)) {
        canAssign = false;
        if (check(TokenT.Eq)) {
            error(`Use := to reassign`);
        }
        if (check(TokenT.ColonEq)) {
            error(`:= is coming soon`);
            // parse_reassignment(name);
        }

        if (tempNames[name].kind === Kind.Callable) {
            parse_callable(name);
        } else {
            parse_non_callable(tempNames, name);
        }
    }
    else {
        if (!canAssign) {
            error(`undefined variable ${name}`);
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
    consume(TokenT.Eq, "Expect '=' after variable declaration");

    lastType = invalidType;
    canParseArgument = true;
    expression();

    // if (isGeoKind(lastType.kind)) {
        // emitBytes(Op.AssignGObj, index);
    // } else {
        emitBytes(Op.Assign, index);
    // }
    emitByte(lastType.kind);
    tempNames[name] = {kind: lastType.kind};
    lastType = invalidType;
}

function parse_reassignment(name: string): void {
    let index = makeConstant(new FGString(name));

    lastType = invalidType;
    canParseArgument = true;
    expression();

    // if (isGeoKind(lastType.kind)) {
        // emitBytes(Op.AssignGObj, index);
    // } else {
        emitBytes(Op.Assign, index);
    // }
    emitByte(lastType.kind);
}

function unary(): void {
    let operatorType = parser.previous.kind;

    // Compile the operand.
    parsePrecedence(Precedence.Unary);

    // Emit the operator instruction.
    switch (operatorType) {
        case TokenT.Bang:    emitByte(Op.Not);    break;
        case TokenT.Minus:   emitByte(Op.Negate); break;
        default: return; // Unreachable.
    }
}

function parsePrecedence(precedence: Precedence): void {
    // prev();
    // curr();
    advance();
    let prefixRule = getRule(parser.previous.kind).prefix;
    if (prefixRule === null) {
        error("Expect expression.");
        return;
    }

    prefixRule();

    while (precedence <= getRule(parser.current.kind).precedence) {
        console.log("infix");
        advance();
        let infixRule = getRule(parser.previous.kind).infix;
        if (infixRule === null) {
            error("Expect infix operator.");
            return;
        }
        infixRule();
    }
}

function expression(): void {
    parsePrecedence(Precedence.Assignment);
}

function identifierConstant(name: Token): number {
    return makeConstant(new FGString(source.slice(name.start, name.end)));
}

function call(name: string): void {
    // let constant = addConstant(currentChunk(), newString(name));
    let constant = currentChunk().add_constant(new FGString(name));

    let argCount = 0;
    do {
        expression();
        argCount++;
    } while (!match(TokenT.EOF));
    emitBytes(Op.Call, constant);
    emitByte(argCount);
}

// The string is at parser.current.
function parse_string(): void {
    if (!match(TokenT.String)) {
        errorAtCurrent("Expect string for color");
        return;
    }
    let name = source.slice(parser.previous.start + 1,
                                    parser.previous.end - 1);
    console.log(name);
    let index = makeConstant(new FGString(name));
    emitBytes(Op.Constant, index);
}

function prev() {
    console.log(parser.previous.kind);
}
function curr() {
    console.log(parser.current.kind);
}

interface CompilerResult {
    status: boolean;
    message?: string;
}

class CompileError extends Error {}

let rules: ParseRule[] = [];
rules[TokenT.LParen]      = {prefix: grouping,    infix: null,    precedence: Precedence.None};
rules[TokenT.RParen]     = {prefix: null,        infix: null,    precedence: Precedence.None};
// rules[TokenT.LBracket]    = {prefix: parse_list,  infix: indexlist,    precedence: Precedence.Call};
rules[TokenT.RBracket]   = {prefix: null,        infix: null,    precedence: Precedence.None};
rules[TokenT.Comma]          = {prefix: null,        infix: null,    precedence: Precedence.None};
rules[TokenT.ColonEq]     = {prefix: null,        infix: null,    precedence: Precedence.None};
rules[TokenT.Colon]          = {prefix: null,        infix: null,    precedence: Precedence.None};
rules[TokenT.Semicolon]      = {prefix: null,        infix: null,    precedence: Precedence.None};
rules[TokenT.EOF]            = {prefix: null,        infix: null,    precedence: Precedence.None};
rules[TokenT.Number]         = {prefix: parse_number,     infix: null,    precedence: Precedence.None};
rules[TokenT.Plus]           = {prefix: null,        infix: binary,  precedence: Precedence.Term};
rules[TokenT.Minus]          = {prefix: unary,       infix: binary,  precedence: Precedence.Term};
rules[TokenT.Star]           = {prefix: null,        infix: binary,  precedence: Precedence.Factor};
rules[TokenT.Slash]          = {prefix: null,        infix: binary,  precedence: Precedence.Factor};
rules[TokenT.False]          = {prefix: literal,     infix: null,    precedence: Precedence.None};
rules[TokenT.True]           = {prefix: literal,     infix: null,    precedence: Precedence.None};
rules[TokenT.Bang]           = {prefix: unary,       infix: null,    precedence: Precedence.None};
rules[TokenT.String]         = {prefix: parsestring, infix: null,    precedence: Precedence.None};
rules[TokenT.Name]           = {prefix: parse_name,  infix: null,    precedence: Precedence.None};

function getRule(kind: TokenT): ParseRule {
    return rules[kind];
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
        error(`after declaration -> statement: no grammar for ${parser.current.kind}`);
    }

    if (lastType !== invalidType) {
        error("Doesn't support expression statement");
    }
}

const compiler = {
    compile(source_: string, chunk: Chunk): CompilerResult {
        source = source_;
        scanner.init(source_);
        compilingChunk = chunk;
        tempNames = {};

        advance();

        try {
            while (!match(TokenT.EOF)) {
                declaration();
            }
            endCompiler();
            return {status: true};
        }
        catch(error: unknown) {
            if (error instanceof CompileError) {
                console.log("catch CompileError");
                console.log(error);
                return {status: false, message: (error as CompileError).message};
            } else {
                console.log("catch Error");
                console.log(error);
                return {status: false, message: (error as Error).message};
            }
        }
    }
};

export { compiler };
