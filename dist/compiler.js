import { TokenTName, scanner } from "./scanner.js";
import { Chunk } from "./chunk.js";
import { KindName, FGBoolean, FGNumber, FGString, FGFunction } from "./value.js";
import { nativeNames, userNames } from "./names.js";
let numberType = { kind: 500 };
let booleanT = { base: 300 };
let numberT = { base: 500 };
let stringT = { base: 600 };
let nothingT = { base: 100 };
let lastT = nothingT;
function assertT(actual, expect, msg) {
    if (actual.base !== expect.base)
        error(msg);
}
let canParseArgument = false;
let canAssign = false;
var Precedence;
(function (Precedence) {
    Precedence[Precedence["None"] = 100] = "None";
    Precedence[Precedence["Assignment"] = 200] = "Assignment";
    Precedence[Precedence["Or"] = 210] = "Or";
    Precedence[Precedence["And"] = 220] = "And";
    Precedence[Precedence["Equality"] = 230] = "Equality";
    Precedence[Precedence["Comparison"] = 250] = "Comparison";
    Precedence[Precedence["Term"] = 300] = "Term";
    Precedence[Precedence["Factor"] = 400] = "Factor";
    Precedence[Precedence["Unary"] = 500] = "Unary";
    Precedence[Precedence["Call"] = 600] = "Call";
    Precedence[Precedence["Primary"] = 700] = "Primary";
})(Precedence || (Precedence = {}));
const rules = {
    [1180]: { prefix: null, infix: null, precedence: 100 },
    [1190]: { prefix: null, infix: and_, precedence: 220 },
    [1195]: { prefix: null, infix: null, precedence: 100 },
    [1200]: { prefix: not, infix: null, precedence: 100 },
    [1210]: { prefix: null, infix: neq, precedence: 230 },
    [1300]: { prefix: null, infix: null, precedence: 100 },
    [1400]: { prefix: null, infix: null, precedence: 100 },
    [100]: { prefix: null, infix: null, precedence: 100 },
    [200]: { prefix: null, infix: null, precedence: 100 },
    [2300]: { prefix: null, infix: null, precedence: 100 },
    [2100]: { prefix: null, infix: null, precedence: 100 },
    [1500]: { prefix: null, infix: null, precedence: 100 },
    [1505]: { prefix: null, infix: eq, precedence: 230 },
    [2200]: { prefix: null, infix: null, precedence: 100 },
    [1600]: { prefix: parse_boolean, infix: null, precedence: 100 },
    [2320]: { prefix: null, infix: null, precedence: 100 },
    [1520]: { prefix: null, infix: compare, precedence: 250 },
    [1525]: { prefix: null, infix: compare, precedence: 250 },
    [2400]: { prefix: null, infix: null, precedence: 100 },
    [2405]: { prefix: parse_ifx, infix: null, precedence: 100 },
    [300]: { prefix: null, infix: null, precedence: 100 },
    [400]: { prefix: null, infix: null, precedence: 100 },
    [1550]: { prefix: null, infix: compare, precedence: 250 },
    [1555]: { prefix: null, infix: compare, precedence: 250 },
    [500]: { prefix: grouping, infix: null, precedence: 100 },
    [600]: { prefix: negate, infix: binary, precedence: 300 },
    [1700]: { prefix: parse_name, infix: null, precedence: 100 },
    [1800]: { prefix: parse_number, infix: null, precedence: 100 },
    [2600]: { prefix: null, infix: null, precedence: 100 },
    [1575]: { prefix: null, infix: binary, precedence: 300 },
    [1580]: { prefix: null, infix: or_, precedence: 210 },
    [1585]: { prefix: null, infix: binary, precedence: 300 },
    [1590]: { prefix: null, infix: binary_str, precedence: 300 },
    [2750]: { prefix: null, infix: binary_str, precedence: 300 },
    [695]: { prefix: null, infix: null, precedence: 100 },
    [700]: { prefix: null, infix: null, precedence: 100 },
    [2800]: { prefix: null, infix: null, precedence: 100 },
    [800]: { prefix: null, infix: null, precedence: 100 },
    [900]: { prefix: null, infix: null, precedence: 100 },
    [1000]: { prefix: null, infix: binary, precedence: 400 },
    [1100]: { prefix: null, infix: binary, precedence: 400 },
    [1900]: { prefix: parse_string, infix: null, precedence: 100 },
    [2900]: { prefix: null, infix: null, precedence: 100 },
    [3000]: { prefix: null, infix: null, precedence: 100 },
    [2000]: { prefix: parse_boolean, infix: null, precedence: 100 },
};
var FnT;
(function (FnT) {
    FnT[FnT["Function"] = 0] = "Function";
    FnT[FnT["Script"] = 1] = "Script";
})(FnT || (FnT = {}));
let current;
let invalidToken = { kind: 2100, line: -1, lexeme: "" };
let currTok = invalidToken;
let prevTok = invalidToken;
function currentChunk() {
    return current.fn.chunk;
}
function init_compiler(compiler, type, name) {
    compiler.enclosing = current;
    compiler.fn = new FGFunction(name, [{ input: [], output: 100 }], new Chunk(name));
    compiler.type = type;
    compiler.locals = [];
    compiler.scopeDepth = 0;
    current = compiler;
}
function endCompiler() {
    emitReturn();
    let fn = current.fn;
    console.log(currentChunk().disassemble());
    current = current.enclosing;
    return fn;
}
function error_at_current(message) {
    error_at(currTok, message);
}
function error(message) {
    error_at(prevTok, message);
}
function error_at(token, message) {
    let result = token.line + "";
    if (token.kind === 2100)
        result += ": at end";
    else if (token.kind === 2200)
        result += ": scanner";
    else
        result += `: at '${token.lexeme}'`;
    result += `: ${message}\n`;
    throw new CompileError(result);
}
function advance() {
    prevTok = currTok;
    currTok = scanner.next();
    if (currTok.kind === 2200) {
        error_at_current(currTok.lexeme);
    }
}
function check(kind) {
    return currTok.kind === kind;
}
function match(kind) {
    if (currTok.kind === kind) {
        advance();
        return true;
    }
    return false;
}
function consume(kind, message) {
    if (currTok.kind === kind) {
        advance();
        return;
    }
    error_at_current(message);
}
function emitByte(byte) {
    currentChunk().write(byte, prevTok.line);
}
function emitBytes(byte1, byte2) {
    emitByte(byte1);
    emitByte(byte2);
}
function emitConstant(value) {
    emitBytes(800, makeConstant(value));
}
function emitReturn() {
    emitByte(1290);
}
function makeConstant(value) {
    return currentChunk().add_value(value);
}
function grouping() {
    canParseArgument = true;
    expression();
    consume(800, "expect ')' after grouping");
}
function not() {
    parsePrecedence(500);
    assertT(lastT, booleanT, "'!' is only for boolean");
    emitByte(1100);
}
function negate() {
    parsePrecedence(500);
    assertT(lastT, numberT, "'-' is only for number");
    emitByte(1000);
}
function eq() {
    parsePrecedence(230 + 1);
    emitByte(380);
    lastT = booleanT;
}
function neq() {
    parsePrecedence(230 + 1);
    emitByte(1010);
    lastT = booleanT;
}
function compare() {
    let operator = prevTok.kind;
    let left = lastT.base;
    if (left !== 500 && left !== 600)
        error("can only compare strings or numbers");
    parsePrecedence(250 + 1);
    if (lastT.base !== left)
        error("type not match");
    switch (operator) {
        case 1550:
            emitByte(810);
            break;
        case 1520:
            emitByte(530);
            break;
        case 1555:
            emitByte(690);
            break;
        case 1525:
            emitByte(390);
            break;
        default: error("unhandled camparison op");
    }
    lastT = booleanT;
}
function binary() {
    let operator = prevTok.lexeme;
    assertT(lastT, numberT, `'${operator}' only for numbers`);
    let operatorType = prevTok.kind;
    let rule = rules[operatorType];
    parsePrecedence(rule.precedence + 1);
    assertT(lastT, numberT, `'${operator}' only for numbers`);
    switch (operatorType) {
        case 1575:
            emitByte(610);
            lastT = booleanT;
            break;
        case 1585:
            emitByte(100);
            break;
        case 600:
            emitByte(1500);
            break;
        case 1100:
            emitByte(900);
            break;
        case 1000:
            emitByte(300);
            break;
        default: error("unhandled binary op");
    }
}
function binary_str() {
    let operator = prevTok.lexeme;
    assertT(lastT, stringT, `'${operator}' only for strings`);
    let operatorType = prevTok.kind;
    let rule = rules[operatorType];
    parsePrecedence(rule.precedence + 1);
    assertT(lastT, stringT, `'${operator}' only for strings`);
    emitByte(120);
}
function parse_boolean() {
    if (prevTok.kind === 2000)
        emitConstant(new FGBoolean(true));
    else
        emitConstant(new FGBoolean(false));
    lastT = booleanT;
}
function parse_number() {
    let value = Number(prevTok.lexeme);
    emitConstant(new FGNumber(value));
    lastT = numberT;
}
function parse_string() {
    emitConstant(new FGString(prevTok.lexeme));
    lastT = stringT;
}
function parse_return() {
    console.log("in parse_return()");
    expression();
    emitByte(1300);
    let resultT = lastT;
    lastT = nothingT;
    return resultT;
}
let tempNames = {};
function resolveLocal(compiler, name) {
    for (let i = compiler.locals.length - 1; i >= 0; i--) {
        let local = compiler.locals[i];
        if (name === local.name) {
            return i;
        }
    }
    return -1;
}
function parse_name() {
    let name = prevTok.lexeme;
    if (match(1500)) {
        if (canAssign) {
            canAssign = false;
            set_name(name);
        }
        else {
            error(`cannot assign ${name}`);
        }
    }
    else {
        canAssign = false;
        get_name(name);
    }
}
function set_name(name) {
    if (current.scopeDepth > 0) {
        set_local(name);
    }
    else {
        set_global(name);
    }
}
function set_local(name) {
    for (let i = current.locals.length - 1; i >= 0; i--) {
        let local = current.locals[i];
        if (local.depth < current.scopeDepth) {
            break;
        }
        if (name === local.name) {
            error(`${name} already defined in this scope`);
        }
    }
    add_local(name);
    lastT = nothingT;
    canParseArgument = true;
    expression();
    emitByte(1410);
    current.locals[current.locals.length - 1].type = { kind: lastT.base };
    lastT = nothingT;
}
function set_global(name) {
    if (Object.hasOwn(nativeNames, name)
        || Object.hasOwn(userNames, name)
        || Object.hasOwn(tempNames, name)) {
        error(`${name} already defined`);
    }
    let index = makeConstant(new FGString(name));
    lastT = nothingT;
    canParseArgument = true;
    expression();
    emitBytes(1400, index);
    emitByte(lastT.base);
    tempNames[name] = { kind: lastT.base };
    lastT = nothingT;
}
function parse_type() {
    advance();
    switch (prevTok.kind) {
        case 2600:
            return { base: 500 };
        case 2900:
            return { base: 600 };
        default:
            error("expect parameter type");
            return { base: 100 };
    }
}
function parse_params() {
    consume(1700, "expect parameter name");
    let name = prevTok.lexeme;
    for (let i = current.locals.length - 1; i >= 0; i--) {
        let local = current.locals[i];
        if (local.depth < current.scopeDepth)
            break;
        if (name === local.name)
            error(`${name} already defined in this scope`);
    }
    add_local(name);
    consume(1300, "expect `:` after parameter name");
    let t = parse_type();
    current.locals[current.locals.length - 1].type = { kind: t.base };
    current.fn.version[0].input.push(t.base);
    lastT = nothingT;
}
function fn() {
    consume(1700, "expect function name");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));
    let comp = {};
    init_compiler(comp, 0, name);
    beginScope();
    do {
        parse_params();
    } while (match(100));
    consume(1195, "expect `->` after list of params");
    let t = parse_type();
    current.fn.version[0].output = t.base;
    tempNames[name] = { kind: 400, value: current.fn };
    consume(1500, "expect '=' before fn body");
    expression();
    emitBytes(1300, 1);
    assertT(lastT, t, "return type not match");
    let fn = endCompiler();
    emitConstant(fn);
    emitBytes(1400, index);
    emitByte(400);
}
function proc() {
    consume(1700, "expect procedure name");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));
    let comp = {};
    init_compiler(comp, 0, name);
    beginScope();
    do {
        parse_params();
    } while (match(100));
    console.log(current.fn);
    current.fn.version[0].output = 100;
    tempNames[name] = { kind: 400, value: current.fn };
    consume(300, "expect '{' before proc body");
    procBody();
    emitBytes(1300, 0);
    consume(695, "expect '}' after proc body");
    let fn = endCompiler();
    emitConstant(fn);
    emitBytes(1400, index);
    emitByte(400);
}
function procBody() {
    while (!check(695) && !check(2100)) {
        statement();
    }
}
function get_name(name) {
    let arg = resolveLocal(current, name);
    if (arg != -1) {
        emitBytes(395, arg);
        lastT = { base: current.locals[arg].type.kind };
    }
    else if (Object.hasOwn(nativeNames, name)) {
        console.log("in nativeNames");
        if (nativeNames[name].kind === 400)
            global_callable(name, nativeNames, true);
        else
            global_non_callable(nativeNames, name, true);
    }
    else if (Object.hasOwn(userNames, name)) {
        if (userNames[name].kind === 400)
            global_callable(name, userNames, false);
        else
            global_non_callable(userNames, name, false);
    }
    else if (Object.hasOwn(tempNames, name)) {
        if (tempNames[name].kind === 400)
            global_callable(name, tempNames, false);
        else
            global_non_callable(tempNames, name, false);
    }
    else {
        error(`undefined name ${name}`);
    }
}
function matchType(expected, actual) {
    if (expected === 200) {
        return true;
    }
    else if (typeof expected === "number") {
        return actual === expected;
    }
    else {
        return expected.has(actual);
    }
}
function setToKinds(set_) {
    let s = [];
    for (let kind of set_) {
        s.push(KindName[kind]);
    }
    return s;
}
function global_callable(name_, table, native) {
    if (!canParseArgument) {
        lastT = { base: table[name_].kind };
        return;
    }
    canParseArgument = match(200);
    let name = table[name_];
    let version = name.value.version;
    let inputVersion = [];
    let gotTypes = [];
    let success = true;
    let i = 0;
    let j = 0;
    for (; i < version.length; i++) {
        let checkNextVersion = false;
        success = true;
        inputVersion = version[i].input;
        j = 0;
        for (; j < gotTypes.length; j++) {
            if (!matchType(inputVersion[j], gotTypes[j])) {
                success = false;
                break;
            }
        }
        if (!success)
            continue;
        for (let k = j; k < inputVersion.length; k++) {
            lastT = nothingT;
            parsePrecedence(600);
            gotTypes.push(lastT.base);
            if (!matchType(inputVersion[k], lastT.base)) {
                checkNextVersion = true;
                success = false;
                break;
            }
        }
        if (!checkNextVersion)
            break;
    }
    if (!success) {
        if (typeof inputVersion[j] === "number")
            error(`in ${name_}: expect arg ${j} of type ${KindName[inputVersion[j]]}, got ${KindName[gotTypes[j]]}`);
        else
            error(`in ${name_}: expect arg ${j} of class [${setToKinds(inputVersion[j])}], got ${KindName[gotTypes[j]]}`);
    }
    let index = makeConstant(name.value);
    if (native)
        emitBytes(200, index);
    else
        emitBytes(205, index);
    emitByte(i);
    if (version[i].output === 100) {
        lastT = nothingT;
    }
    else {
        lastT = { base: version[i].output };
    }
}
function global_non_callable(table, name, native) {
    let index = makeConstant(new FGString(name));
    if (native)
        emitBytes(400, index);
    else
        emitBytes(500, index);
    lastT = { base: table[name].kind };
}
function add_local(name) {
    let local = { name, type: { kind: 100 }, depth: current.scopeDepth };
    current.locals.push(local);
}
function emitJump(instruction) {
    emitByte(instruction);
    emitByte(-1);
    return currentChunk().code.length - 1;
}
function patchJump(offset) {
    let jump = currentChunk().code.length - offset - 1;
    currentChunk().code[offset] = jump;
}
function parse_if() {
    expression();
    assertT(lastT, booleanT, "conditional expression must be boolean");
    let thenJump = emitJump(620);
    emitByte(1200);
    statement();
    let elseJump = emitJump(615);
    patchJump(thenJump);
    emitByte(1200);
    if (match(2300))
        statement();
    patchJump(elseJump);
}
function parse_ifx() {
    expression();
    assertT(lastT, booleanT, "conditional expression must be boolean");
    let thenJump = emitJump(620);
    emitByte(1200);
    consume(3000, "then is missing");
    expression();
    let trueT = lastT;
    let elseJump = emitJump(615);
    patchJump(thenJump);
    emitByte(1200);
    consume(2300, "else is missing");
    canParseArgument = true;
    expression();
    assertT(trueT, lastT, "true and false branch didn't match");
    patchJump(elseJump);
}
function emitLoop(loopStart) {
    emitByte(616);
    let offset = currentChunk().code.length - loopStart + 1;
    emitByte(-offset);
}
function parse_loop() {
    beginScope();
    lastT = nothingT;
    expression();
    assertT(lastT, numberT, "start of range must be number");
    let start = current.locals.length;
    let startRange = { name: "_Start", type: numberType, depth: current.scopeDepth };
    current.locals.push(startRange);
    consume(100, "expect ',' between start and end");
    lastT = nothingT;
    expression();
    assertT(lastT, numberT, "end of range must be number");
    let openRightId = currentChunk().values.length;
    emitConstant(new FGNumber(0));
    emitByte(100);
    let endRange = { name: "_End", type: numberType, depth: current.scopeDepth };
    current.locals.push(endRange);
    if (match(100)) {
        expression();
    }
    else {
        emitConstant(new FGNumber(1));
    }
    let stepRange = { name: "_Step", type: numberType, depth: current.scopeDepth };
    current.locals.push(stepRange);
    if (match(800)) {
        currentChunk().values[openRightId] = new FGNumber(-1);
    }
    else {
        consume(700, "expect ']' in range");
    }
    if (!match(1700)) {
        error_at_current("expect name for iterator");
    }
    let name = prevTok.lexeme;
    for (let i = current.locals.length - 1; i >= 0; i--) {
        let local = current.locals[i];
        if (local.depth < current.scopeDepth)
            break;
        if (name === local.name)
            error(`${name} already defined in this scope`);
    }
    current.locals[start].name = name;
    emitByte(1410);
    let loopStart = currentChunk().code.length;
    emitBytes(210, start);
    let exitJump = emitJump(620);
    emitByte(1200);
    if (match(300)) {
        while (!check(695) && !check(2100)) {
            declaration();
        }
        consume(695, "expect '}' after block");
        while (current.locals.length > start + 3) {
            emitByte(1200);
            current.locals.pop();
        }
    }
    else {
        statement();
    }
    emitBytes(595, start);
    emitLoop(loopStart);
    patchJump(exitJump);
    emitByte(1200);
    endScope();
    lastT = nothingT;
}
function and_() {
    assertT(lastT, booleanT, "operands of '&&' must be boolean");
    let endJump = emitJump(620);
    emitByte(1200);
    parsePrecedence(220);
    assertT(lastT, booleanT, "operands of '&&' must be boolean");
    patchJump(endJump);
}
function or_() {
    assertT(lastT, booleanT, "operands of '||' must be boolean");
    let elseJump = emitJump(620);
    let endJump = emitJump(615);
    patchJump(elseJump);
    emitByte(1200);
    parsePrecedence(210);
    assertT(lastT, booleanT, "operands of '||' must be boolean");
    patchJump(endJump);
}
function parsePrecedence(precedence) {
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
function expression() {
    parsePrecedence(200);
}
function identifierConstant(name) {
    return makeConstant(new FGString(name.lexeme));
}
function prev() {
    console.log(TokenTName[prevTok.kind]);
}
function curr() {
    console.log(TokenTName[currTok.kind]);
}
function declaration() {
    if (match(2320)) {
        fn();
    }
    else if (match(2750)) {
        proc();
    }
    else {
        statement();
    }
}
function statement() {
    if (match(1700)) {
        canParseArgument = true;
        canAssign = true;
        parse_name();
    }
    else if (match(300)) {
        beginScope();
        block();
        endScope();
    }
    else if (match(2400)) {
        parse_if();
    }
    else if (match(400)
        || match(500)) {
        parse_loop();
    }
    else if (match(2800)) {
        parse_return();
    }
    else if (match(900)) {
    }
    else {
        error_at_current(`cannot start statement with ${TokenTName[currTok.kind]}`);
    }
    assertT(lastT, nothingT, "forbidden expression statement");
}
function beginScope() {
    current.scopeDepth++;
}
function block() {
    while (!check(695) && !check(2100)) {
        declaration();
    }
    consume(695, "expect '}' after block");
}
function endScope() {
    current.scopeDepth--;
    while (current.locals.length > 0 &&
        current.locals[current.locals.length - 1].depth > current.scopeDepth) {
        emitByte(1200);
        current.locals.pop();
    }
}
class CompileError extends Error {
}
const compiler = {
    compile(source) {
        scanner.init(source);
        let comp = { enclosing: null, fn: new FGFunction("test", [], new Chunk("")), type: 0, locals: [], scopeDepth: 0 };
        init_compiler(comp, 1, "TOP");
        tempNames = {};
        prevTok = invalidToken;
        currTok = invalidToken;
        try {
            advance();
            while (!match(2100)) {
                declaration();
            }
            return { ok: true, value: endCompiler() };
        }
        catch (error) {
            if (error instanceof Error)
                return { ok: false, error };
            return { ok: false, error: new Error("unknown error") };
        }
    }
};
export { compiler };
