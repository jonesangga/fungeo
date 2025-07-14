import { __ } from "./common.js";
import { FGMethod, FGBoolean, FGNumber, FGCallNative, FGList } from "./value.js";
import { coreClassNames, coreNames } from "./core.js";
import { extraClassNames, extraNames } from "./extra.js";
import { ClassT } from "./literal/type.js";
import { defaultCanvas } from "./ui/canvas.js";
export class Session {
    stack = [];
    stackTop = 0;
    output = "";
    oncanvas = [];
    push(value) {
        this.stack[this.stackTop++] = value;
    }
    pop() {
        return this.stack[--this.stackTop];
    }
    peek(distance) {
        return this.stack[this.stackTop - 1 - distance];
    }
    reset() {
        this.stackTop = 0;
    }
    write(str) {
        this.output += str;
    }
    render() {
        defaultCanvas.clear();
        for (let obj of this.oncanvas) {
            obj.draw();
        }
    }
    clear() {
        defaultCanvas.clear();
        this.oncanvas = [];
    }
}
export let session = new Session();
let frames = [];
let currFrame;
let currChunk;
export let classNames = {};
export let names = {};
function error(msg) {
    let line = currChunk.lines[currFrame.ip - 1];
    let name = currFrame.fn.name;
    session.output += `${line}: in ${name}: ${msg}\n`;
    session.reset();
    throw new RuntimeError(session.output);
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
    currFrame = { fn, ip: 0, slots: session.stackTop - argCount };
    currChunk = fn.chunk;
    frames.push(currFrame);
}
function create_list(length, eltype) {
    let el = [];
    for (let i = 0; i < length; i++)
        el[length - i - 1] = session.pop();
    session.push(new FGList(el, eltype));
}
function compare(f) {
    let b = session.pop();
    let a = session.pop();
    session.push(new FGBoolean(f(a.value, b.value)));
}
const lt = (a, b) => a < b;
const gt = (a, b) => a > b;
const leq = (a, b) => a <= b;
const geq = (a, b) => a >= b;
const debug = true;
function run(intercept = false) {
    for (;;) {
        if (debug) {
            let str = "      ";
            for (let slot = 0; slot < session.stackTop; slot++) {
                str += "[ ";
                str += session.stack[slot].to_str();
                str += " ]";
            }
            str += "\n";
            let [result,] = currChunk.disassemble_instr(currFrame.ip);
            __(str + result);
        }
        switch (read_byte()) {
            case 100: {
                let b = session.pop();
                let a = session.pop();
                session.push(a.add(b));
                break;
            }
            case 110: {
                let elType = session.pop().value;
                let b = session.pop();
                let a = session.pop();
                session.push(new FGList([...a.value, ...b.value], elType));
                break;
            }
            case 120: {
                let b = session.pop();
                let a = session.pop();
                session.push(a.add(b));
                break;
            }
            case 200: {
                let arity = read_byte();
                let ver = read_byte();
                let fn = session.peek(arity);
                if (fn instanceof FGCallNative)
                    fn.value(session, ver);
                else if (fn instanceof FGMethod) {
                    if (fn.obj)
                        session.push(fn.obj);
                    fn.method.value(session, ver);
                }
                else
                    call(fn, arity);
                break;
            }
            case 300: {
                let b = session.pop();
                let a = session.pop();
                if (b.value === 0) {
                    error("division by zero");
                }
                session.push(a.div(b));
                break;
            }
            case 610: {
                let b = session.pop();
                let a = session.pop();
                if (a.value === 0) {
                    error("division by zero");
                }
                if (b.value % a.value === 0)
                    session.push(new FGBoolean(true));
                else
                    session.push(new FGBoolean(false));
                break;
            }
            case 900: {
                let b = session.pop();
                let a = session.pop();
                session.push(a.mul(b));
                break;
            }
            case 1500: {
                let b = session.pop();
                let a = session.pop();
                session.push(a.sub(b));
                break;
            }
            case 380: {
                session.push(new FGBoolean(false));
                break;
            }
            case 1010: {
                session.push(new FGBoolean(false));
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
            case 616:
            case 615: {
                let offset = read_byte();
                currFrame.ip += offset;
                break;
            }
            case 620: {
                let offset = read_byte();
                let cond = session.peek(0);
                if (!cond.value)
                    currFrame.ip += offset;
                break;
            }
            case 800: {
                session.push(read_constant());
                break;
            }
            case 500: {
                let name = read_string();
                let value = names[name].value;
                session.push(value);
                break;
            }
            case 510: {
                let obj = session.pop();
                let prop = read_string();
                let k = obj.typeof().value;
                if (k instanceof ClassT) {
                    let fn = k.methods[prop].value;
                    let method = new FGMethod(fn, obj);
                    session.push(method);
                }
                else {
                    error("not a ClassT instance");
                }
                break;
            }
            case 525: {
                let obj = read_string();
                let prop = read_string();
                let className = classNames[obj];
                let fn = className.value.statics[prop].value;
                let method = new FGMethod(fn);
                session.push(method);
                break;
            }
            case 1000: {
                let a = session.pop();
                a.value *= -1;
                session.push(a);
                break;
            }
            case 1100: {
                let a = session.pop();
                a.value = !a.value;
                session.push(a);
                break;
            }
            case 1020: {
                let name = read_string();
                let type = session.pop().value;
                let value = session.pop();
                names[name] = { type, value };
                break;
            }
            case 1400: {
                let name = read_string();
                let value = session.pop();
                names[name].value = value;
                break;
            }
            case 700: {
                let length = read_byte();
                let elType = session.pop().value;
                create_list(length, elType);
                break;
            }
            case 680: {
                let list = session.pop();
                session.push(new FGNumber(list.value.length));
                break;
            }
            case 600: {
                let id = session.pop().value;
                let list = session.pop();
                if (id >= list.value.length)
                    error("Out of bound access");
                let value = list.value[id];
                session.push(value);
                break;
            }
            case 395: {
                session.push(session.stack[currFrame.slots + read_byte()]);
                break;
            }
            case 1410: {
                session.pop();
                session.stack[currFrame.slots + read_byte()] = session.peek(0);
                break;
            }
            case 1415: {
                let name = read_string();
                let value = session.pop();
                names[name].value = value;
                break;
            }
            case 1200: {
                session.pop();
                break;
            }
            case 1300: {
                let arg = read_byte();
                let returns = [];
                for (let i = 0; i < arg; i++) {
                    returns.push(session.pop());
                }
                session.stackTop = currFrame.slots - 1;
                for (let i = 0; i < arg; i++) {
                    session.push(returns.pop());
                }
                frames.pop();
                currFrame = frames[frames.length - 1];
                currChunk = currFrame.fn.chunk;
                if (intercept)
                    return true;
                break;
            }
            case 1150: {
                session.pop();
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
        session.reset();
        classNames = { ...coreClassNames, ...extraClassNames };
        names = { ...coreNames, ...extraNames };
    },
    interpret(fn) {
        TESTING = false;
        session.output = "";
        session.push(fn);
        call(fn, 0);
        try {
            run();
            return { ok: true, value: session.output };
        }
        catch (error) {
            if (error instanceof Error)
                return { ok: false, error };
            return { ok: false, error: new Error("unknown error") };
        }
    },
    set(fn) {
        TESTING = true;
        session.output = "";
        session.push(fn);
        call(fn, 0);
    },
    step() {
        try {
            run();
            return { ok: true, value: session.output };
        }
        catch (error) {
            if (error instanceof Error)
                return { ok: false, error };
            return { ok: false, error: new Error("unknown error") };
        }
    }
};
