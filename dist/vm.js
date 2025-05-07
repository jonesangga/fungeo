import { Chunk } from "./chunk.js";
import { names } from "./names.js";
let stack = [];
let stackTop = 0;
function push(value) {
    stack[stackTop++] = value;
}
function pop() {
    return stack[--stackTop];
}
function peek(distance) {
    return stack[stackTop - 1 - distance];
}
function resetStack() {
    stackTop = 0;
}
let replOutput = "";
function print_output(s) {
    replOutput += s;
}
var InterpretResult;
(function (InterpretResult) {
    InterpretResult[InterpretResult["Ok"] = 0] = "Ok";
    InterpretResult[InterpretResult["CompileError"] = 1] = "CompileError";
    InterpretResult[InterpretResult["RuntimeError"] = 2] = "RuntimeError";
})(InterpretResult || (InterpretResult = {}));
;
function add() {
}
let chunk = new Chunk("vm");
let ip = 0;
function read_byte() {
    ip++;
    return chunk.code[ip - 1];
}
function read_constant() {
    return chunk.values[read_byte()];
}
function read_string() {
    return read_constant().value;
}
function run() {
    for (;;) {
        let instruction;
        switch (instruction = read_byte()) {
            case 0:
                add();
                break;
            case 7: {
                push(read_constant());
                break;
            }
            case 4: {
                let name = read_string();
                let value = names[name].value;
                push(value);
                break;
            }
            case 13: {
                let name = read_string();
                let kind = read_byte();
                let value = pop();
                names[name] = { kind, value };
                break;
            }
            case 12: {
                return 0;
            }
        }
    }
}
const vm = {
    init() {
        resetStack();
    },
    interpret(chunk_) {
        chunk = chunk_;
        ip = 0;
        replOutput = "";
        let result = run();
        if (result === 0) {
            return { status: result, message: replOutput };
        }
        else {
            return { status: result, message: "runtime: " + replOutput };
        }
    }
};
export { vm };
