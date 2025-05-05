import { scanner } from "./scanner.js";
import { KindName, FGNumber, FGString, FGCallable } from "./value.js";
import { names } from "./names.js";
let source = "";
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
    Precedence[Precedence["PREC_PRIMARY"] = 6] = "PREC_PRIMARY";
})(Precedence || (Precedence = {}));
let parser = {
    current: { kind: 20, line: 0 },
    previous: { kind: 20, line: 0 },
};
let compilingChunk;
function currentChunk() {
    return compilingChunk;
}
function emitReturn() {
    emitByte(12);
}
function endCompiler() {
    emitReturn();
}
function errorAtCurrent(message) {
    errorAt(parser.current, message);
}
function error(message) {
    errorAt(parser.previous, message);
}
function errorAt(token, message) {
    let result = "";
    result += `[line ${token.line}] Error`;
    if (token.kind === 20) {
        result += " at end";
    }
    else if (token.kind === 21) {
    }
    else {
        result += ` at '${token.errorMessage}'`;
    }
    result += `: ${message}\n`;
    throw new CompileError(message);
}
function consume(kind, message) {
    if (parser.current.kind === kind) {
        advance();
        return;
    }
    errorAtCurrent(message);
}
function check(kind) {
    return parser.current.kind === kind;
}
function match(kind) {
    if (!check(kind))
        return false;
    advance();
    return true;
}
function advance() {
    parser.previous = parser.current;
    for (;;) {
        parser.current = scanner.next();
        if (parser.current.kind !== 21)
            break;
        errorAtCurrent(parser.current.errorMessage);
    }
}
function emitByte(byte) {
    currentChunk().write(byte, parser.previous.line);
}
function emitBytes(byte1, byte2) {
    emitByte(byte1);
    emitByte(byte2);
}
function makeConstant(value) {
    return currentChunk().add_value(value);
}
function emitConstant(value) {
    emitBytes(7, makeConstant(value));
}
function grouping() {
    canParseArgument = true;
    expression();
    consume(4, "Expect ')' after expression.");
}
function binary() {
    let operatorType = parser.previous.kind;
    let rule = getRule(operatorType);
    parsePrecedence(rule.precedence + 1);
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
        default: return;
    }
}
function literal() {
    switch (parser.previous.kind) {
        case 19:
            emitByte(3);
            break;
        case 18:
            emitByte(15);
            break;
        default: return;
    }
}
function parse_number() {
    let value = Number(parser.previous.lexeme);
    emitConstant(new FGNumber(value));
    lastType = numberType;
}
function parsestring() {
    emitConstant(new FGString(parser.previous.lexeme));
    lastType = { kind: 5 };
}
let tempNames = {};
function parse_name() {
    let name = parser.previous.lexeme;
    if (Object.hasOwn(names, name)) {
        canAssign = false;
        if (check(14)) {
            error(`Use := to reassign`);
        }
        if (check(13)) {
            error(`:= is coming soon`);
        }
        if (names[name].kind === 3) {
            parse_callable(name);
        }
        else {
            parse_non_callable(names, name);
        }
    }
    else if (Object.hasOwn(tempNames, name)) {
        canAssign = false;
        if (check(14)) {
            error(`Use := to reassign`);
        }
        if (check(13)) {
            error(`:= is coming soon`);
        }
        if (tempNames[name].kind === 3) {
            parse_callable(name);
        }
        else {
            parse_non_callable(tempNames, name);
        }
    }
    else {
        if (!canAssign) {
            error(`undefined variable ${name}`);
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
    consume(14, "Expect '=' after variable declaration");
    lastType = invalidType;
    canParseArgument = true;
    expression();
    emitBytes(13, index);
    emitByte(lastType.kind);
    tempNames[name] = { kind: lastType.kind };
    lastType = invalidType;
}
function parse_reassignment(name) {
    let index = makeConstant(new FGString(name));
    lastType = invalidType;
    canParseArgument = true;
    expression();
    emitBytes(13, index);
    emitByte(lastType.kind);
}
function unary() {
    let operatorType = parser.previous.kind;
    parsePrecedence(4);
    switch (operatorType) {
        case 11:
            emitByte(10);
            break;
        case 7:
            emitByte(9);
            break;
        default: return;
    }
}
function parsePrecedence(precedence) {
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
    console.log(parser.previous.kind);
}
function curr() {
    console.log(parser.current.kind);
}
class CompileError extends Error {
}
let rules = [];
rules[3] = { prefix: grouping, infix: null, precedence: 0 };
rules[4] = { prefix: null, infix: null, precedence: 0 };
rules[6] = { prefix: null, infix: null, precedence: 0 };
rules[0] = { prefix: null, infix: null, precedence: 0 };
rules[13] = { prefix: null, infix: null, precedence: 0 };
rules[12] = { prefix: null, infix: null, precedence: 0 };
rules[2] = { prefix: null, infix: null, precedence: 0 };
rules[20] = { prefix: null, infix: null, precedence: 0 };
rules[16] = { prefix: parse_number, infix: null, precedence: 0 };
rules[8] = { prefix: null, infix: binary, precedence: 2 };
rules[7] = { prefix: unary, infix: binary, precedence: 2 };
rules[10] = { prefix: null, infix: binary, precedence: 3 };
rules[9] = { prefix: null, infix: binary, precedence: 3 };
rules[19] = { prefix: literal, infix: null, precedence: 0 };
rules[18] = { prefix: literal, infix: null, precedence: 0 };
rules[11] = { prefix: unary, infix: null, precedence: 0 };
rules[17] = { prefix: parsestring, infix: null, precedence: 0 };
rules[15] = { prefix: parse_name, infix: null, precedence: 0 };
function getRule(kind) {
    return rules[kind];
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
        error(`after declaration -> statement: no grammar for ${parser.current.kind}`);
    }
    if (lastType !== invalidType) {
        error("Doesn't support expression statement");
    }
}
const compiler = {
    compile(source_, chunk) {
        source = source_;
        scanner.init(source_);
        compilingChunk = chunk;
        tempNames = {};
        advance();
        try {
            while (!match(20)) {
                declaration();
            }
            endCompiler();
            return { status: true };
        }
        catch (error) {
            if (error instanceof CompileError) {
                console.log("catch CompileError");
                console.log(error);
                return { status: false, message: error.message };
            }
            else {
                console.log("catch Error");
                console.log(error);
                return { status: false, message: error.message };
            }
        }
    }
};
export { compiler };
