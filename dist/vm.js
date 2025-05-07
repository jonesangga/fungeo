import { Chunk } from "./chunk.js";
import { nativeNames, userNames } from "./names.js";
const TESTING = true;
export let stack = [];
export let stackTop = 0;
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
let output = "";
function print_output(s) {
    output += s;
}
function add() {
}
let chunk = new Chunk("vm");
let ip = 0;
function read_byte() {
    return chunk.code[ip++];
}
function read_constant() {
    return chunk.values[read_byte()];
}
function read_string() {
    return read_constant().value;
}
const debug = true;
function run() {
    for (;;) {
        if (debug) {
            let str = "      ";
            for (let slot = 0; slot < stackTop; slot++) {
                str += "[ ";
                str += stack[slot].to_str();
                str += " ]";
            }
            str += "\n";
            let [result,] = chunk.disassemble_instr(ip);
            console.log(str + result);
        }
        switch (read_byte()) {
            case 0:
                add();
                break;
            case 8: {
                push(read_constant());
                break;
            }
            case 4: {
                let name = read_string();
                let value = nativeNames[name].value;
                push(value);
                break;
            }
            case 5: {
                let name = read_string();
                let value = userNames[name].value;
                push(value);
                break;
            }
            case 14: {
                let name = read_string();
                let kind = read_byte();
                let value = pop();
                userNames[name] = { kind, value };
                break;
            }
            case 13:
                return true;
        }
        if (TESTING)
            return true;
    }
}
const vm = {
    init() {
        resetStack();
        for (let name in userNames) {
            delete userNames[name];
        }
    },
    interpret(chunk_) {
        chunk = chunk_;
        ip = 0;
        output = "";
        let success = run();
        if (success) {
            return { success, message: output };
        }
        else {
            return { success, message: "runtime: " + output };
        }
    },
    set(chunk_) {
        chunk = chunk_;
        ip = 0;
    },
    step() { if (TESTING)
        run(); }
};
export { vm };
