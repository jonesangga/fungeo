import { TokenTName, scanner } from "./scanner.js";
import { KindName, FGBoolean, FGNumber, FGString, FGCallable } from "./value.js";
import { names } from "./names.js";
let invalidType = { kind: 0 };
let numberType = { kind: 4 };
let lastType = invalidType;
let canParseArgument = false;
let canAssign = false;
var Precedence;
(function (Precedence) {
    Precedence[Precedence["None"] = 0] = "None";
    Precedence[Precedence["Assignment"] = 1] = "Assignment";
    Precedence[Precedence["Term"] = 2] = "Term";
    Precedence[Precedence["Factor"] = 3] = "Factor";
    Precedence[Precedence["Unary"] = 4] = "Unary";
    Precedence[Precedence["Call"] = 5] = "Call";
    Precedence[Precedence["Primary"] = 6] = "Primary";
})(Precedence || (Precedence = {}));
const rules = {
    [11]: { prefix: unary, infix: null, precedence: 0 },
    [12]: { prefix: null, infix: null, precedence: 0 },
    [13]: { prefix: null, infix: null, precedence: 0 },
    [0]: { prefix: null, infix: null, precedence: 0 },
    [1]: { prefix: null, infix: null, precedence: 0 },
    [20]: { prefix: null, infix: null, precedence: 0 },
    [14]: { prefix: null, infix: null, precedence: 0 },
    [21]: { prefix: null, infix: null, precedence: 0 },
    [19]: { prefix: parse_boolean, infix: null, precedence: 0 },
    [5]: { prefix: grouping, infix: null, precedence: 0 },
    [3]: { prefix: grouping, infix: null, precedence: 0 },
    [7]: { prefix: unary, infix: binary, precedence: 2 },
    [15]: { prefix: parse_name, infix: null, precedence: 0 },
    [16]: { prefix: parse_number, infix: null, precedence: 0 },
    [8]: { prefix: null, infix: binary, precedence: 2 },
    [6]: { prefix: null, infix: null, precedence: 0 },
    [4]: { prefix: null, infix: null, precedence: 0 },
    [2]: { prefix: null, infix: null, precedence: 0 },
    [9]: { prefix: null, infix: binary, precedence: 3 },
    [10]: { prefix: null, infix: binary, precedence: 3 },
    [17]: { prefix: parse_string, infix: null, precedence: 0 },
    [18]: { prefix: parse_boolean, infix: null, precedence: 0 },
};
let invalidToken = { kind: 20, line: -1, lexeme: "" };
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
    if (token.kind === 20)
        result += ": at end";
    else if (token.kind === 21)
        result += ": scanner";
    else
        result += `: at '${token.lexeme}'`;
    result += `: ${message}\n`;
    throw new CompileError(result);
}
function advance() {
    parser.previous = parser.current;
    parser.current = scanner.next();
    if (parser.current.kind === 21) {
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
    emitBytes(7, makeConstant(value));
}
function emitReturn() {
    emitByte(12);
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
    consume(4, "expect ')' after grouping");
}
function unary() {
    let operatorType = parser.previous.kind;
    parsePrecedence(4);
    switch (operatorType) {
        case 11:
            if (lastType.kind !== 2) {
                error("'!' only for boolean");
            }
            emitByte(10);
            break;
        case 7:
            if (lastType.kind !== 4) {
                error("'-' only for number");
            }
            emitByte(9);
            break;
        default:
            error("unhandled unary op");
    }
}
function binary() {
    let operator = parser.previous.lexeme;
    if (lastType.kind !== 4) {
        error(`'${operator}' only for numbers`);
    }
    let operatorType = parser.previous.kind;
    let rule = rules[operatorType];
    parsePrecedence(rule.precedence + 1);
    if (lastType.kind !== 4) {
        error(`'${operator}' only for numbers`);
    }
    switch (operatorType) {
        case 8:
            emitByte(0);
            break;
        case 7:
            emitByte(14);
            break;
        case 10:
            emitByte(8);
            break;
        case 9:
            emitByte(2);
            break;
        default: error("unhandled binary op");
    }
}
function parse_boolean() {
    if (parser.previous.kind === 18)
        emitConstant(new FGBoolean(true));
    else
        emitConstant(new FGBoolean(false));
    lastType = { kind: 2 };
}
function parse_number() {
    let value = Number(parser.previous.lexeme);
    emitConstant(new FGNumber(value));
    lastType = numberType;
}
function parse_string() {
    emitConstant(new FGString(parser.previous.lexeme));
    lastType = { kind: 5 };
}
let tempNames = {};
function parse_name() {
    let name = parser.previous.lexeme;
    if (Object.hasOwn(names, name)) {
        canAssign = false;
        if (check(14))
            error(`${name} already defined`);
        if (names[name].kind === 3)
            parse_callable(name);
        else
            parse_non_callable(names, name);
    }
    else if (Object.hasOwn(tempNames, name)) {
        canAssign = false;
        if (check(14))
            error(`${name} already defined`);
        if (tempNames[name].kind === 3)
            parse_callable(name);
        else
            parse_non_callable(tempNames, name);
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
    if (expected === 1) {
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
    if (!canParseArgument) {
        lastType = names[name_];
        return;
    }
    canParseArgument = match(1);
    let name = names[name_];
    let version = name.version;
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
    emitBytes(1, i);
    emitConstant(new FGCallable(name.call));
    if (version[i].output === 0) {
        lastType = invalidType;
    }
    else {
        lastType = { kind: version[i].output };
    }
}
function parse_non_callable(table, name) {
    let index = makeConstant(new FGString(name));
    emitBytes(4, index);
    lastType = { kind: table[name].kind };
    console.log("in parse_non_callable() lastType = ", lastType);
}
function parse_definition(name) {
    let index = makeConstant(new FGString(name));
    consume(14, "expect '=' after variable declaration");
    lastType = invalidType;
    canParseArgument = true;
    expression();
    emitBytes(13, index);
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
    parsePrecedence(1);
}
function identifierConstant(name) {
    return makeConstant(new FGString(name.lexeme));
}
function call(name) {
    let constant = currentChunk().add_value(new FGString(name));
    let argCount = 0;
    do {
        expression();
        argCount++;
    } while (!match(20));
    emitBytes(1, constant);
    emitByte(argCount);
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
    if (match(15)) {
        canParseArgument = true;
        canAssign = true;
        parse_name();
    }
    else if (match(2)) {
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
            while (!match(20)) {
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
