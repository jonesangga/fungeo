import { Op, Chunk } from "./chunk.js"
import { Kind, KindName, FGBoolean, FGNumber, FGString, FGCallable, FGFunction, type Value, type Comparable } from "./value.js"
import { nativeNames, userNames } from "./names.js"
import { compiler } from "./compiler.js"

export let stack: Value[] = [];
export let stackTop = 0;
let frames: CallFrame[] = [];
let frameCount = 0;

export function push(value: Value): void {
    stack[stackTop++] = value;
}

export function pop(): Value {
    return stack[--stackTop];
}

function peek(distance: number): Value {
    return stack[stackTop - 1 - distance];
}

function resetStack(): void {
    stackTop = 0;
    frameCount = 0;
}

export let output = "";
export function vmoutput(str: string): void {
    output += str;
}

let frame: CallFrame;
// let ip    = 0;     // Index of current instruction in frame.fn.chunk.code array.

function error(msg: string): void {
    // let line = chunk.lines[ip - 1];
    let line = frame.fn.chunk.lines[frame.ip - 1];
    output += `${ line }: in script: ${ msg }\n`;
    resetStack();
}

function read_byte(): number {
    // return chunk.code[ip++];
    return frame.fn.chunk.code[frame.ip++];
}

function read_constant(): Value {
    // return chunk.values[read_byte()];
    return frame.fn.chunk.values[read_byte()];
}

function read_string(): string {
    return (read_constant() as FGString).value;
}

type NumStr = number | string;

function call(fn: FGFunction, argCount: number) {
    let frame = {fn, ip: 0, slots: stackTop - argCount};
    frames[frameCount++] = frame;
}

function compare(
    f: (a: NumStr, b: NumStr) => boolean
): void {
    let b = pop() as Comparable;
    let a = pop() as Comparable;
    push(new FGBoolean( f(a.value, b.value) ));
}

const lt = (a: NumStr, b: NumStr): boolean => a < b;
const gt = (a: NumStr, b: NumStr): boolean => a > b;
const leq = (a: NumStr, b: NumStr): boolean => a <= b;
const geq = (a: NumStr, b: NumStr): boolean => a >= b;

const debug = true;

function run(): boolean {
    frame = frames[frameCount -1];
    for (;;) {
        if (debug) {
            // console.log(stackTop, ...stack);
            let str = "      ";
            for (let slot = 0; slot < stackTop; slot++) {
                str += "[ ";
                str += stack[slot].to_str();
                str += " ]";
            }
            str += "\n";
            // let [result, ] = chunk.disassemble_instr(ip);
            let [result, ] = frame.fn.chunk.disassemble_instr(frame.ip);
            console.log(str + result);
        }

        switch (read_byte()) {
            case Op.Add: {
                let b = pop() as FGNumber;
                let a = pop() as FGNumber;
                push(a.add(b));
                break;
            }

            case Op.AddStr: {
                let b = pop() as FGString;
                let a = pop() as FGString;
                push(a.add(b));
                break;
            }

            case Op.CallNat: {
                let name = read_constant() as FGCallable;
                let ver = read_byte();
                name.value(ver);
                break;
            }
            case Op.CallUsr: {
                let name = read_constant() as FGFunction;
                let ver = read_byte();
                let arity = name.version[0].input.length;
                call(name, arity);
                frame = frames[frameCount - 1];
                break;
            }

            case Op.Div: {
                let b = pop() as FGNumber;
                let a = pop() as FGNumber;
                if (b.value === 0) {
                    error("division by zero");
                    return false;
                }
                push(a.div(b));
                break;
            }

            case Op.IsDiv: {
                let b = pop() as FGNumber;
                let a = pop() as FGNumber;
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

            case Op.Mul: {
                let b = pop() as FGNumber;
                let a = pop() as FGNumber;
                push(a.mul(b));
                break;
            }

            case Op.Sub: {
                let b = pop() as FGNumber;
                let a = pop() as FGNumber;
                push(a.sub(b));
                break;
            }

            case Op.Eq: {
                let b = pop();
                let a = pop();
                push(new FGBoolean( a.equal(b) ));
                break;
            }
            case Op.NEq: {
                let b = pop();
                let a = pop();
                push(new FGBoolean( !a.equal(b) ));
                break;
            }
            case Op.LT: compare(lt); break;
            case Op.LEq: compare(leq); break;
            case Op.GT: compare(gt); break;
            case Op.GEq: compare(geq); break;

            case Op.Cond: {
                let pos = read_byte();
                let a = stack[frame.slots + pos] as FGNumber;
                let b = stack[frame.slots + pos + 1] as FGNumber;
                if (a.value <= b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }

            case Op.Inc: {
                let pos = read_byte();
                let a = stack[frame.slots + pos] as FGNumber;
                let step = stack[frame.slots + pos+2] as FGNumber;
                stack[frame.slots + pos] = new FGNumber(a.value + step.value);
                break;
            }

            case Op.JmpBack:
            case Op.Jmp: {
                let offset = read_byte();
                frame.ip += offset;
                break;
            }

            case Op.JmpF: {
                let offset = read_byte();
                let cond = peek(0) as FGBoolean;
                if (!cond.value)
                    frame.ip += offset;
                break;
            }

            case Op.Load: {
                push(read_constant());
                break;
            }

            case Op.GetNat: {
                let name = read_string();
                let value = nativeNames[name].value as Value;
                push(value);
                break;
            }

            case Op.GetUsr: {
                let name = read_string();
                let value = userNames[name].value as Value;
                push(value);
                break;
            }

            case Op.Neg: {
                let a = pop() as FGNumber;
                a.value *= -1;
                push(a);
                break;
            }

            case Op.Not: {
                let a = pop() as FGBoolean;
                a.value = !a.value;
                push(a);
                break;
            }

            case Op.Set: {
                let name = read_string();
                let kind = read_byte();
                let value = pop();
                userNames[name] = { kind, value };
                break;
            }

            case Op.GetLoc: {
                // push(stack[ read_byte() ]);
                console.log("frame.slots = " + frame.slots);
                push(stack[frame.slots + read_byte() ]);
                break;
            }

            // Nothing to do for now. Because all name is immutable.
            case Op.SetLoc: {
                break;
            }

            case Op.Pop: {
                pop();
                break;
            }

            case Op.Ret: {
                let arg = read_byte();
                let returns: Value[] = [];
                for (let i = 0; i < arg; i++) {
                    returns.push(pop());
                }
                frameCount--;
                stackTop = frame.slots;
                for (let i = 0; i < arg; i++) {
                    push(returns.pop() as Value);
                }
                frame = frames[frameCount - 1];
                break;
            }

            case Op.Ok: {
                pop();
                return true;
            }
        }

        if (TESTING) return true;
    }
}

interface VMResult {
    success: boolean;
    message: string;
}

interface CallFrame {
    fn: FGFunction;
    ip: number;
    slots: number;   // First slot of stack this frame can use.
}

let TESTING = true;

const vm = {
    init(): void {
        resetStack();
        for (let name in userNames) {
            delete userNames[name];
        }
    },

    interpret(fn: FGFunction): VMResult {
        TESTING = false;
        output = "";

        push(fn);
        let frame = {fn, ip: 0, slots: 1};
        frames[frameCount++] = frame;
        let result = run();
        if (result) {
            return {success: true, message: output};
        } else {
            return {success: false, message: output};
        }
    },

    set(chunk_: Chunk): void {
        TESTING = true;
        // chunk = chunk_;
        // ip = 0;
    },

    step(): VMResult {
        let result = run();
        if (result) {
            return {success: true, message: output};
        } else {
            return {success: false, message: output};
        }
    }
};

export { vm };
