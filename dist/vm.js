import { FGBoolean, FGNumber } from "./value.js";
import { nativeNames } from "./names.js";
import canvas from "./ui/canvas.js";
export let stack = [];
export let stackTop = 0;
let frames = [];
let currFrame;
let currChunk;
export let userNames = {};
export let on_scrn = [];
export function push(value) {
    stack[stackTop++] = value;
}
export function pop() {
    return stack[--stackTop];
}
function peek(distance) {
    return stack[stackTop - 1 - distance];
}
function stack_reset() {
    stackTop = 0;
}
let output = "";
export function vm_output(str) {
    output += str;
}
function error(msg) {
    let line = currChunk.lines[currFrame.ip - 1];
    let name = currFrame.fn.name;
    output += `${line}: in ${name}: ${msg}\n`;
    stack_reset();
    throw new RuntimeError(output);
}
function read_byte() {
    return currChunk.code[currFrame.ip++];
}
function read_constant() {
    return currChunk.values[read_byte()];
}
function read_string() {
    return read_constant().value;
}
function call(fn, argCount) {
    currFrame = { fn, ip: 0, slots: stackTop - argCount };
    currChunk = fn.chunk;
    frames.push(currFrame);
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
const debug = false;
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
            let [result,] = currChunk.disassemble_instr(currFrame.ip);
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
                let arity = read_byte();
                let ver = read_byte();
                let fn = peek(arity);
                fn.value(ver);
                break;
            }
            case 205: {
                let arity = read_byte();
                let ver = read_byte();
                let fn = peek(arity);
                call(fn, arity);
                break;
            }
            case 300: {
                let b = pop();
                let a = pop();
                if (b.value === 0) {
                    error("division by zero");
                }
                push(a.div(b));
                break;
            }
            case 610: {
                let b = pop();
                let a = pop();
                if (a.value === 0) {
                    error("division by zero");
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
                push(new FGBoolean(false));
                break;
            }
            case 1010: {
                let b = pop();
                let a = pop();
                push(new FGBoolean(false));
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
            case 230: {
                canvas.clear();
                on_scrn = [];
                break;
            }
            case 805: {
                let start = peek(2).value;
                let end = peek(1).value;
                let step = peek(0).value;
                console.log(start, end, step);
                if (start <= end) {
                    console.log("increasing");
                    if (step <= 0) {
                        error("infinite loop");
                    }
                }
                else {
                    console.log("decreasing");
                    if (step >= 0) {
                        error("infinite loop");
                    }
                    let nextOp = currChunk.code[currFrame.ip];
                    if (nextOp === 215)
                        currChunk.code[currFrame.ip] = 217;
                    else
                        currChunk.code[currFrame.ip + 2] = 212;
                }
                break;
            }
            case 212: {
                let pos = read_byte();
                let a = stack[currFrame.slots + pos];
                let b = stack[currFrame.slots + pos + 1];
                if (a.value > b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case 217: {
                let pos = read_byte();
                let a = stack[currFrame.slots + pos];
                let b = stack[currFrame.slots + pos + 1];
                if (a.value >= b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case 210: {
                let pos = read_byte();
                let a = stack[currFrame.slots + pos];
                let b = stack[currFrame.slots + pos + 1];
                if (a.value < b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case 215: {
                let pos = read_byte();
                let a = stack[currFrame.slots + pos];
                let b = stack[currFrame.slots + pos + 1];
                if (a.value <= b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case 595: {
                let pos = read_byte();
                let a = stack[currFrame.slots + pos];
                let step = stack[currFrame.slots + pos + 2];
                stack[currFrame.slots + pos] = new FGNumber(a.value + step.value);
                break;
            }
            case 616:
            case 615: {
                let offset = read_byte();
                currFrame.ip += offset;
                break;
            }
            case 620: {
                let offset = read_byte();
                let cond = peek(0);
                if (!cond.value)
                    currFrame.ip += offset;
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
                console.log("currFrame.slots = " + currFrame.slots);
                push(stack[currFrame.slots + read_byte()]);
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
                let arg = read_byte();
                let returns = [];
                for (let i = 0; i < arg; i++) {
                    returns.push(pop());
                }
                stackTop = currFrame.slots - 1;
                for (let i = 0; i < arg; i++) {
                    push(returns.pop());
                }
                frames.pop();
                currFrame = frames[frames.length - 1];
                currChunk = currFrame.fn.chunk;
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
class RuntimeError extends Error {
}
export const vm = {
    init() {
        stack_reset();
        userNames = {};
    },
    interpret(fn) {
        TESTING = false;
        output = "";
        push(fn);
        call(fn, 0);
        try {
            run();
            return { ok: true, value: output };
        }
        catch (error) {
            if (error instanceof Error)
                return { ok: false, error };
            return { ok: false, error: new Error("unknown error") };
        }
    },
    set(fn) {
        TESTING = true;
        output = "";
        push(fn);
        call(fn, 0);
    },
    step() {
        try {
            run();
            return { ok: true, value: output };
        }
        catch (error) {
            if (error instanceof Error)
                return { ok: false, error };
            return { ok: false, error: new Error("unknown error") };
        }
    }
};
