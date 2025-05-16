import { FGBoolean, FGNumber } from "./value.js";
import { nativeNames, userNames } from "./names.js";
export let stack = [];
export let stackTop = 0;
let frames = [];
let frameCount = 0;
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
    frameCount = 0;
}
export let output = "";
export function vmoutput(str) {
    output += str;
}
let frame;
function error(msg) {
    let line = frame.fn.chunk.lines[frame.ip - 1];
    output += `${line}: in script: ${msg}\n`;
    resetStack();
}
function read_byte() {
    return frame.fn.chunk.code[frame.ip++];
}
function read_constant() {
    return frame.fn.chunk.values[read_byte()];
}
function read_string() {
    return read_constant().value;
}
function call(fn, argCount) {
    let frame = { fn, ip: 0, slots: stackTop - argCount };
    frames[frameCount++] = frame;
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
    frame = frames[frameCount - 1];
    for (;;) {
        if (debug) {
            let str = "      ";
            for (let slot = 0; slot < stackTop; slot++) {
                str += "[ ";
                str += stack[slot].to_str();
                str += " ]";
            }
            str += "\n";
            let [result,] = frame.fn.chunk.disassemble_instr(frame.ip);
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
            case 205: {
                let name = read_constant();
                let ver = read_byte();
                let arity = name.version[0].input.length;
                call(name, arity);
                frame = frames[frameCount - 1];
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
                let a = stack[frame.slots + pos];
                let b = stack[frame.slots + pos + 1];
                if (a.value <= b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case 595: {
                let pos = read_byte();
                let a = stack[frame.slots + pos];
                let step = stack[frame.slots + pos + 2];
                stack[frame.slots + pos] = new FGNumber(a.value + step.value);
                break;
            }
            case 616:
            case 615: {
                let offset = read_byte();
                frame.ip += offset;
                break;
            }
            case 620: {
                let offset = read_byte();
                let cond = peek(0);
                if (!cond.value)
                    frame.ip += offset;
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
                console.log("frame.slots = " + frame.slots);
                push(stack[frame.slots + read_byte()]);
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
                let result = pop();
                frameCount--;
                stackTop = frame.slots;
                push(result);
                frame = frames[frameCount - 1];
                break;
            }
            case 1290: {
                pop();
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
    interpret(fn) {
        TESTING = false;
        output = "";
        push(fn);
        let frame = { fn, ip: 0, slots: 1 };
        frames[frameCount++] = frame;
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
