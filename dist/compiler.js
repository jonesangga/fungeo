import { TokenTName, scanner } from "./scanner.js";
import { Chunk } from "./chunk.js";
import { KindName, FGBoolean, FGNumber, FGString, FGCallUser } from "./value.js";
import { nativeNames } from "./names.js";
import { userNames } from "./vm.js";
let numberType = { kind: 500 };
let booleanT = [300];
let numberT = [500];
let stringT = [600];
let nothingT = [100];
let lastT = nothingT;
function assertT(actual, expected, msg) {
    if (actual.length === expected.length) {
        for (let i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                error(msg);
            }
        }
    }
    else {
        error(msg);
    }
}
function assertList(actual, expected, msg) {
    let len = actual.length;
    if (len % 2 === 1 && len === expected.length) {
        for (let i = 0; i < len; i += 2) {
            if (actual[i] !== expected[i]) {
                error(msg);
            }
        }
    }
    else {
        error(msg);
    }
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
    [1190]: { prefix: null, infix: and, precedence: 220 },
    [1195]: { prefix: null, infix: null, precedence: 100 },
    [1200]: { prefix: not, infix: null, precedence: 100 },
    [1210]: { prefix: null, infix: neq, precedence: 230 },
    [2220]: { prefix: null, infix: null, precedence: 100 },
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
    [1520]: { prefix: null, infix: boolean_compare, precedence: 250 },
    [1525]: { prefix: null, infix: boolean_compare, precedence: 250 },
    [2400]: { prefix: null, infix: null, precedence: 100 },
    [2405]: { prefix: parse_ifx, infix: null, precedence: 100 },
    [300]: { prefix: null, infix: null, precedence: 100 },
    [400]: { prefix: parse_list, infix: index_list, precedence: 600 },
    [1550]: { prefix: null, infix: boolean_compare, precedence: 250 },
    [1555]: { prefix: null, infix: boolean_compare, precedence: 250 },
    [500]: { prefix: grouping, infix: null, precedence: 100 },
    [1560]: { prefix: null, infix: concat_str, precedence: 300 },
    [600]: { prefix: negate, infix: numeric_binary, precedence: 300 },
    [1700]: { prefix: parse_name, infix: null, precedence: 100 },
    [1800]: { prefix: parse_number, infix: null, precedence: 100 },
    [2600]: { prefix: null, infix: null, precedence: 100 },
    [1575]: { prefix: null, infix: boolean_isdiv, precedence: 300 },
    [1580]: { prefix: null, infix: or, precedence: 210 },
    [1585]: { prefix: null, infix: numeric_binary, precedence: 300 },
    [1590]: { prefix: null, infix: concat_list, precedence: 300 },
    [2750]: { prefix: null, infix: null, precedence: 300 },
    [695]: { prefix: null, infix: null, precedence: 100 },
    [700]: { prefix: null, infix: null, precedence: 100 },
    [2800]: { prefix: null, infix: null, precedence: 100 },
    [800]: { prefix: null, infix: null, precedence: 100 },
    [900]: { prefix: null, infix: null, precedence: 100 },
    [1000]: { prefix: null, infix: numeric_binary, precedence: 400 },
    [1100]: { prefix: null, infix: numeric_binary, precedence: 400 },
    [1900]: { prefix: parse_string, infix: null, precedence: 100 },
    [2900]: { prefix: null, infix: null, precedence: 100 },
    [3000]: { prefix: null, infix: null, precedence: 100 },
    [2000]: { prefix: parse_boolean, infix: null, precedence: 100 },
};
var FnT;
(function (FnT) {
    FnT[FnT["Function"] = 0] = "Function";
    FnT[FnT["Procedure"] = 1] = "Procedure";
    FnT[FnT["Top"] = 2] = "Top";
})(FnT || (FnT = {}));
let current;
let invalidTok = { kind: 2100, line: -1, lexeme: "" };
let currTok = invalidTok;
let prevTok = invalidTok;
function currentChunk() {
    return current.fn.chunk;
}
function begin_compiler(kind, name) {
    let compiler = {
        enclosing: current,
        fn: new FGCallUser(name, 0, [{
                input: [],
                output: 100
            }], new Chunk(name)),
        kind: kind,
        locals: [],
        scopeDepth: 0,
    };
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
function and() {
    assertT(lastT, booleanT, "operands of '&&' must be booleans");
    let endJump = emitJump(620);
    emitByte(1200);
    parsePrecedence(220);
    assertT(lastT, booleanT, "operands of '&&' must be booleans");
    patchJump(endJump);
}
function or() {
    assertT(lastT, booleanT, "operands of '||' must be booleans");
    let elseJump = emitJump(620);
    let endJump = emitJump(615);
    patchJump(elseJump);
    emitByte(1200);
    parsePrecedence(210);
    assertT(lastT, booleanT, "operands of '||' must be booleans");
    patchJump(endJump);
}
function boolean_isdiv() {
    assertT(lastT, numberT, `'|' only for numbers`);
    parsePrecedence(300 + 1);
    assertT(lastT, numberT, `'|' only for numbers`);
    emitByte(610);
    lastT = booleanT;
}
function boolean_compare() {
    let opType = prevTok.kind;
    let operator = prevTok.lexeme;
    let left = lastT[0];
    if (left !== 500 && left !== 600)
        error("can only compare strings and numbers");
    parsePrecedence(250 + 1);
    if (lastT[0] !== left)
        error("operands type for comparison didn't match");
    switch (opType) {
        case 1520:
            emitByte(530);
            break;
        case 1525:
            emitByte(390);
            break;
        case 1550:
            emitByte(810);
            break;
        case 1555:
            emitByte(690);
            break;
        default: error(`unhandled operator ${operator}`);
    }
    lastT = booleanT;
}
function numeric_binary() {
    let operator = prevTok.lexeme;
    assertT(lastT, numberT, `'${operator}' only for numbers`);
    let opType = prevTok.kind;
    parsePrecedence(rules[opType].precedence + 1);
    assertT(lastT, numberT, `'${operator}' only for numbers`);
    switch (opType) {
        case 600:
            emitByte(1500);
            break;
        case 1585:
            emitByte(100);
            break;
        case 1000:
            emitByte(300);
            break;
        case 1100:
            emitByte(900);
            break;
        default: error(`unhandled operator ${operator}`);
    }
}
function concat_str() {
    assertT(lastT, stringT, `'<>' only for strings`);
    parsePrecedence(300 + 1);
    assertT(lastT, stringT, `'<>' only for strings`);
    emitByte(120);
}
function concat_list() {
    let left = lastT;
    if (left[0] !== 470)
        error("'++' only for lists");
    parsePrecedence(300 + 1);
    assertList(left, lastT, "operands type for '++' didn't match");
    emitBytes(110, left[2]);
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
function parse_list() {
    let length = 0;
    let listT = nothingT;
    if (!check(700)) {
        canParseArgument = true;
        lastT = nothingT;
        expression();
        listT = lastT;
        length++;
        while (match(100)) {
            canParseArgument = true;
            lastT = nothingT;
            expression();
            assertT(lastT, listT, `in list[]: expect argument of type ${KindName[listT[0]]}, got ${KindName[lastT[0]]}`);
            length++;
        }
    }
    consume(700, "expect ']' after list elements");
    emitBytes(700, length);
    emitByte(listT[0]);
    lastT = [470, length, listT[0]];
}
function index_list() {
    console.log("in indexlist()");
    if (lastT[0] !== 470)
        error("Can only index a list");
    let listKind = lastT[2];
    lastT = nothingT;
    expression();
    if (lastT[0] !== 500)
        error("Can only use number to index a list");
    consume(700, "expect ']' after indexing");
    emitBytes(600, listKind);
    lastT = [listKind];
}
function parse_return() {
    console.log("in parse_return()");
    expression();
    emitByte(1300);
    lastT = nothingT;
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
    current.locals[current.locals.length - 1].type = { kind: lastT[0] };
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
    emitByte(lastT[0]);
    if (lastT[0] === 470)
        tempNames[name] = { kind: lastT[0], elKind: lastT[2] };
    else
        tempNames[name] = { kind: lastT[0] };
    lastT = nothingT;
}
function get_name(name) {
    let arg = resolveLocal(current, name);
    if (arg != -1) {
        emitBytes(395, arg);
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
function get_global(table, name, isNative) {
    switch (table[name].kind) {
        case 400:
            global_callable(name, table, isNative);
            break;
        case 450:
            global_callable(name, table, isNative);
            break;
        default:
            global_non_callable(table, name, isNative);
    }
}
function global_callable(name_, table, native) {
    if (!canParseArgument) {
        global_non_callable(table, name_, native);
        return;
    }
    canParseArgument = match(200);
    let name = table[name_];
    emitConstant(name.value);
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
            if (canParseArgument)
                expression();
            else
                parsePrecedence(600);
            gotTypes.push(lastT[0]);
            if (!matchType(inputVersion[k], lastT[0])) {
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
    let arity = version[i].input.length;
    if (native)
        emitBytes(200, arity);
    else
        emitBytes(205, arity);
    emitByte(i);
    if (version[i].output === 100)
        lastT = nothingT;
    else
        lastT = [version[i].output];
}
function global_non_callable(table, name, native) {
    console.log("in global_non_callable()");
    let index = makeConstant(new FGString(name));
    if (native)
        emitBytes(400, index);
    else
        emitBytes(500, index);
    console.log(table[name]);
    if (table[name].kind === 470)
        lastT = [470, table[name].length, table[name].elKind];
    else
        lastT = [table[name].kind];
}
function parse_type() {
    advance();
    switch (prevTok.kind) {
        case 2220:
            return booleanT;
        case 2600:
            return numberT;
        case 2900:
            return stringT;
        default:
            error("expect parameter type");
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
    current.locals[current.locals.length - 1].type = { kind: t[0] };
    current.fn.version[0].input.push(t[0]);
    lastT = nothingT;
}
function fn() {
    consume(1700, "expect function name");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));
    begin_compiler(0, name);
    beginScope();
    do {
        parse_params();
    } while (match(100));
    consume(1195, "expect `->` after list of params");
    let t = parse_type();
    current.fn.version[0].output = t[0];
    tempNames[name] = { kind: 450, value: current.fn };
    consume(1500, "expect '=' before fn body");
    expression();
    emitBytes(1300, 1);
    assertT(lastT, t, "return type not match");
    let fn = endCompiler();
    emitConstant(fn);
    emitBytes(1400, index);
    emitByte(450);
}
function proc() {
    consume(1700, "expect procedure name");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));
    begin_compiler(0, name);
    beginScope();
    do {
        parse_params();
    } while (match(100));
    current.fn.version[0].output = 100;
    tempNames[name] = { kind: 450, value: current.fn };
    consume(300, "expect '{' before proc body");
    procBody();
    emitBytes(1300, 0);
    consume(695, "expect '}' after proc body");
    let fn = endCompiler();
    emitConstant(fn);
    emitBytes(1400, index);
    emitByte(450);
}
function procBody() {
    while (!check(695) && !check(2100)) {
        statement();
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
        return expected.includes(actual);
    }
}
function setToKinds(set_) {
    let s = [];
    for (let kind of set_) {
        s.push(KindName[kind]);
    }
    return s;
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
    let openLeft = prevTok.kind === 500;
    expression();
    assertT(lastT, numberT, "start of range must be numeric");
    let start = current.locals.length;
    current.locals.push({ name: "_Start", type: numberType, depth: current.scopeDepth });
    consume(100, "expect ',' between start and end of range");
    expression();
    assertT(lastT, numberT, "end of range must be numeric");
    current.locals.push({ name: "_End", type: numberType, depth: current.scopeDepth });
    if (match(100)) {
        expression();
        assertT(lastT, numberT, "step of range must be numeric");
    }
    else {
        emitConstant(new FGNumber(1));
    }
    current.locals.push({ name: "_Step", type: numberType, depth: current.scopeDepth });
    let openRight;
    if (match(800)) {
        openRight = true;
    }
    else {
        openRight = false;
        consume(700, "expect ']' in range");
    }
    if (!match(1700))
        error_at_current("expect name for iterator");
    let name = prevTok.lexeme;
    current.locals[start].name = name;
    emitByte(1410);
    emitByte(805);
    let openLeftJump = openLeft ? emitJump(615) : -1;
    let loopStart = currentChunk().code.length;
    if (openRight)
        emitBytes(210, start);
    else
        emitBytes(215, start);
    let exitJump = emitJump(620);
    emitByte(1200);
    if (match(300)) {
        block();
        while (current.locals.length > start + 3) {
            emitByte(1200);
            current.locals.pop();
        }
    }
    else {
        statement();
    }
    if (openLeftJump !== -1)
        patchJump(openLeftJump);
    emitBytes(595, start);
    emitLoop(loopStart);
    patchJump(exitJump);
    emitByte(1200);
    endScope();
    lastT = nothingT;
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
    assertT(lastT, nothingT, "expression statement is not supported");
}
function beginScope() {
    current.scopeDepth++;
}
function block() {
    while (!check(695) && !check(2100))
        declaration();
    consume(695, "expect '}' at the end of block");
}
function endScope() {
    current.scopeDepth--;
    while (current.locals.length > 0
        && current.locals[current.locals.length - 1].depth > current.scopeDepth) {
        emitByte(1200);
        current.locals.pop();
    }
}
class CompileError extends Error {
}
export const compiler = {
    compile(source) {
        tempNames = {};
        prevTok = invalidTok;
        currTok = invalidTok;
        lastT = nothingT;
        scanner.init(source);
        begin_compiler(2, "TOP");
        try {
            advance();
            while (!match(2100))
                declaration();
            return { ok: true, value: endCompiler() };
        }
        catch (error) {
            if (error instanceof Error)
                return { ok: false, error };
            return { ok: false, error: new Error("unknown error") };
        }
    }
};
