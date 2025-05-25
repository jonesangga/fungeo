// @jonesangga, 12-04-2025, MIT License.

import { Op, Chunk } from "./chunk.js"
import { Kind, FGBoolean, FGNumber, FGString, FGCallNative, FGCallUser, FGList, List, type Value, type Comparable } from "./value.js"
import { Names, nativeNames } from "./names.js"

// These are exported only for vm.test.
export let stack: Value[] = [];
export let stackTop = 0;

let frames: CallFrame[] = [];
let currFrame: CallFrame;
let currChunk: Chunk;

export let userNames: Names = {};

//--------------------------------------------------------------------
// Stack functions.

export function push(value: Value): void {
    stack[stackTop++] = value;
}

export function pop(): Value {
    return stack[--stackTop];
}

function peek(distance: number): Value {
    return stack[stackTop - 1 - distance];
}

function stack_reset(): void {
    stackTop = 0;
}

//--------------------------------------------------------------------

let output = "";
export function vm_output(str: string): void {
    output += str;
}

// Throw error and stop the executing bytecode.
// TODO: display call stack.
function error(msg: string): never {
    let line = currChunk.lines[currFrame.ip - 1];
    let name = currFrame.fn.name;
    output += `${ line }: in ${ name }: ${ msg }\n`;
    stack_reset();

    throw new RuntimeError(output);
}

function read_byte(): number {
    return currChunk.code[currFrame.ip++];
}

function read_constant(): Value {
    return currChunk.values[read_byte()];
}

function read_string(): string {
    return (read_constant() as FGString).value;
}

function call(fn: FGCallUser, argCount: number) {
    currFrame = { fn, ip: 0, slots: stackTop - argCount };
    currChunk = fn.chunk;
    frames.push(currFrame);
}

function create_list<T extends Kind>(length: number, elKind: T): void {
    type t = Extract<Value, {kind: T}>;
    let el: t[] = [];
    for (let i = 0; i < length; i++)
        el[length-i-1] = pop() as t;
    push(new FGList<T>(el, elKind));
}

function concat_list<T extends Kind>(elKind: T): void {
    let b = pop() as FGList<T>;
    let a = pop() as FGList<T>;
    push(new FGList<T>([...a.value, ...b.value], elKind));
}

function index_list<T extends Kind>(elKind: T): void {
    let id = (pop() as FGNumber).value;
    let list = pop() as FGList<T>;
    if (id >= list.length) {
        error("Out of bound access");
    }
    let value = list.value[id];
    push(value);
}

type NumStr = number | string;

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
    for (;;) {
        if (debug) {
            let str = "      ";
            for (let slot = 0; slot < stackTop; slot++) {
                str += "[ ";
                str += stack[slot].to_str();
                str += " ]";
            }
            str += "\n";
            let [result, ] = currChunk.disassemble_instr(currFrame.ip);
            console.log(str + result);
        }

        switch (read_byte()) {
            case Op.Add: {
                let b = pop() as FGNumber;
                let a = pop() as FGNumber;
                push(a.add(b));
                break;
            }

            case Op.AddList: {
                let elKind: Kind = read_byte();
                concat_list(elKind);
                break;
            }

            case Op.AddStr: {
                let b = pop() as FGString;
                let a = pop() as FGString;
                push(a.add(b));
                break;
            }

            case Op.CallNat: {
                let arity = read_byte();
                let ver = read_byte();
                let fn = peek(arity) as FGCallNative;
                fn.value(ver);
                break;
            }
            case Op.CallUsr: {
                let arity = read_byte();
                let ver = read_byte();
                let fn = peek(arity) as FGCallUser;
                call(fn, arity);
                break;
            }

            case Op.Div: {
                let b = pop() as FGNumber;
                let a = pop() as FGNumber;
                if (b.value === 0) {
                    error("division by zero");
                }
                push(a.div(b));
                break;
            }

            // TODO: think again about division by zero.
            case Op.IsDiv: {
                let b = pop() as FGNumber;
                let a = pop() as FGNumber;
                if (a.value === 0) {
                    error("division by zero");
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

            // TODO: implement these ASAP.
            case Op.Eq: {
                let b = pop();
                let a = pop();
                // push(new FGBoolean( a.equal(b) ));
                push(new FGBoolean(false));
                break;
            }
            case Op.NEq: {
                let b = pop();
                let a = pop();
                // push(new FGBoolean( !a.equal(b) ));
                push(new FGBoolean(false));
                break;
            }
            case Op.LT: compare(lt); break;
            case Op.LEq: compare(leq); break;
            case Op.GT: compare(gt); break;
            case Op.GEq: compare(geq); break;

            // Check for infinite loop. Change the loop checking instruction if the range decreasing.
            case Op.Loop: {
                let start = (peek(2) as FGNumber).value;
                let end = (peek(1) as FGNumber).value;
                let step = (peek(0) as FGNumber).value;
                console.log(start, end, step);
                if (start <= end) {
                    console.log("increasing");
                    if (step <= 0) {
                        error("infinite loop");
                    }
                } else {
                    console.log("decreasing");
                    if (step >= 0) {
                        error("infinite loop");
                    }
                    let nextOp = currChunk.code[currFrame.ip];
                    if (nextOp === Op.CkInc)
                        currChunk.code[currFrame.ip] = Op.CkIncD;
                    else
                        currChunk.code[currFrame.ip + 2] = Op.CkExcD;  // Remember there is Jmp after this.
                }
                break;
            }

            // TODO: Clean up these 4 cases.
            case Op.CkExcD: {
                let pos = read_byte();
                let a = stack[currFrame.slots + pos] as FGNumber;
                let b = stack[currFrame.slots + pos + 1] as FGNumber;
                if (a.value > b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case Op.CkIncD: {
                let pos = read_byte();
                let a = stack[currFrame.slots + pos] as FGNumber;
                let b = stack[currFrame.slots + pos + 1] as FGNumber;
                if (a.value >= b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case Op.CkExc: {
                let pos = read_byte();
                let a = stack[currFrame.slots + pos] as FGNumber;
                let b = stack[currFrame.slots + pos + 1] as FGNumber;
                if (a.value < b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }
            case Op.CkInc: {
                let pos = read_byte();
                let a = stack[currFrame.slots + pos] as FGNumber;
                let b = stack[currFrame.slots + pos + 1] as FGNumber;
                if (a.value <= b.value)
                    push(new FGBoolean(true));
                else
                    push(new FGBoolean(false));
                break;
            }

            case Op.Inc: {
                let pos = read_byte();
                let a = stack[currFrame.slots + pos] as FGNumber;
                let step = stack[currFrame.slots + pos+2] as FGNumber;
                stack[currFrame.slots + pos] = new FGNumber(a.value + step.value);
                break;
            }

            case Op.JmpBack:
            case Op.Jmp: {
                let offset = read_byte();
                currFrame.ip += offset;
                break;
            }

            case Op.JmpF: {
                let offset = read_byte();
                let cond = peek(0) as FGBoolean;
                if (!cond.value)
                    currFrame.ip += offset;
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
                if (kind === Kind.List)
                    userNames[name] = { kind, value, elKind: (value as List).elKind };
                else
                    userNames[name] = { kind, value };
                break;
            }

            case Op.List: {
                let length = read_byte();
                let elKind = read_byte();
                create_list(length, elKind);
                break;
            }
            case Op.Index: {
                let elKind: Kind = read_byte();
                index_list(elKind);
                break;
            }

            case Op.GetLoc: {
                push(stack[currFrame.slots + read_byte() ]);
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

            // TODO: think again, can only return one value.
            case Op.Ret: {
                let arg = read_byte();
                let returns: Value[] = [];
                for (let i = 0; i < arg; i++) {
                    returns.push(pop());
                }
                // TODO: think how about function that doesn't return value?
                stackTop = currFrame.slots - 1;
                for (let i = 0; i < arg; i++) {
                    push(returns.pop() as Value);
                }
                frames.pop();
                currFrame = frames[frames.length - 1];
                currChunk = currFrame.fn.chunk;
                break;
            }

            case Op.Ok: {
                pop();
                return true;
            }
        }

        // Comment this in prod!!!
        if (TESTING) return true;
    }
}

interface CallFrame {
    fn:    FGCallUser,
    ip:    number;
    slots: number;   // First slot of stack this frame can use.
}

let TESTING = true;

class RuntimeError extends Error {}

type Result<T, E = Error> =
    | { ok: true, value: T }
    | { ok: false, error: E };

export const vm = {
    init(): void {
        stack_reset();
        userNames = {};
    },

    interpret(fn: FGCallUser): Result<string, Error> {
        TESTING = false;
        output = "";

        push(fn);
        call(fn, 0);

        try {
            run();
            return { ok: true, value: output };
        }
        catch (error: unknown) {
            if (error instanceof Error) return { ok: false, error };
            return { ok: false, error: new Error("unknown error") };
        }
    },

    set(fn: FGCallUser): void {
        TESTING = true;
        output = "";
        push(fn);
        call(fn, 0);
    },

    step(): Result<string, Error> {
        try {
            run();
            return { ok: true, value: output };
        }
        catch (error: unknown) {
            if (error instanceof Error) return { ok: false, error };
            return { ok: false, error: new Error("unknown error") };
        }
    }
};
