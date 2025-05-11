import { TokenTName, scanner } from "./scanner.js";
import { KindName, FGBoolean, FGNumber, FGString } from "./value.js";
import { nativeNames, userNames } from "./names.js";
let invalidType = { kind: 100 };
let numberType = { kind: 500 };
let lastType = invalidType;
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
    [1520]: { prefix: null, infix: compare, precedence: 250 },
    [1525]: { prefix: null, infix: compare, precedence: 250 },
    [2400]: { prefix: null, infix: null, precedence: 100 },
    [300]: { prefix: null, infix: null, precedence: 100 },
    [400]: { prefix: null, infix: null, precedence: 100 },
    [1550]: { prefix: null, infix: compare, precedence: 250 },
    [1555]: { prefix: null, infix: compare, precedence: 250 },
    [500]: { prefix: grouping, infix: null, precedence: 100 },
    [600]: { prefix: negate, infix: binary, precedence: 300 },
    [1700]: { prefix: parse_name, infix: null, precedence: 100 },
    [1800]: { prefix: parse_number, infix: null, precedence: 100 },
    [1575]: { prefix: null, infix: null, precedence: 300 },
    [1580]: { prefix: null, infix: or_, precedence: 210 },
    [1585]: { prefix: null, infix: binary, precedence: 300 },
    [1590]: { prefix: null, infix: binary_str, precedence: 300 },
    [695]: { prefix: null, infix: null, precedence: 100 },
    [700]: { prefix: null, infix: null, precedence: 100 },
    [800]: { prefix: null, infix: null, precedence: 100 },
    [900]: { prefix: null, infix: null, precedence: 100 },
    [1000]: { prefix: null, infix: binary, precedence: 400 },
    [1100]: { prefix: null, infix: binary, precedence: 400 },
    [1900]: { prefix: parse_string, infix: null, precedence: 100 },
    [2000]: { prefix: parse_boolean, infix: null, precedence: 100 },
};
let current = { locals: [], scopeDepth: 0 };
let invalidToken = { kind: 2100, line: -1, lexeme: "" };
let parser = {
    current: invalidToken,
    previous: invalidToken,
};
let compilingChunk;
function currentChunk() {
    return compilingChunk;
}
function init_compiler(compiler) {
    compiler.locals = [];
    compiler.scopeDepth = 0;
    current = compiler;
}
function error_at_current(message) {
    error_at(parser.current, message);
}
function error(message) {
    error_at(parser.previous, message);
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
    parser.previous = parser.current;
    parser.current = scanner.next();
    if (parser.current.kind === 2200) {
        error_at_current(parser.current.lexeme);
    }
}
function check(kind) {
    return parser.current.kind === kind;
}
function match(kind) {
    if (parser.current.kind === kind) {
        advance();
        return true;
    }
    return false;
}
function consume(kind, message) {
    if (parser.current.kind === kind) {
        advance();
        return;
    }
    error_at_current(message);
}
function emitByte(byte) {
    currentChunk().write(byte, parser.previous.line);
}
function emitBytes(byte1, byte2) {
    emitByte(byte1);
    emitByte(byte2);
}
function emitConstant(value) {
    emitBytes(800, makeConstant(value));
}
function emitReturn() {
    emitByte(1300);
}
function endCompiler() {
    emitReturn();
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
    if (lastType.kind !== 300) {
        error(`'!' is only for boolean`);
    }
    emitByte(1100);
}
function negate() {
    parsePrecedence(500);
    if (lastType.kind !== 500) {
        error(`'-' is only for number`);
    }
    emitByte(1000);
}
function eq() {
    parsePrecedence(230 + 1);
    emitByte(380);
    lastType = { kind: 300 };
}
function neq() {
    parsePrecedence(230 + 1);
    emitByte(1010);
    lastType = { kind: 300 };
}
function compare() {
    let operator = parser.previous.kind;
    let left = lastType.kind;
    if (left !== 500 && left !== 600)
        error("can only compare strings or numbers");
    parsePrecedence(250 + 1);
    if (lastType.kind !== left)
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
    lastType = { kind: 300 };
}
function binary() {
    let operator = parser.previous.lexeme;
    if (lastType.kind !== 500) {
        error(`'${operator}' only for numbers`);
    }
    let operatorType = parser.previous.kind;
    let rule = rules[operatorType];
    parsePrecedence(rule.precedence + 1);
    if (lastType.kind !== 500) {
        error(`'${operator}' only for numbers`);
    }
    switch (operatorType) {
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
    let operator = parser.previous.lexeme;
    if (lastType.kind !== 600) {
        error(`'${operator}' only for strings`);
    }
    let operatorType = parser.previous.kind;
    let rule = rules[operatorType];
    parsePrecedence(rule.precedence + 1);
    if (lastType.kind !== 600) {
        error(`'${operator}' only for strings`);
    }
    emitByte(120);
}
function parse_boolean() {
    if (parser.previous.kind === 2000)
        emitConstant(new FGBoolean(true));
    else
        emitConstant(new FGBoolean(false));
    lastType = { kind: 300 };
}
function parse_number() {
    let value = Number(parser.previous.lexeme);
    emitConstant(new FGNumber(value));
    lastType = numberType;
}
function parse_string() {
    emitConstant(new FGString(parser.previous.lexeme));
    lastType = { kind: 600 };
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
    let name = parser.previous.lexeme;
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
        if (local.depth !== -1 && local.depth < current.scopeDepth) {
            break;
        }
        if (name === local.name) {
            error(`${name} already defined in this scope`);
        }
    }
    add_local(name);
    lastType = invalidType;
    canParseArgument = true;
    expression();
    emitByte(1410);
    current.locals[current.locals.length - 1].type = { kind: lastType.kind };
    lastType = invalidType;
}
function set_global(name) {
    if (Object.hasOwn(nativeNames, name)
        || Object.hasOwn(userNames, name)
        || Object.hasOwn(tempNames, name)) {
        error(`${name} already defined`);
    }
    let index = makeConstant(new FGString(name));
    lastType = invalidType;
    canParseArgument = true;
    expression();
    emitBytes(1400, index);
    emitByte(lastType.kind);
    tempNames[name] = { kind: lastType.kind };
    lastType = invalidType;
}
function get_name(name) {
    let arg = resolveLocal(current, name);
    if (arg != -1) {
        emitBytes(395, arg);
        lastType = current.locals[arg].type;
    }
    else if (Object.hasOwn(nativeNames, name)) {
        if (nativeNames[name].kind === 400)
            global_callable(name);
        else
            global_non_callable(nativeNames, name, true);
    }
    else if (Object.hasOwn(userNames, name)) {
        if (userNames[name].kind === 400)
            global_callable(name);
        else
            global_non_callable(userNames, name, false);
    }
    else if (Object.hasOwn(tempNames, name)) {
        if (tempNames[name].kind === 400)
            global_callable(name);
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
function global_callable(name_) {
    if (!canParseArgument) {
        lastType = nativeNames[name_];
        return;
    }
    canParseArgument = match(200);
    let name = nativeNames[name_];
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
            lastType = invalidType;
            expression();
            gotTypes.push(lastType.kind);
            if (!matchType(inputVersion[k], lastType.kind)) {
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
    emitBytes(200, index);
    emitByte(i);
    if (version[i].output === 100) {
        lastType = invalidType;
    }
    else {
        lastType = { kind: version[i].output };
    }
}
function global_non_callable(table, name, native) {
    let index = makeConstant(new FGString(name));
    if (native)
        emitBytes(400, index);
    else
        emitBytes(500, index);
    lastType = { kind: table[name].kind };
}
function add_local(name) {
    let local = { name, type: invalidType, depth: current.scopeDepth };
    current.locals.push(local);
}
function emitJump(instruction) {
    emitByte(instruction);
    emitByte(0);
    return currentChunk().code.length - 1;
}
function patchJump(offset) {
    let jump = currentChunk().code.length - offset - 1;
    currentChunk().code[offset] = jump;
}
function parse_if() {
    expression();
    if (lastType.kind !== 300) {
        error(`conditional expression must be boolean`);
    }
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
function and_() {
    if (lastType.kind !== 300) {
        error("operands of '&&' must be boolean");
    }
    let endJump = emitJump(620);
    emitByte(1200);
    parsePrecedence(220);
    if (lastType.kind !== 300) {
        error("operands of '&&' must be boolean");
    }
    patchJump(endJump);
}
function or_() {
    if (lastType.kind !== 300) {
        error("operands of '||' must be boolean");
    }
    let elseJump = emitJump(620);
    let endJump = emitJump(615);
    patchJump(elseJump);
    emitByte(1200);
    parsePrecedence(210);
    if (lastType.kind !== 300) {
        error("operands of '||' must be boolean");
    }
    patchJump(endJump);
}
function parsePrecedence(precedence) {
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
function expression() {
    parsePrecedence(200);
}
function identifierConstant(name) {
    return makeConstant(new FGString(name.lexeme));
}
function prev() {
    console.log(TokenTName[parser.previous.kind]);
}
function curr() {
    console.log(TokenTName[parser.current.kind]);
}
function declaration() {
    statement();
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
    else if (match(900)) {
    }
    else {
        error_at_current(`cannot start statement with ${TokenTName[parser.current.kind]}`);
    }
    if (lastType !== invalidType) {
        error("forbidden expression statement");
    }
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
    compile(source, chunk) {
        scanner.init(source);
        let comp = { locals: [], scopeDepth: 0 };
        init_compiler(comp);
        compilingChunk = chunk;
        tempNames = {};
        parser.previous = invalidToken;
        parser.current = invalidToken;
        try {
            advance();
            while (!match(2100)) {
                declaration();
            }
            endCompiler();
            return { success: true };
        }
        catch (error) {
            if (error instanceof CompileError) {
                return { success: false, message: error.message };
            }
            else {
                return { success: false, message: error.message };
            }
        }
    }
};
export { compiler };
