import { FGBoolean, FGNumber } from "./value.js";
import { nativeNames, userNames } from "./names.js";
export let stack = [];
export let stackTop = 0;
let frames = [];
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
let frame;
function error(msg) {
    let line = frame.fn.chunk.lines[frame.ip - 1];
    output += `${line}: in script: ${msg}\n`;
    resetStack();
    throw new RuntimeError(output);
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
    frame = { fn, ip: 0, slots: stackTop - argCount };
    frames.push(frame);
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
                let arity = read_byte();
                let ver = read_byte();
                let fn = peek(arity);
                fn.value(ver);
                pop();
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
                if (b.value === 0) {
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
                    let nextOp = frame.fn.chunk.code[frame.ip];
                    if (nextOp === 215)
                        frame.fn.chunk.code[frame.ip] = 217;
                    else
                        frame.fn.chunk.code[frame.ip + 2] = 212;
                }
                break;
            }
            case 212: {
                let pos = read_byte();
                let a = stack[frame.slots + pos];
                let b = stack[frame.slots + pos + 1];
                if (a.value > b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case 217: {
                let pos = read_byte();
                let a = stack[frame.slots + pos];
                let b = stack[frame.slots + pos + 1];
                if (a.value >= b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case 210: {
                let pos = read_byte();
                let a = stack[frame.slots + pos];
                let b = stack[frame.slots + pos + 1];
                if (a.value < b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case 215: {
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
                let arg = read_byte();
                let returns = [];
                for (let i = 0; i < arg; i++) {
                    returns.push(pop());
                }
                stackTop = frame.slots - 1;
                for (let i = 0; i < arg; i++) {
                    push(returns.pop());
                }
                frames.pop();
                frame = frames[frames.length - 1];
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
        frame = { fn, ip: 0, slots: 1 };
        frames.push(frame);
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
        frame = { fn, ip: 0, slots: 1 };
        frames.push(frame);
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
export { vm };
