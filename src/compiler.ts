// @jonesangga, 12-04-2025, MIT License.

import { TokenT, TokenTName, type Token, scanner } from "./scanner.js"
import { Op, Chunk } from "./chunk.js"
import { FGCurry, CallT, Kind, KindName, FGBoolean, FGNumber, FGString, FGCallNative, FGCallUser, FGType, type Value } from "./value.js"
import { Method, nativeNames } from "./names.js"
import { userNames } from "./vm.js"
import { type Type, NeverT, NumberT, StringT, ListT, TupleT, neverT, circleT, numberT, stringT, booleanT, callUserT,
         CallNativeT, CallUserT, nothingT, canvasT, replT, pictureT, callNativeT } from "./type.js"

// For quick debugging.
let $ = console.log;
// $ = () => {};

let lastT = neverT;

// Needed to check procedure return type.
let returnT = neverT;

function assertT(actual: Type, expected: Type, msg: string): void {
    if (!actual.equal(expected))
        error(msg);
}

// To distinguish function as argument vs function call.
let canParseArgument = false;

// To forbid bare block.
let canParseBlock = false;

// To forbid assignment in expression.
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
    [TokenT.Callable]  : {prefix: parse_callable,  infix: null,    precedence: Precedence.None},
    [TokenT.CircleT]   : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Colon]     : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.ColonEq]   : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Comma]     : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.DivBy]     : {prefix: null,            infix: boolean_isdiv,  precedence: Precedence.Term},
    [TokenT.Dollar]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Dot]       : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Else]      : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.EOF]       : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Eq]        : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.EqEq]      : {prefix: null,            infix: eq,      precedence: Precedence.Equality},
    [TokenT.Error]     : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.False]     : {prefix: parse_boolean,   infix: null,    precedence: Precedence.None},
    [TokenT.Fn]        : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Global]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Greater]   : {prefix: null,            infix: boolean_compare, precedence: Precedence.Comparison},
    [TokenT.GreaterEq] : {prefix: null,            infix: boolean_compare, precedence: Precedence.Comparison},
    [TokenT.Hash]      : {prefix: length_list,     infix: null,    precedence: Precedence.None},
    [TokenT.If]        : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Ifx]       : {prefix: parse_ifx,       infix: null,    precedence: Precedence.None},
    [TokenT.LBrace]    : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.LBracket]  : {prefix: parse_list,      infix: index_list,    precedence: Precedence.Call},
    [TokenT.Less]      : {prefix: null,            infix: boolean_compare, precedence: Precedence.Comparison},
    [TokenT.LessEq]    : {prefix: null,            infix: boolean_compare, precedence: Precedence.Comparison},
    [TokenT.LParen]    : {prefix: grouping,        infix: null,    precedence: Precedence.None},
    [TokenT.LR]        : {prefix: null,            infix: concat_str,    precedence: Precedence.Term},
    [TokenT.Let]       : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Mut]       : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Minus]     : {prefix: negate,          infix: numeric_binary,  precedence: Precedence.Term},
    [TokenT.NCallable] : {prefix: parse_non_callable,      infix: null,    precedence: Precedence.None},
    [TokenT.Nonlocal]  : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Number]    : {prefix: parse_number,    infix: null,    precedence: Precedence.None},
    [TokenT.NumT]      : {prefix: null,            infix: null,    precedence: Precedence.None},
    [TokenT.Pipe]      : {prefix: null,            infix: pipe,    precedence: Precedence.Call},
    [TokenT.PipePipe]  : {prefix: null,            infix: or,      precedence: Precedence.Or},
    [TokenT.Plus]      : {prefix: null,            infix: numeric_binary,  precedence: Precedence.Term},
    [TokenT.PlusPlus]  : {prefix: null,            infix: concat_list,  precedence: Precedence.Term},
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
    name:  string;
    type:  Type;
    depth: number;
    mut?:  boolean;
    // index?: number;     // For nonlocal referencing its position in current.locals array
}

const enum FnT {
    Function,
    Procedure,
    Top,
}

interface Compiler {
    enclosing:    Compiler | null;
    kind:         FnT,
    fn:           FGCallUser,
    scopeDepth:   number;
    locals:       Local[];
    localGlobals: Local[];
    // nonlocals:    Local[];
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
            {
                input: [],
                output: nothingT,
            },
            new Chunk(name),
        ),
        kind: kind,
        locals: [],
        localGlobals: [],
        // nonlocals: [],
        scopeDepth: 0,
    };
    current = compiler;
}

function endCompiler(): FGCallUser {
    emitReturn();
    let fn = current.fn;
    // console.log( currentChunk().disassemble() );
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

    let left = lastT;
    if (!(left instanceof NumberT) && !(left instanceof StringT))
        error("can only compare strings and numbers");

    parsePrecedence(Precedence.Comparison + 1);
    if (left.constructor !== lastT.constructor)
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

function concat_str(): void {
    assertT(lastT, stringT, `'<>' only for strings`);

    canParseArgument = true;
    parsePrecedence(Precedence.Term + 1);
    assertT(lastT, stringT, `'<>' only for strings`);

    emitByte(Op.AddStr);
}

function concat_list(): void {
    $("in concat_list()");
    let leftT = lastT;
    $(leftT);
    if (!(leftT instanceof ListT))
        error("'++' only for lists");

    parsePrecedence(Precedence.Term + 1);
    assertT(leftT, lastT, "operands type for '++' didn't match");
    emitConstant(new FGType(leftT));
    emitByte(Op.AddList);
}

// applicable(actual: Type, expected: Type, msg: string) {
// }

function pipe(): void {
    let argT = lastT;

    parsePrecedence(Precedence.Call + 1);
    if (!(lastT instanceof CallNativeT) && !(lastT instanceof CallUserT))
        error("can only pipe to function");
    assertT(lastT.input[lastT.input.length - 1], argT, `argT non match`);

    lastT = lastT.output;
    emitByte(Op.Pipe);
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
    let elType = nothingT;

    if (!check(TokenT.RBracket)) {
        canParseArgument = true;
        lastT = neverT;
        expression();
        elType = lastT;
        length++;
        while (match(TokenT.Comma)) {
            canParseArgument = true;
            lastT = neverT;
            expression();
            assertT(lastT, elType, `in list[]: expect member of type ${ elType.to_str() }, got ${ lastT.to_str() }`);
            length++;
        }
    }

    consume(TokenT.RBracket, "expect ']' after list elements");
    emitConstant(new FGType(elType));
    emitBytes(Op.List, length);
    lastT = new ListT(elType);
}

// TODO: This is broken for nested list
function index_list(): void {
    if (!(lastT instanceof ListT))
        error("Can only index a list");

    let elType = lastT.elType;

    lastT = neverT;
    expression();
    assertT(lastT, numberT, "Can only use number to index a list");

    consume(TokenT.RBracket, "expect ']' after indexing");
    emitByte(Op.Index);
    lastT = elType;
}

function length_list(): void {
    lastT = neverT;
    expression();
    if (!(lastT instanceof ListT))
        error("'#' only for lists");

    emitByte(Op.Len);
    lastT = numberT;
}

function parse_return(): void {
    $("in parse_return()");
    expression();
    emitBytes(Op.Ret, 1);
    returnT = lastT;
    lastT = nothingT;
}

//--------------------------------------------------------------------

let tempNames: {
    [name: string]: { type: Type, value?: Value, mut?: boolean },
} = {};

function resolveLocal(compiler: Compiler, name: string): number {
    for (let i = compiler.locals.length - 1; i >= 0; i--) {
        if (name === compiler.locals[i].name) {
            return i;
        }
    }
    return -1;
}

function parse_let(): void {
    $("in parse_let()");
    consume(TokenT.NCallable, "expect a name");
    let name = prevTok.lexeme;

    consume(TokenT.Eq, "expect '=' after name");
    if (current.scopeDepth > 0) {
        set_block(name);
    }
    else {
        error("cannot use 'let' in non block");
    }
}

function parse_mut(): void {
    $("in parse_mut()");
    consume(TokenT.NCallable, "expect a name");
    let name = prevTok.lexeme;

    consume(TokenT.Eq, "expect '=' after name");
    if (current.scopeDepth > 0) {
        set_local(name, true);
    } else {
        set_mut(name);
    }
}

function set_mut(name: string): void {
    // Make sure it didn't redeclare a name.
    if (Object.hasOwn(nativeNames, name)
            || Object.hasOwn(userNames, name)
            || Object.hasOwn(tempNames, name)) {
        error(`${ name } already defined`);
    }

    let index = makeConstant(new FGString(name));
    lastT = neverT;
    canParseArgument = true;
    expression();
    emitConstant(new FGType(lastT));

    tempNames[name] = { type: lastT, mut: true };
    add_local_global(name, lastT);
    emitBytes(Op.SetMut, index);
    lastT = nothingT;           // Because assignment is not an expression.
}

// Non-callable names, keywords, true, false.
function parse_non_callable(): void {
    let name = prevTok.lexeme;

    if (match(TokenT.Eq)) {
        if (!canAssign)
            error(`cannot assign ${ name }`);
        canAssign = false;
        set_non_callable(name);
    } else {
        canAssign = false;
        get_non_callable(name);
    }
}

function get_non_callable(name: string): void {
    $(name);
    let arg = resolveLocal(current, name);
    if (arg !== -1) {
        $("got local name");
        emitBytes(Op.GetLoc, arg);
        lastT = current.locals[arg].type;
    }
    else if (Object.hasOwn(nativeNames, name)) {
        get_non_callable_(nativeNames, name, Op.GetNat);
    }
    else if (Object.hasOwn(userNames, name)) {
        get_non_callable_(userNames, name, Op.GetUsr);
    }
    else if (Object.hasOwn(tempNames, name)) {
        get_non_callable_(tempNames, name, Op.GetUsr);
    }
    else {
        error(`undefined name ${name}`);
    }
}

function get_non_callable_(table: any, name: string, op: Op): void {
    let index = makeConstant(new FGString(name));
    emitBytes(op, index);
    lastT = table[name].type;
}

function set_non_callable(name: string): void {
    if (current.scopeDepth > 0) {
        set_non_callable_control(name);
    } else {
        set_non_callable_callable(name);
    }
}

function set_non_callable_callable(name: string): void {
    let type = neverT;
    let ismut = false;

    if (Object.hasOwn(nativeNames, name)) {
        error(`cannot reassign built-in name`);
    }
    else if (Object.hasOwn(userNames, name)) {
        if (userNames[name].mut === true) {
            ismut = true;
            type = userNames[name].type;
        } else {
            error(`${ name } already defined, not mutable`);
        }
    }
    else if (Object.hasOwn(tempNames, name)) {
        if (tempNames[name].mut === true) {
            ismut = true;
            type = tempNames[name].type;
        } else {
            error(`${ name } already defined, not mutable`);
        }
    }

    let index = makeConstant(new FGString(name));
    lastT = neverT;
    canParseArgument = true;
    expression();
    emitConstant(new FGType(lastT));

    if (ismut) {
        assertT(lastT, type, "reassignment type didn't match");
        emitBytes(Op.SetMut, index);
    }
    else {
        tempNames[name] = { type: lastT };
        emitBytes(Op.Set, index);
    }
    lastT = nothingT; // Because assignment is not an expression.
}

// This is for assignment in control scope that doesn't use `let` or `mut`.
// So it must be a mutable name from callable scope.

function set_non_callable_control(name: string): void {
    $("in set_non_callable_control()");

    let found = false;
    let type = neverT;

    for (let i = current.localGlobals.length - 1; i >= 0; i--) {
        let global = current.localGlobals[i];
        if (name === global.name) {
            found = true;
            type = global.type;
            break;
        }
    }
    if (!found)
        error("use 'let' to define name in control scope");

    let index = makeConstant(new FGString(name));
    lastT = neverT;
    canParseArgument = true;
    expression();
    emitConstant(new FGType(lastT));

    assertT(lastT, type, "localGlobal reassignment type didn't match");
    emitBytes(Op.SetLocG, index);

    lastT = nothingT; // Because assignment is not an expression.
}

// It doesn't support assignment to callable.
// Instead, see fn() and proc().
// Dot operator for accessing method is handled here.

function parse_callable(): void {
    let name = prevTok.lexeme;

    if (match(TokenT.Eq)) {
        if (!canAssign)
            error(`cannot assign ${ name }`);
        canAssign = false;
        set_callable(name);
    } else if (match(TokenT.Dot)) {
        canAssign = false;
        method(name);
    } else {
        canAssign = false;
        get_callable(name);
    }
}

// For now can only assign function to new name in TOP scope.
// This is always immutable.
// NOTE: doesn't support currying yet.
// TODO: implement currying.

function set_callable(name: string): void {
    let index = makeConstant(new FGString(name));
    lastT = neverT;
    canParseArgument = true;
    parsePrecedence(Precedence.Call);
    emitConstant(new FGType(lastT));

    tempNames[name] = { type: lastT };
    emitBytes(Op.Set, index);
    lastT = nothingT; // Because assignment is not an expression.
}

function method(name: string): void {
    consume(TokenT.Callable, "expect method name after '.'");
    let methodName = prevTok.lexeme;

    if (name in nativeNames) {
        if (nativeNames[name].methods
                && methodName in nativeNames[name].methods) {
            get_global(nativeNames[name].methods, methodName, true);
        } else {
            error(`undefined method ${ methodName } in ${ name }`);
        }
    } else {
        error(`undefined callable ${ name }`);
    }
}

// There is no local scope callable.
function get_callable(name: string): void {
    if (Object.hasOwn(nativeNames, name)) {
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

function call_curry(curry: FGCurry, isNative: boolean): void {
    $("in call_curry()");
    emitConstant(curry);

    let version = curry.fn.version;
    let gotTypes: Type[] = [];
    let inputs = version.input;

    let i = curry.args.length;
    for ( ; i < inputs.length; i++) {
        if (check(TokenT.Semicolon)) {
            $("found semicolon");
            break;
        }
        lastT = nothingT;
        if (canParseArgument)
            expression();
        else
            parsePrecedence(Precedence.Call);

        gotTypes.push(lastT);
        if (!inputs[i].equal( lastT )) {
            error(`in ${curry.name}: expect arg ${i} of type ${ inputs[i].to_str() }, got ${ gotTypes[i].to_str() }`);
        }
    }

    // emitBytes(native ? Op.CallNat : Op.CallUsr, arity);
    emitBytes(Op.CallCur, inputs.length - curry.args.length);
    emitBytes(isNative ? Op.CallNat : Op.CallUsr, inputs.length);
    lastT = version.output;
}

// This also work for procedure that doesn't have parameter.
// TODO: refactor this!
//       check canParseArgument in the caller.

function get_global(table: any, name_: string, native: boolean): void {
    if (!canParseArgument) {
        global_non_callable(table, name_, native);
        return;
    }
    canParseArgument = match(TokenT.Dollar);

    let name = table[name_];
    if (name.value instanceof FGCurry) {
        call_curry(name.value, native);
        return;
    }
    emitConstant(name.value as FGCallNative);

    let version = (name.value as FGCallNative).version;
    let gotTypes: Type[] = [];
    let inputs = version.input;

    let i = 0;
    for ( ; i < inputs.length; i++) {
        if (check(TokenT.Semicolon)) {
            $("found semicolon");
            break;
        }
        lastT = nothingT;
        if (canParseArgument)
            expression();
        else
            parsePrecedence(Precedence.Call);

        gotTypes.push(lastT);
        if (!inputs[i].equal( lastT )) {
            error(`in ${name_}: expect arg ${i} of type ${ inputs[i].to_str() }, got ${ gotTypes[i].to_str() }`);
        }
    }

    if (i !== inputs.length) {
        $("gonna curry");

        let newInput = inputs.slice(i);
        console.log(newInput);
        let type = new CallUserT(newInput, version.output);

        // let newType = new FGType(type);
        // emitConstant(newType);
        emitBytes(Op.Curry, i);

        lastT = type;
    }
    else {
        let arity = version.input.length;
        emitBytes(native ? Op.CallNat : Op.CallUsr, arity);
        lastT = version.output;
    }
}

// function set_nonlocal(index: number, type: Type): void {
    // lastT = neverT;
    // canParseArgument = true;
    // expression();
    // emitConstant(new FGType(lastT));
    // console.log(lastT, type);

    // assertT(lastT, type, "nonlocal reassignment type didn't match");
    // emitBytes(Op.SetLocN, index);

    // lastT = nothingT;           // Because assignment is not an expression.
// }

// function parse_nonlocal(): void {
    // consume(TokenT.NCallable, "expect name after nonlocal");
    // let name = prevTok.lexeme;
    // let type = neverT;

    // let index = -1;
    // for (let i = current.locals.length - 1; i >= 0; i--) {
        // let local = current.locals[i];
        // if (local.depth === current.scopeDepth)
            // continue;
        // if (name === local.name) {
            // index = i;
            // type = local.type;
            // break;
        // }
    // }
    // if (index === -1)
        // error(`there is no ${ name } in nonlocal`);

    // add_nonlocal(name, type, index);
    // lastT = nothingT;
// }

function parse_local_global(): void {
    consume(TokenT.NCallable, "expect name after global");
    let name = prevTok.lexeme;
    let type = neverT;

    if (Object.hasOwn(nativeNames, name))
        error("native name is immutable");
    else if (Object.hasOwn(userNames, name)) {
        if (userNames[name].mut === true)
            type = userNames[name].type;
        else
            error(`${ name } already defined, not mutable`);
    }
    else if (Object.hasOwn(tempNames, name)) {
        if (tempNames[name].mut === true)
            type = tempNames[name].type;
        else
            error(`${ name } already defined, not mutable`);
    }
    else
        error(`there is no ${ name } in global`);

    add_local_global(name, type);
    lastT = nothingT;
}

function set_block(name: string, mut: boolean = false): void {
    if (mut) {
        for (let i = current.locals.length - 1; i >= 0; i--) {
            let local = current.locals[i];
            if (local.depth < current.scopeDepth)
                break;
            if (name === local.name)
                error(`${ name } already defined in this scope`);
        }

        add_local(name);
        let index = current.locals.length - 1;

        lastT = neverT;
        canParseArgument = true;
        expression();
        emitConstant(new FGType(lastT));

        emitBytes(Op.SetLoc, index);
        current.locals[current.locals.length - 1].type = lastT;
        current.locals[current.locals.length - 1].mut = true;
    }
    else {
        let type: Type = neverT;
        let mut = false;

        let i;
        for (i = current.locals.length - 1; i >= 0; i--) {
            let local = current.locals[i];
            if (name === local.name) {
                if (local.mut === true) {
                    mut = true;
                    type = local.type;
                    break;
                }
                else {
                    if (local.depth === current.scopeDepth)
                        error(`${ name } already defined in this scope`);
                }
            }
        }
        let index: number;
        if (mut) {
            $("mut");
            index = i;
        } else {
            add_local(name);
            index = current.locals.length - 1;
        }

        lastT = neverT;
        canParseArgument = true;
        expression();
        emitConstant(new FGType(lastT));

        if (mut)
            emitBytes(Op.SetLocM, index);
        else {
            current.locals[current.locals.length - 1].type = lastT;
            emitBytes(Op.SetLoc, index);
        }

    }
    lastT = nothingT;
}

function set_local(name: string, mut: boolean = false): void {
    // // Check if name is in nonlocals
    // for (let i = current.nonlocals.length - 1; i >= 0; i--) {
        // let non = current.nonlocals[i];
        // if (non.depth < current.scopeDepth)
            // break;
        // if (name === non.name) {
            // set_nonlocal(non.index as number, non.type);
            // return;
        // }
    // }

    if (mut) {
        for (let i = current.locals.length - 1; i >= 0; i--) {
            let local = current.locals[i];
            if (local.depth < current.scopeDepth)
                break;
            if (name === local.name)
                error(`${ name } already defined in this scope`);
        }

        add_local(name);
        let index = current.locals.length - 1;

        lastT = neverT;
        canParseArgument = true;
        expression();
        emitConstant(new FGType(lastT));

        emitBytes(Op.SetLoc, index);
        current.locals[current.locals.length - 1].type = lastT;
        current.locals[current.locals.length - 1].mut = true;
    }
    else {
        let type: Type = neverT;
        let mut = false;

        let i;
        for (i = current.locals.length - 1; i >= 0; i--) {
            let local = current.locals[i];
            if (name === local.name) {
                if (local.mut === true) {
                    mut = true;
                    type = local.type;
                    break;
                }
                else {
                    if (local.depth === current.scopeDepth)
                        error(`${ name } already defined in this scope`);
                }
            }
        }
        let index: number;
        if (mut) {
            $("mut");
            index = i;
        } else {
            add_local(name);
            index = current.locals.length - 1;
        }

        lastT = neverT;
        canParseArgument = true;
        expression();
        emitConstant(new FGType(lastT));

        if (mut)
            emitBytes(Op.SetLocM, index);
        else {
            current.locals[current.locals.length - 1].type = lastT;
            emitBytes(Op.SetLoc, index);
        }

    }

    // add_local(name);
    // let index = current.locals.length - 1;

    // lastT = neverT;
    // canParseArgument = true;
    // expression();

    // emitBytes(Op.SetLoc, index);
    // current.locals[current.locals.length - 1].type = lastT;
    // if (mut)
        // current.locals[current.locals.length - 1].mut = true;
    lastT = nothingT;
}

// TODO: This can't parse `a = Print` since it sets canParseArgument to true. Think about it.

function set_global(name: string, mut: boolean = false): void {
    let type: Type = neverT;
    let ismut = false;

    // Make sure it didn't redeclare a name.
    if (mut) {
        if (Object.hasOwn(nativeNames, name)
            || Object.hasOwn(userNames, name)
            || Object.hasOwn(tempNames, name)) {
            error(`${ name } already defined`);
        }
    }
    else {
        if (Object.hasOwn(nativeNames, name)) {
            error(`${ name } already defined`);
        }
        else if (Object.hasOwn(userNames, name)) {
            if (userNames[name].mut === true) {
                ismut = true;
                type = userNames[name].type;
            } else {
                error(`${ name } already defined, not mutable`);
            }
        }
        else if (Object.hasOwn(tempNames, name)) {
            if (tempNames[name].mut === true) {
                ismut = true;
                type = tempNames[name].type;
            } else {
                error(`${ name } already defined, not mutable`);
            }
        }
    }

    let index = makeConstant(new FGString(name));
    lastT = neverT;
    canParseArgument = true;
    expression();
    emitConstant(new FGType(lastT));

    if (mut) {
        tempNames[name] = { type: lastT, mut: true };
        add_local_global(name, lastT);
        emitBytes(Op.SetMut, index);
    }
    else if (ismut) {
        assertT(lastT, type, "reassignment type didn't match");
        tempNames[name] = { type: lastT, mut: true };   // TODO: is below necessary???
        emitBytes(Op.SetMut, index);
    }
    else {
        tempNames[name] = { type: lastT };
        emitBytes(Op.Set, index);
    }
    lastT = nothingT;           // Because assignment is not an expression.
}

function global_non_callable(table: any, name: string, native: boolean): void {
    emitConstant(table[name].value);

    // let index = makeConstant(new FGString(name));
    // emitBytes(native ? Op.GetNat : Op.GetUsr, index);
    lastT = table[name].type;
    // $(name, table, table[name].type);
}

function parse_type(): Type {
    advance();
    let type: Type;
    switch (prevTok.kind) {
        case TokenT.BoolT:
            type = booleanT;
            break;
        case TokenT.NumT:
            type = numberT;
            break;
        case TokenT.StrT:
            type = stringT;
            break;
        case TokenT.CircleT:
            type = circleT;
            break;
        default:
            error("expect parameter type");
    }
    // List possibility
    while (match(TokenT.LBracket)) {
        $("match [ in parse_type");
        consume(TokenT.RBracket, "expect ']' after list type");
        type = new ListT(type);
    }
    return type;
}

// TODO: Check again what that for loop doing? Is it necessary?
function parse_params(): Type {
    consume(TokenT.NCallable, "expect parameter name");
    let name = prevTok.lexeme;

    for (let i = current.locals.length - 1; i >= 0; i--) {
        let local = current.locals[i];
        if (local.depth < current.scopeDepth) break;
        if (name === local.name)
            error(`${ name } already defined in this scope`);
    }
    add_local(name);

    consume(TokenT.Colon, "expect `:` after parameter name");
    let type = parse_type();

    current.locals[current.locals.length - 1].type = type;
    current.fn.version.input.push(type);
    lastT = nothingT;
    return type;
}

function fn(): void {
    $("in fn()");
    consume(TokenT.Callable, "expect function name in PascalCase");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));

    begin_compiler(FnT.Function, name);
    beginScope();

    let inputT: Type[] = [];
    do {
        inputT.push( parse_params() );
    } while (match(TokenT.Comma));

    // return type
    consume(TokenT.Arrow, "expect `->` after list of params");
    let outputT = parse_type();

    current.fn.version.output = outputT;
    tempNames[name] = { type: callUserT, value: current.fn };

    consume(TokenT.Eq, "expect '=' before fn body");

    canParseArgument = true;
    expression();
    emitBytes(Op.Ret, 1);
    $(lastT, outputT);
    assertT(lastT, outputT, "return type not match");

    let fn = endCompiler();

    emitConstant(fn);
    emitConstant(new FGType(new CallUserT(inputT, outputT)));
    emitBytes(Op.Set, index);
    lastT = outputT;
}

// TODO: Implement recursion. See commented line.
function proc(): void {
    $("in proc()");
    consume(TokenT.Callable, "expect procedure name in PascalCase");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));

    begin_compiler(FnT.Function, name);
    beginScope();

    do {
        parse_params();
    } while (match(TokenT.Comma));

    let outputT = nothingT;
    // Optional return type
    if (match(TokenT.Arrow)) {
        outputT = parse_type();
    }

    current.fn.version.output = outputT;
    tempNames[name] = { type: callUserT, value: current.fn };

    consume(TokenT.LBrace, "expect '{' before proc body");

    // Check return statement
    returnT = nothingT;
    proc_body();
    assertT(returnT, outputT, "return type not match");
    if (outputT.equal(nothingT))
        emitBytes(Op.Ret, 0);

    consume(TokenT.RBrace, "expect '}' after proc body");

    let fn = endCompiler();

    emitConstant(fn);
    emitConstant(new FGType(callUserT));
    emitBytes(Op.Set, index);
    lastT = outputT;
}

function proc_body(): void {
    while (!check(TokenT.RBrace) && !check(TokenT.EOF)) {
        statement();
    }
}

function add_local(name: string): void {
    current.locals.push({ name, type: nothingT, depth: current.scopeDepth });
}

// function add_nonlocal(name: string, type: Type, index: number): void {
    // current.nonlocals.push({ name, type, depth: current.scopeDepth, index });
// }

function add_local_global(name: string, type: Type): void {
    current.localGlobals.push({ name, type, depth: current.scopeDepth });
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
    canParseBlock = true;
    statement();

    let elseJump = emitJump(Op.Jmp);
    patchJump(thenJump);
    emitByte(Op.Pop);

    if (match(TokenT.Else)) {
        canParseBlock = true;
        statement();
    }
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
    current.locals.push({ name: "_Start", type: numberT, depth: current.scopeDepth });

    consume(TokenT.Comma, "expect ',' between start and end of range");

    expression();
    assertT(lastT, numberT, "end of range must be numeric");
    current.locals.push({ name: "_End", type: numberT, depth: current.scopeDepth });

    // Parse optional step.
    if (match(TokenT.Comma)) {
        expression();
        assertT(lastT, numberT, "step of range must be numeric");
    } else {
        // Manually add step. Default is 1. Even when the range is decreasing.
        emitConstant(new FGNumber(1));
    }
    current.locals.push({ name: "_Step", type: numberT, depth: current.scopeDepth });

    let openRight: boolean;
    if (match(TokenT.RParen)) {
        openRight = true;
    } else {
        openRight = false;
        consume(TokenT.RBracket, "expect ']' in range");
    }

    if (!match(TokenT.NCallable))
        error_at_current("expect name for iterator");
    let name = prevTok.lexeme;
    // No need to check conflicting name because it is the first name in this scope.
    current.locals[start].name = name;  // Patch the _Start name.
    // emitBytes(Op.SetLoc, start); // TODO: think about this later
    // emitByte(Op.SetLoc);

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
    // TODO: think again.
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
    if (match(TokenT.NCallable)) {
        canAssign = true;
        parse_non_callable();
    } else if (match(TokenT.Callable)) {
        canAssign = true;
        canParseArgument = true;
        parse_callable();
    } else if (match(TokenT.Global)) {
        parse_local_global();
    // } else if (match(TokenT.Nonlocal)) {
        // parse_nonlocal();
    } else if (match(TokenT.Let)) {
        parse_let();
    } else if (match(TokenT.Mut)) {
        parse_mut();
    } else if (match(TokenT.LBrace)) {
        if (!canParseBlock)
            error("forbiden block");
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

function block(): void {
    canParseBlock = false;
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
    while (current.localGlobals.length > 0
            && current.localGlobals[current.localGlobals.length - 1].depth > current.scopeDepth) {
        current.localGlobals.pop();
    }
    // while (current.nonlocals.length > 0
            // && current.nonlocals[current.nonlocals.length - 1].depth > current.scopeDepth) {
        // // emitByte(Op.Pop);
        // current.nonlocals.pop();
    // }
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
        lastT = nothingT;         // Reset last type.

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
