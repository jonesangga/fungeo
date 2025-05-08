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
    Precedence[Precedence["Term"] = 300] = "Term";
    Precedence[Precedence["Factor"] = 400] = "Factor";
    Precedence[Precedence["Unary"] = 500] = "Unary";
    Precedence[Precedence["Call"] = 600] = "Call";
    Precedence[Precedence["Primary"] = 700] = "Primary";
})(Precedence || (Precedence = {}));
const rules = {
    [1200]: { prefix: unary, infix: null, precedence: 100 },
    [1300]: { prefix: null, infix: null, precedence: 100 },
    [1400]: { prefix: null, infix: null, precedence: 100 },
    [100]: { prefix: null, infix: null, precedence: 100 },
    [200]: { prefix: null, infix: null, precedence: 100 },
    [2100]: { prefix: null, infix: null, precedence: 100 },
    [1500]: { prefix: null, infix: null, precedence: 100 },
    [2200]: { prefix: null, infix: null, precedence: 100 },
    [2000]: { prefix: parse_boolean, infix: null, precedence: 100 },
    [600]: { prefix: grouping, infix: null, precedence: 100 },
    [400]: { prefix: grouping, infix: null, precedence: 100 },
    [800]: { prefix: unary, infix: binary, precedence: 300 },
    [1600]: { prefix: parse_name, infix: null, precedence: 100 },
    [1700]: { prefix: parse_number, infix: null, precedence: 100 },
    [1585]: { prefix: null, infix: binary, precedence: 300 },
    [1590]: { prefix: null, infix: binary_str, precedence: 300 },
    [700]: { prefix: null, infix: null, precedence: 100 },
    [500]: { prefix: null, infix: null, precedence: 100 },
    [300]: { prefix: null, infix: null, precedence: 100 },
    [1000]: { prefix: null, infix: binary, precedence: 400 },
    [1100]: { prefix: null, infix: binary, precedence: 400 },
    [1800]: { prefix: parse_string, infix: null, precedence: 100 },
    [1900]: { prefix: parse_boolean, infix: null, precedence: 100 },
};
let invalidToken = { kind: 2100, line: -1, lexeme: "" };
let parser = {
    current: invalidToken,
    previous: invalidToken,
};
let compilingChunk;
function currentChunk() {
    return compilingChunk;
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
    consume(500, "expect ')' after grouping");
}
function unary() {
    let operatorType = parser.previous.kind;
    parsePrecedence(500);
    switch (operatorType) {
        case 1200:
            if (lastType.kind !== 300) {
                error("'!' only for boolean");
            }
            emitByte(1100);
            break;
        case 800:
            if (lastType.kind !== 500) {
                error("'-' only for number");
            }
            emitByte(1000);
            break;
        default:
            error("unhandled unary op");
    }
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
        case 800:
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
        error(`'${operator}' only for string`);
    }
    let operatorType = parser.previous.kind;
    let rule = rules[operatorType];
    parsePrecedence(rule.precedence + 1);
    if (lastType.kind !== 600) {
        error(`'${operator}' only for string`);
    }
    emitByte(120);
}
function parse_boolean() {
    if (parser.previous.kind === 1900)
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
function parse_name() {
    let name = parser.previous.lexeme;
    if (Object.hasOwn(nativeNames, name)) {
        canAssign = false;
        if (check(1500))
            error(`${name} already defined`);
        if (nativeNames[name].kind === 400)
            parse_callable(name);
        else
            parse_non_callable(nativeNames, name, true);
    }
    else if (Object.hasOwn(userNames, name)) {
        canAssign = false;
        if (check(1500))
            error(`${name} already defined`);
        if (userNames[name].kind === 400)
            parse_callable(name);
        else
            parse_non_callable(userNames, name, false);
    }
    else if (Object.hasOwn(tempNames, name)) {
        canAssign = false;
        if (check(1500))
            error(`${name} already defined`);
        if (tempNames[name].kind === 400)
            parse_callable(name);
        else
            parse_non_callable(tempNames, name, false);
    }
    else {
        if (!canAssign) {
            error(`undefined name ${name}`);
        }
        else {
            canAssign = false;
            parse_definition(name);
        }
    }
}
function matchType(expected, actual) {
    console.log(expected, actual);
    if (expected === 200) {
        console.log("type any");
        return true;
    }
    else if (typeof expected === "number") {
        console.log("type number");
        return actual === expected;
    }
    else {
        console.log("type Set");
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
function parse_callable(name_) {
    console.log("in parse_callable()");
    if (!canParseArgument) {
        lastType = nativeNames[name_];
        return;
    }
    canParseArgument = match(200);
    console.log("can parse argument");
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
                console.log(`inputVersion[${k}] is ${inputVersion[k]}`);
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
function parse_non_callable(table, name, native) {
    let index = makeConstant(new FGString(name));
    if (native)
        emitBytes(400, index);
    else
        emitBytes(500, index);
    lastType = { kind: table[name].kind };
    console.log("in parse_non_callable() lastType = ", lastType);
}
function parse_definition(name) {
    let index = makeConstant(new FGString(name));
    consume(1500, "expect '=' after variable declaration");
    lastType = invalidType;
    canParseArgument = true;
    expression();
    emitBytes(1400, index);
    emitByte(lastType.kind);
    tempNames[name] = { kind: lastType.kind };
    lastType = invalidType;
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
    if (match(1600)) {
        canParseArgument = true;
        canAssign = true;
        parse_name();
    }
    else if (match(300)) {
    }
    else {
        error_at_current(`cannot start statement with ${TokenTName[parser.current.kind]}`);
    }
    if (lastType !== invalidType) {
        error("forbidden expression statement");
    }
}
class CompileError extends Error {
}
const compiler = {
    compile(source, chunk) {
        scanner.init(source);
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
                console.log(error);
                return { success: false, message: error.message };
            }
            else {
                console.log(error);
                return { success: false, message: error.message };
            }
        }
    }
};
export { compiler };
