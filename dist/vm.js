import { Chunk } from "./chunk.js";
import { FGBoolean, FGNumber } from "./value.js";
import { nativeNames, userNames } from "./names.js";
export let stack = [];
export let stackTop = 0;
export function push(value) {
    stack[stackTop++] = value;
}
export function pop() {
    return stack[--stackTop];
}
function peek(distance) {
    return stack[stackTop - 1 - distance];
}
function resetStack() {
    stackTop = 0;
}
export let output = "";
export function vmoutput(str) {
    output += str;
}
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
function compare(f) {
    let b = pop();
    let a = pop();
    push(new FGBoolean(f(a.value, b.value)));
}
const lt = (a, b) => a < b;
const gt = (a, b) => a > b;
const leq = (a, b) => a <= b;
const geq = (a, b) => a >= b;
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
            case 100: {
                let b = pop();
                let a = pop();
                push(a.add(b));
                break;
            }
            case 120: {
                let b = pop();
                let a = pop();
                push(a.add(b));
                break;
            }
            case 200: {
                let name = read_constant();
                let ver = read_byte();
                name.value(ver);
                break;
            }
            case 300: {
                let b = pop();
                let a = pop();
                if (b.value === 0) {
                    error("division by zero");
                    return false;
                }
                push(a.div(b));
                break;
            }
            case 610: {
                let b = pop();
                let a = pop();
                if (b.value === 0) {
                    error("division by zero");
                    return false;
                }
                if (b.value % a.value === 0)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case 900: {
                let b = pop();
                let a = pop();
                push(a.mul(b));
                break;
            }
            case 1500: {
                let b = pop();
                let a = pop();
                push(a.sub(b));
                break;
            }
            case 380: {
                let b = pop();
                let a = pop();
                push(new FGBoolean(a.equal(b)));
                break;
            }
            case 1010: {
                let b = pop();
                let a = pop();
                push(new FGBoolean(!a.equal(b)));
                break;
            }
            case 810:
                compare(lt);
                break;
            case 690:
                compare(leq);
                break;
            case 530:
                compare(gt);
                break;
            case 390:
                compare(geq);
                break;
            case 210: {
                let pos = read_byte();
                let a = stack[pos];
                let b = stack[pos + 1];
                if (a.value <= b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case 595: {
                let pos = read_byte();
                let a = stack[pos];
                let step = stack[pos + 2];
                stack[pos] = new FGNumber(a.value + step.value);
                break;
            }
            case 616:
            case 615: {
                let offset = read_byte();
                ip += offset;
                break;
            }
            case 620: {
                let offset = read_byte();
                let cond = peek(0);
                if (!cond.value)
                    ip += offset;
                break;
            }
            case 800: {
                push(read_constant());
                break;
            }
            case 400: {
                let name = read_string();
                let value = nativeNames[name].value;
                push(value);
                break;
            }
            case 500: {
                let name = read_string();
                let value = userNames[name].value;
                push(value);
                break;
            }
            case 1000: {
                let a = pop();
                a.value *= -1;
                push(a);
                break;
            }
            case 1100: {
                let a = pop();
                a.value = !a.value;
                push(a);
                break;
            }
            case 1400: {
                let name = read_string();
                let kind = read_byte();
                let value = pop();
                userNames[name] = { kind, value };
                break;
            }
            case 395: {
                push(stack[read_byte()]);
                break;
            }
            case 1410: {
                break;
            }
            case 1200: {
                pop();
                break;
            }
            case 1300: {
                return true;
            }
        }
        if (TESTING)
            return true;
    }
}
let TESTING = true;
const vm = {
    init() {
        resetStack();
        for (let name in userNames) {
            delete userNames[name];
        }
    },
    interpret(chunk_) {
        TESTING = false;
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
        TESTING = true;
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
