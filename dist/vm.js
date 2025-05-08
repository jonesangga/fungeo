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
let chunk = new Chunk("vm");
let ip = 0;
function error(msg) {
    let line = chunk.lines[ip - 1];
    output += `${line}: in script: ${msg}\n`;
    resetStack();
}
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
            case 0: {
                let b = pop();
                let a = pop();
                push(a.add(b));
                break;
            }
            case 2: {
                let b = pop();
                let a = pop();
                if (b.value === 0) {
                    error("division by zero");
                    return false;
                }
                push(a.div(b));
                break;
            }
            case 9: {
                let b = pop();
                let a = pop();
                push(a.mul(b));
                break;
            }
            case 15: {
                let b = pop();
                let a = pop();
                push(a.sub(b));
                break;
            }
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
            case 13: {
                return true;
            }
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
        let result = run();
        if (result) {
            return { success: true, message: output };
        }
        else {
            return { success: false, message: output };
        }
    },
    set(chunk_) {
        chunk = chunk_;
        ip = 0;
    },
    step() {
        let result = run();
        if (result) {
            return { success: true, message: output };
        }
        else {
            return { success: false, message: output };
        }
    }
};
export { vm };
