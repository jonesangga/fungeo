import { TokenTName, scanner } from "./scanner.js";
import { Chunk } from "./chunk.js";
import { FGCurry, FGBoolean, FGNumber, FGString, FGCallNative, FGCallUser, FGType } from "./value.js";
import { nativeNames } from "./names.js";
import { userNames } from "./vm.js";
import { StructT, NumberT, StringT, ListT, neverT, circleT, numberT, stringT, booleanT, callUserT, CallNativeT, CallUserT, nothingT } from "./type.js";
let $ = console.log;
let lastT = neverT;
let returnT = neverT;
function assertT(actual, expected, msg) {
    if (!actual.equal(expected))
        error(msg);
}
let canParseArgument = false;
let canParseBlock = false;
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
    [1650]: { prefix: parse_callable, infix: null, precedence: 100 },
    [2230]: { prefix: null, infix: null, precedence: 100 },
    [1300]: { prefix: null, infix: null, precedence: 100 },
    [1400]: { prefix: null, infix: null, precedence: 100 },
    [100]: { prefix: null, infix: null, precedence: 100 },
    [1450]: { prefix: null, infix: boolean_isdiv, precedence: 300 },
    [200]: { prefix: null, infix: null, precedence: 100 },
    [210]: { prefix: null, infix: index_struct, precedence: 600 },
    [2300]: { prefix: null, infix: null, precedence: 100 },
    [2100]: { prefix: null, infix: null, precedence: 100 },
    [1500]: { prefix: null, infix: null, precedence: 100 },
    [1505]: { prefix: null, infix: eq, precedence: 230 },
    [2200]: { prefix: null, infix: null, precedence: 100 },
    [1700]: { prefix: parse_boolean, infix: null, precedence: 100 },
    [2320]: { prefix: null, infix: null, precedence: 100 },
    [2450]: { prefix: null, infix: null, precedence: 100 },
    [1520]: { prefix: null, infix: boolean_compare, precedence: 250 },
    [1525]: { prefix: null, infix: boolean_compare, precedence: 250 },
    [250]: { prefix: length_list, infix: null, precedence: 100 },
    [2400]: { prefix: null, infix: null, precedence: 100 },
    [2405]: { prefix: parse_ifx, infix: null, precedence: 100 },
    [300]: { prefix: null, infix: null, precedence: 100 },
    [400]: { prefix: parse_list, infix: index_list, precedence: 600 },
    [1550]: { prefix: null, infix: boolean_compare, precedence: 250 },
    [1555]: { prefix: null, infix: boolean_compare, precedence: 250 },
    [500]: { prefix: grouping, infix: null, precedence: 100 },
    [1560]: { prefix: null, infix: concat_str, precedence: 300 },
    [2460]: { prefix: null, infix: null, precedence: 100 },
    [2500]: { prefix: null, infix: null, precedence: 100 },
    [600]: { prefix: negate, infix: numeric_binary, precedence: 300 },
    [2540]: { prefix: parse_non_callable, infix: null, precedence: 100 },
    [2550]: { prefix: null, infix: null, precedence: 100 },
    [1800]: { prefix: parse_number, infix: null, precedence: 100 },
    [2600]: { prefix: null, infix: null, precedence: 100 },
    [670]: { prefix: struct_init, infix: null, precedence: 100 },
    [1575]: { prefix: null, infix: pipe, precedence: 600 },
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
    [2910]: { prefix: null, infix: null, precedence: 100 },
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
        fn: new FGCallUser(name, 0, [], nothingT, new Chunk(name)),
        kind: kind,
        locals: [],
        localGlobals: [],
        scopeDepth: 0,
    };
    current = compiler;
}
function endCompiler() {
    emitReturn();
    let fn = current.fn;
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
    emitByte(1150);
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
    let left = lastT;
    if (!(left instanceof NumberT) && !(left instanceof StringT))
        error("can only compare strings and numbers");
    parsePrecedence(250 + 1);
    if (left.constructor !== lastT.constructor)
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
    canParseArgument = true;
    parsePrecedence(300 + 1);
    assertT(lastT, stringT, `'<>' only for strings`);
    emitByte(120);
}
function concat_list() {
    $("in concat_list()");
    let leftT = lastT;
    $(leftT);
    if (!(leftT instanceof ListT))
        error("'++' only for lists");
    parsePrecedence(300 + 1);
    assertT(leftT, lastT, "operands type for '++' didn't match");
    emitConstant(new FGType(leftT));
    emitByte(110);
}
function pipe() {
    let argT = lastT;
    parsePrecedence(600 + 1);
    if (!(lastT instanceof CallNativeT) && !(lastT instanceof CallUserT))
        error("can only pipe to function");
    assertT(lastT.input[lastT.input.length - 1], argT, `argT non match`);
    lastT = lastT.output;
    emitByte(1190);
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
function index_struct() {
    if (!(lastT instanceof StructT))
        error("can only index a struct");
    let members = lastT.members;
    let keys = Object.keys(members);
    let types = Object.values(members);
    lastT = neverT;
    consume(2540, "expect member name");
    let name = prevTok.lexeme;
    if (!keys.includes(name))
        error(`no member named ${name} in this struct`);
    emitConstant(new FGString(name));
    emitByte(850);
    lastT = members[name];
}
function struct_init() {
    consume(1650, "expect struct name");
    let name_ = prevTok.lexeme;
    consume(300, "expect '{' to after struct name");
    if (!Object.hasOwn(userNames, name_))
        error(`no struct ${name_} in userNames`);
    let name = userNames[name_];
    if (!(name.value instanceof FGType))
        error(`${name_} is not an FGType`);
    emitConstant(name.value);
    let struct = name.value.value;
    if (!(struct instanceof StructT))
        error(`${name_} is not a struct`);
    let members = struct.members;
    let types = Object.values(members);
    let i = 0;
    for (; i < types.length; i++) {
        lastT = nothingT;
        canParseArgument = true;
        expression();
        if (!types[i].equal(lastT))
            error(`in ${name_}: expect arg ${i} of type ${types[i].to_str()}, got ${lastT.to_str()}`);
        if (i < types.length - 1)
            consume(100, "expect ',' to after struct members");
    }
    consume(695, "expect '}' to after struct members");
    emitBytes(1450, types.length);
    lastT = struct;
}
function parse_list() {
    let length = 0;
    let elType = nothingT;
    if (!check(700)) {
        canParseArgument = true;
        lastT = neverT;
        expression();
        elType = lastT;
        length++;
        while (match(100)) {
            canParseArgument = true;
            lastT = neverT;
            expression();
            assertT(lastT, elType, `in list[]: expect member of type ${elType.to_str()}, got ${lastT.to_str()}`);
            length++;
        }
    }
    consume(700, "expect ']' after list elements");
    emitConstant(new FGType(elType));
    emitBytes(700, length);
    lastT = new ListT(elType);
}
function index_list() {
    if (!(lastT instanceof ListT))
        error("Can only index a list");
    let elType = lastT.elType;
    lastT = neverT;
    expression();
    assertT(lastT, numberT, "Can only use number to index a list");
    consume(700, "expect ']' after indexing");
    emitByte(600);
    lastT = elType;
}
function length_list() {
    lastT = neverT;
    expression();
    if (!(lastT instanceof ListT))
        error("'#' only for lists");
    emitByte(680);
    lastT = numberT;
}
function parse_return() {
    $("in parse_return()");
    expression();
    emitBytes(1300, 1);
    returnT = lastT;
    lastT = nothingT;
}
let tempNames = {};
function resolveLocal(compiler, name) {
    for (let i = compiler.locals.length - 1; i >= 0; i--) {
        if (name === compiler.locals[i].name) {
            return i;
        }
    }
    return -1;
}
function parse_let() {
    $("in parse_let()");
    consume(2540, "expect a name");
    let name = prevTok.lexeme;
    consume(1500, "expect '=' after name");
    if (current.scopeDepth > 0) {
        set_block(name);
    }
    else {
        error("cannot use 'let' in non block");
    }
}
function parse_mut() {
    $("in parse_mut()");
    consume(2540, "expect a name");
    let name = prevTok.lexeme;
    consume(1500, "expect '=' after name");
    if (current.scopeDepth > 0) {
        set_local(name, true);
    }
    else {
        set_mut(name);
    }
}
function set_mut(name) {
    if (Object.hasOwn(nativeNames, name)
        || Object.hasOwn(userNames, name)
        || Object.hasOwn(tempNames, name)) {
        error(`${name} already defined`);
    }
    let index = makeConstant(new FGString(name));
    lastT = neverT;
    canParseArgument = true;
    expression();
    emitConstant(new FGType(lastT));
    tempNames[name] = { type: lastT, mut: true };
    add_local_global(name, lastT);
    emitBytes(1430, index);
    lastT = nothingT;
}
function parse_non_callable() {
    let name = prevTok.lexeme;
    if (match(1500)) {
        if (!canAssign)
            error(`cannot assign ${name}`);
        canAssign = false;
        set_non_callable(name);
    }
    else {
        canAssign = false;
        get_non_callable(name);
    }
}
function get_non_callable(name) {
    $(name);
    let arg = resolveLocal(current, name);
    if (arg !== -1) {
        $("got local name");
        emitBytes(395, arg);
        lastT = current.locals[arg].type;
    }
    else if (Object.hasOwn(nativeNames, name)) {
        get_non_callable_(nativeNames, name, 400);
    }
    else if (Object.hasOwn(userNames, name)) {
        get_non_callable_(userNames, name, 500);
    }
    else if (Object.hasOwn(tempNames, name)) {
        get_non_callable_(tempNames, name, 500);
    }
    else {
        error(`undefined name ${name}`);
    }
}
function get_non_callable_(table, name, op) {
    let index = makeConstant(new FGString(name));
    emitBytes(op, index);
    lastT = table[name].type;
}
function set_non_callable(name) {
    if (current.scopeDepth > 0) {
        set_non_callable_control(name);
    }
    else {
        set_non_callable_callable(name);
    }
}
function set_non_callable_callable(name) {
    let type = neverT;
    let ismut = false;
    if (Object.hasOwn(nativeNames, name)) {
        error(`cannot reassign built-in name`);
    }
    else if (Object.hasOwn(userNames, name)) {
        if (userNames[name].mut === true) {
            ismut = true;
            type = userNames[name].type;
        }
        else {
            error(`${name} already defined, not mutable`);
        }
    }
    else if (Object.hasOwn(tempNames, name)) {
        if (tempNames[name].mut === true) {
            ismut = true;
            type = tempNames[name].type;
        }
        else {
            error(`${name} already defined, not mutable`);
        }
    }
    let index = makeConstant(new FGString(name));
    lastT = neverT;
    canParseArgument = true;
    expression();
    emitConstant(new FGType(lastT));
    if (ismut) {
        assertT(lastT, type, "reassignment type didn't match");
        emitBytes(1430, index);
    }
    else {
        tempNames[name] = { type: lastT };
        emitBytes(1400, index);
    }
    lastT = nothingT;
}
function set_non_callable_control(name) {
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
    emitBytes(1415, index);
    lastT = nothingT;
}
function parse_callable() {
    let name = prevTok.lexeme;
    if (match(1500)) {
        if (!canAssign)
            error(`cannot assign ${name}`);
        canAssign = false;
        set_callable(name);
    }
    else if (match(210)) {
        canAssign = false;
        method(name);
    }
    else {
        canAssign = false;
        get_callable(name);
    }
}
let curryFn = undefined;
function set_callable(name) {
    let index = makeConstant(new FGString(name));
    lastT = neverT;
    canParseArgument = true;
    parsePrecedence(600);
    emitConstant(new FGType(lastT));
    if (curryFn === undefined)
        error("undefined curryFn");
    tempNames[name] = { type: lastT, value: curryFn };
    emitBytes(1400, index);
    lastT = nothingT;
}
function method(name) {
    consume(1650, "expect method name after '.'");
    let methodName = prevTok.lexeme;
    if (name in nativeNames) {
        if (nativeNames[name].methods
            && methodName in nativeNames[name].methods) {
            get_global(nativeNames[name].methods, methodName, true);
        }
        else {
            error(`undefined method ${methodName} in ${name}`);
        }
    }
    else {
        error(`undefined callable ${name}`);
    }
}
function get_callable(name) {
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
function call_curry(name, curry) {
    $("in call_curry()");
    let index = makeConstant(new FGString(name));
    emitBytes(500, index);
    let inputs = curry.fn.input;
    let gotTypes = [];
    let i = curry.args.length;
    for (; i < inputs.length; i++) {
        if (check(900)) {
            $("found semicolon");
            break;
        }
        lastT = nothingT;
        if (canParseArgument)
            expression();
        else
            parsePrecedence(600);
        gotTypes.push(lastT);
        if (!inputs[i].equal(lastT)) {
            error(`in ${curry.name}: expect arg ${i} of type ${inputs[i].to_str()}, got ${gotTypes[i].to_str()}`);
        }
    }
    emitBytes(190, inputs.length - curry.args.length);
    if (curry.fn instanceof FGCallNative)
        emitBytes(200, inputs.length);
    else
        emitBytes(205, inputs.length);
    lastT = curry.fn.output;
}
function get_global(table, name_, native) {
    if (!canParseArgument) {
        global_non_callable(table, name_, native);
        return;
    }
    canParseArgument = match(200);
    let name = table[name_];
    if (name.value instanceof FGCurry) {
        call_curry(name_, name.value);
        return;
    }
    emitConstant(name.value);
    let inputs = name.value.input;
    let output = name.value.output;
    let gotTypes = [];
    let i = 0;
    for (; i < inputs.length; i++) {
        if (check(900)) {
            $("found semicolon");
            break;
        }
        lastT = nothingT;
        if (canParseArgument)
            expression();
        else
            parsePrecedence(600);
        gotTypes.push(lastT);
        if (!inputs[i].equal(lastT)) {
            error(`in ${name_}: expect arg ${i} of type ${inputs[i].to_str()}, got ${gotTypes[i].to_str()}`);
        }
    }
    if (i !== inputs.length) {
        $("gonna curry");
        let args = [];
        for (let j = 0; j < i; j++)
            args[j] = new FGNumber(0);
        let newInput = inputs.slice(i);
        console.log(newInput);
        let type = new CallUserT(newInput, output);
        curryFn = new FGCurry("dummy", name.value, args);
        emitBytes(230, i);
        lastT = type;
    }
    else {
        let arity = inputs.length;
        emitBytes(native ? 200 : 205, arity);
        lastT = output;
    }
}
function parse_local_global() {
    consume(2540, "expect name after global");
    let name = prevTok.lexeme;
    let type = neverT;
    if (Object.hasOwn(nativeNames, name))
        error("native name is immutable");
    else if (Object.hasOwn(userNames, name)) {
        if (userNames[name].mut === true)
            type = userNames[name].type;
        else
            error(`${name} already defined, not mutable`);
    }
    else if (Object.hasOwn(tempNames, name)) {
        if (tempNames[name].mut === true)
            type = tempNames[name].type;
        else
            error(`${name} already defined, not mutable`);
    }
    else
        error(`there is no ${name} in global`);
    add_local_global(name, type);
    lastT = nothingT;
}
function set_block(name, mut = false) {
    if (mut) {
        for (let i = current.locals.length - 1; i >= 0; i--) {
            let local = current.locals[i];
            if (local.depth < current.scopeDepth)
                break;
            if (name === local.name)
                error(`${name} already defined in this scope`);
        }
        add_local(name);
        let index = current.locals.length - 1;
        lastT = neverT;
        canParseArgument = true;
        expression();
        emitConstant(new FGType(lastT));
        emitBytes(1410, index);
        current.locals[current.locals.length - 1].type = lastT;
        current.locals[current.locals.length - 1].mut = true;
    }
    else {
        let type = neverT;
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
                        error(`${name} already defined in this scope`);
                }
            }
        }
        let index;
        if (mut) {
            $("mut");
            index = i;
        }
        else {
            add_local(name);
            index = current.locals.length - 1;
        }
        lastT = neverT;
        canParseArgument = true;
        expression();
        emitConstant(new FGType(lastT));
        if (mut)
            emitBytes(1420, index);
        else {
            current.locals[current.locals.length - 1].type = lastT;
            emitBytes(1410, index);
        }
    }
    lastT = nothingT;
}
function set_local(name, mut = false) {
    if (mut) {
        for (let i = current.locals.length - 1; i >= 0; i--) {
            let local = current.locals[i];
            if (local.depth < current.scopeDepth)
                break;
            if (name === local.name)
                error(`${name} already defined in this scope`);
        }
        add_local(name);
        let index = current.locals.length - 1;
        lastT = neverT;
        canParseArgument = true;
        expression();
        emitConstant(new FGType(lastT));
        emitBytes(1410, index);
        current.locals[current.locals.length - 1].type = lastT;
        current.locals[current.locals.length - 1].mut = true;
    }
    else {
        let type = neverT;
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
                        error(`${name} already defined in this scope`);
                }
            }
        }
        let index;
        if (mut) {
            $("mut");
            index = i;
        }
        else {
            add_local(name);
            index = current.locals.length - 1;
        }
        lastT = neverT;
        canParseArgument = true;
        expression();
        emitConstant(new FGType(lastT));
        if (mut)
            emitBytes(1420, index);
        else {
            current.locals[current.locals.length - 1].type = lastT;
            emitBytes(1410, index);
        }
    }
    lastT = nothingT;
}
function set_global(name, mut = false) {
    let type = neverT;
    let ismut = false;
    if (mut) {
        if (Object.hasOwn(nativeNames, name)
            || Object.hasOwn(userNames, name)
            || Object.hasOwn(tempNames, name)) {
            error(`${name} already defined`);
        }
    }
    else {
        if (Object.hasOwn(nativeNames, name)) {
            error(`${name} already defined`);
        }
        else if (Object.hasOwn(userNames, name)) {
            if (userNames[name].mut === true) {
                ismut = true;
                type = userNames[name].type;
            }
            else {
                error(`${name} already defined, not mutable`);
            }
        }
        else if (Object.hasOwn(tempNames, name)) {
            if (tempNames[name].mut === true) {
                ismut = true;
                type = tempNames[name].type;
            }
            else {
                error(`${name} already defined, not mutable`);
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
        emitBytes(1430, index);
    }
    else if (ismut) {
        assertT(lastT, type, "reassignment type didn't match");
        tempNames[name] = { type: lastT, mut: true };
        emitBytes(1430, index);
    }
    else {
        tempNames[name] = { type: lastT };
        emitBytes(1400, index);
    }
    lastT = nothingT;
}
function global_non_callable(table, name, native) {
    emitConstant(table[name].value);
    lastT = table[name].type;
}
function parse_type() {
    advance();
    let type;
    switch (prevTok.kind) {
        case 2220:
            type = booleanT;
            break;
        case 2600:
            type = numberT;
            break;
        case 2900:
            type = stringT;
            break;
        case 2230:
            type = circleT;
            break;
        default:
            error("expect parameter type");
    }
    while (match(400)) {
        $("match [ in parse_type");
        consume(700, "expect ']' after list type");
        type = new ListT(type);
    }
    return type;
}
function parse_params() {
    consume(2540, "expect parameter name");
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
    let type = parse_type();
    current.locals[current.locals.length - 1].type = type;
    current.fn.input.push(type);
    lastT = nothingT;
    return type;
}
function struct() {
    consume(1650, "expect struct name in PascalCase");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));
    consume(300, "expect '{' to after struct name");
    let s = {};
    let memberNames = [];
    let memberTypes = [];
    do {
        consume(2540, "expect parameter name");
        let name = prevTok.lexeme;
        consume(1300, "expect `:` after parameter name");
        let type = parse_type();
        s[name] = type;
    } while (match(100));
    consume(695, "expect '}' to after struct members");
    let struct = new FGType(new StructT(s));
    emitConstant(struct);
    emitConstant(struct);
    emitBytes(1400, index);
}
function fn() {
    $("in fn()");
    consume(1650, "expect function name in PascalCase");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));
    begin_compiler(0, name);
    beginScope();
    let inputT = [];
    do {
        inputT.push(parse_params());
    } while (match(100));
    consume(1195, "expect `->` after list of params");
    let outputT = parse_type();
    current.fn.output = outputT;
    tempNames[name] = { type: callUserT, value: current.fn };
    consume(1500, "expect '=' before fn body");
    canParseArgument = true;
    expression();
    emitBytes(1300, 1);
    $(lastT, outputT);
    assertT(lastT, outputT, "return type not match");
    let fn = endCompiler();
    emitConstant(fn);
    emitConstant(new FGType(new CallUserT(inputT, outputT)));
    emitBytes(1400, index);
    lastT = outputT;
}
function proc() {
    $("in proc()");
    consume(1650, "expect procedure name in PascalCase");
    let name = prevTok.lexeme;
    let index = makeConstant(new FGString(name));
    begin_compiler(0, name);
    beginScope();
    do {
        parse_params();
    } while (match(100));
    let outputT = nothingT;
    if (match(1195)) {
        outputT = parse_type();
    }
    current.fn.output = outputT;
    tempNames[name] = { type: callUserT, value: current.fn };
    consume(300, "expect '{' before proc body");
    returnT = nothingT;
    proc_body();
    assertT(returnT, outputT, "return type not match");
    if (outputT.equal(nothingT))
        emitBytes(1300, 0);
    consume(695, "expect '}' after proc body");
    let fn = endCompiler();
    emitConstant(fn);
    emitConstant(new FGType(callUserT));
    emitBytes(1400, index);
    lastT = outputT;
}
function proc_body() {
    while (!check(695) && !check(2100)) {
        statement();
    }
}
function add_local(name) {
    current.locals.push({ name, type: nothingT, depth: current.scopeDepth });
}
function add_local_global(name, type) {
    current.localGlobals.push({ name, type, depth: current.scopeDepth });
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
    canParseBlock = true;
    statement();
    let elseJump = emitJump(615);
    patchJump(thenJump);
    emitByte(1200);
    if (match(2300)) {
        canParseBlock = true;
        statement();
    }
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
    current.locals.push({ name: "_Start", type: numberT, depth: current.scopeDepth });
    consume(100, "expect ',' between start and end of range");
    expression();
    assertT(lastT, numberT, "end of range must be numeric");
    current.locals.push({ name: "_End", type: numberT, depth: current.scopeDepth });
    if (match(100)) {
        expression();
        assertT(lastT, numberT, "step of range must be numeric");
    }
    else {
        emitConstant(new FGNumber(1));
    }
    current.locals.push({ name: "_Step", type: numberT, depth: current.scopeDepth });
    let openRight;
    if (match(800)) {
        openRight = true;
    }
    else {
        openRight = false;
        consume(700, "expect ']' in range");
    }
    if (!match(2540))
        error_at_current("expect name for iterator");
    let name = prevTok.lexeme;
    current.locals[start].name = name;
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
function declaration() {
    if (match(2320)) {
        fn();
    }
    else if (match(2750)) {
        proc();
    }
    else if (match(2910)) {
        struct();
    }
    else {
        statement();
    }
}
function statement() {
    if (match(2540)) {
        canAssign = true;
        parse_non_callable();
    }
    else if (match(1650)) {
        canAssign = true;
        canParseArgument = true;
        parse_callable();
    }
    else if (match(2450)) {
        parse_local_global();
    }
    else if (match(2460)) {
        parse_let();
    }
    else if (match(2500)) {
        parse_mut();
    }
    else if (match(300)) {
        if (!canParseBlock)
            error("forbiden block");
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
    canParseBlock = false;
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
    while (current.localGlobals.length > 0
        && current.localGlobals[current.localGlobals.length - 1].depth > current.scopeDepth) {
        current.localGlobals.pop();
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
