// @jonesangga, 12-04-2025, MIT License.

import { __ } from "./common.js";
import { Op, Chunk } from "./chunk.js";
import { type Value, type Comparable, type GeoObj, FGMethod, FGBoolean, FGNumber, FGString, FGCallNative, FGCallUser, FGList } from "./value.js";
import { coreNames } from "./core.js";
import { extraNames } from "./extra.js";
import { type Type, FGType, Class } from "./literal/type.js";
import { Point } from "./geo/point.js";
import { defaultCanvas } from "./ui/canvas.js"

export class Session {
    stack: Value[] = [];
    stackTop: number = 0;
    output = "";
    oncanvas: GeoObj[] = [];

    push(value: Value): void {
        this.stack[this.stackTop++] = value;
    }

    pop(): Value {
        return this.stack[--this.stackTop];
    }

    peek(distance: number): Value {
        return this.stack[this.stackTop - 1 - distance];
    }

    reset(): void {
        this.stackTop = 0;
    }

    write(str: string): void {
        this.output += str;
    }

    render(): void {
        defaultCanvas.clear();
        for (let obj of this.oncanvas) {
            obj.draw();
        }
    }

    clear(): void {
        defaultCanvas.clear();
        this.oncanvas = [];
    }
}

export let session = new Session();

let frames: CallFrame[] = [];
let currFrame: CallFrame;
let currChunk: Chunk;

export type Names = {
    [name: string]: { type: Type, value: Value, mut?: boolean },
};

export let names: Names = {};

// Throw error and stop the executing bytecode.
// TODO: display call stack.
function error(msg: string): never {
    let line = currChunk.lines[currFrame.ip - 1];
    let name = currFrame.fn.name;
    session.output += `${ line }: in ${ name }: ${ msg }\n`;
    session.reset();

    throw new RuntimeError(session.output);
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
    currFrame = { fn, ip: 0, slots: session.stackTop - argCount };
    currChunk = fn.chunk;
    frames.push(currFrame);
}

function create_list(length: number, eltype: Type): void {
    let el = [];
    for (let i = 0; i < length; i++)
        el[length-i-1] = session.pop();
    session.push(new FGList(el, eltype));
}

type NumStr = number | string;

function compare(
    f: (a: NumStr, b: NumStr) => boolean
): void {
    let b = session.pop() as Comparable;
    let a = session.pop() as Comparable;
    session.push(new FGBoolean( f(a.value, b.value) ));
}

const lt = (a: NumStr, b: NumStr): boolean => a < b;
const gt = (a: NumStr, b: NumStr): boolean => a > b;
const leq = (a: NumStr, b: NumStr): boolean => a <= b;
const geq = (a: NumStr, b: NumStr): boolean => a >= b;

const debug = true;

function run(intercept: boolean = false): boolean {
    for (;;) {
        if (debug) {
            let str = "      ";
            for (let slot = 0; slot < session.stackTop; slot++) {
                str += "[ ";
                str += session.stack[slot].to_str();
                str += " ]";
            }
            str += "\n";
            let [result, ] = currChunk.disassemble_instr(currFrame.ip);
            __(str + result);
        }

        switch (read_byte()) {
            case Op.Add: {
                let b = session.pop() as FGNumber;
                let a = session.pop() as FGNumber;
                session.push(a.add(b));
                break;
            }

            case Op.AddList: {
                let elType = (session.pop() as FGType).value;
                let b = session.pop() as FGList;
                let a = session.pop() as FGList;
                session.push(new FGList([...a.value, ...b.value], elType));
                break;
            }

            case Op.AddStr: {
                let b = session.pop() as FGString;
                let a = session.pop() as FGString;
                session.push(a.add(b));
                break;
            }

            // case Op.Struct: {
                // let arity = read_byte();
                // let got: Value[] = [];
                // for (let i = 0; i < arity; i++)
                    // got[arity-i-1] = session.pop();

                // let struct = session.pop() as FGType;
                // let members = (struct.value as StructT).members;
                // let keys = Object.keys(members);
                // let ms: {[key: string]: Value} = {};
                // for (let i = 0; i < keys.length; i++) {
                    // ms[keys[i]] = got[i];
                // }
                // let newStruct = new FGStruct(ms);
                // session.push(newStruct);
                // break;
            // }

            case Op.Call: {
                let arity = read_byte();
                let ver = read_byte();
                let fn = session.peek(arity);
                if (fn instanceof FGCallNative)
                    fn.value(session, ver);
                else if (fn instanceof FGMethod) {
                    if (!fn.isStatic)
                        session.push(fn.obj);
                    fn.method.value(session, ver);
                }
                else
                    call(fn as FGCallUser, arity);
                break;
            }

            case Op.Div: {
                let b = session.pop() as FGNumber;
                let a = session.pop() as FGNumber;
                if (b.value === 0) {
                    error("division by zero");
                }
                session.push(a.div(b));
                break;
            }

            // TODO: think again about division by zero.
            case Op.IsDiv: {
                let b = session.pop() as FGNumber;
                let a = session.pop() as FGNumber;
                if (a.value === 0) {
                    error("division by zero");
                }
                if (b.value % a.value === 0)
                    session.push(new FGBoolean(true));
                else
                    session.push(new FGBoolean(false));
                break;
            }

            case Op.Mul: {
                let b = session.pop() as FGNumber;
                let a = session.pop() as FGNumber;
                session.push(a.mul(b));
                break;
            }

            case Op.Sub: {
                let b = session.pop() as FGNumber;
                let a = session.pop() as FGNumber;
                session.push(a.sub(b));
                break;
            }

            // TODO: implement these ASAP.
            case Op.Eq: {
                // let b = session.pop();
                // let a = session.pop();
                // session.push(new FGBoolean( a.equal(b) ));
                session.push(new FGBoolean(false));
                break;
            }
            case Op.NEq: {
                // let b = session.pop();
                // let a = session.pop();
                // session.push(new FGBoolean( !a.equal(b) ));
                session.push(new FGBoolean(false));
                break;
            }
            case Op.LT: compare(lt); break;
            case Op.LEq: compare(leq); break;
            case Op.GT: compare(gt); break;
            case Op.GEq: compare(geq); break;

            // // Check for infinite loop. Change the loop checking instruction if the range decreasing.
            // case Op.Loop: {
                // let start = (session.peek(2) as FGNumber).value;
                // let end = (session.peek(1) as FGNumber).value;
                // let step = (session.peek(0) as FGNumber).value;
                // $(start, end, step);
                // if (start <= end) {
                    // $("increasing");
                    // if (step <= 0) {
                        // error("infinite loop");
                    // }
                // } else {
                    // $("decreasing");
                    // if (step >= 0) {
                        // error("infinite loop");
                    // }
                    // let nextOp = currChunk.code[currFrame.ip];
                    // if (nextOp === Op.CkInc)
                        // currChunk.code[currFrame.ip] = Op.CkIncD;
                    // else
                        // currChunk.code[currFrame.ip + 2] = Op.CkExcD;  // Remember there is Jmp after this.
                // }
                // break;
            // }

            // // TODO: Clean up these 4 cases.
            // case Op.CkExcD: {
                // let pos = read_byte();
                // let a = session.stack[currFrame.slots + pos] as FGNumber;
                // let b = session.stack[currFrame.slots + pos + 1] as FGNumber;
                // if (a.value > b.value)
                    // session.push(new FGBoolean(true));
                // else
                    // session.push(new FGBoolean(false));
                // break;
            // }
            // case Op.CkIncD: {
                // let pos = read_byte();
                // let a = session.stack[currFrame.slots + pos] as FGNumber;
                // let b = session.stack[currFrame.slots + pos + 1] as FGNumber;
                // if (a.value >= b.value)
                    // session.push(new FGBoolean(true));
                // else
                    // session.push(new FGBoolean(false));
                // break;
            // }
            // case Op.CkExc: {
                // let pos = read_byte();
                // let a = session.stack[currFrame.slots + pos] as FGNumber;
                // let b = session.stack[currFrame.slots + pos + 1] as FGNumber;
                // if (a.value < b.value)
                    // session.push(new FGBoolean(true));
                // else
                    // session.push(new FGBoolean(false));
                // break;
            // }
            // case Op.CkInc: {
                // let pos = read_byte();
                // let a = session.stack[currFrame.slots + pos] as FGNumber;
                // let b = session.stack[currFrame.slots + pos + 1] as FGNumber;
                // if (a.value <= b.value)
                    // session.push(new FGBoolean(true));
                // else
                    // session.push(new FGBoolean(false));
                // break;
            // }

            // case Op.Inc: {
                // let pos = read_byte();
                // let a = session.stack[currFrame.slots + pos] as FGNumber;
                // let step = session.stack[currFrame.slots + pos+2] as FGNumber;
                // session.stack[currFrame.slots + pos] = new FGNumber(a.value + step.value);
                // break;
            // }

            case Op.JmpBack:
            case Op.Jmp: {
                let offset = read_byte();
                currFrame.ip += offset;
                break;
            }

            case Op.JmpF: {
                let offset = read_byte();
                let cond = session.peek(0) as FGBoolean;
                if (!cond.value)
                    currFrame.ip += offset;
                break;
            }

            case Op.Load: {
                session.push(read_constant());
                break;
            }

            case Op.GetGlob: {
                let name = read_string();
                let value = names[name].value as Value;
                session.push(value);
                break;
            }

            // TODO: as Point is a hack because not all GeoObj have 'field' property.
            case Op.GetProp: {
                let obj = session.pop() as Point;
                let prop = read_string();
                let value = obj.field[prop];
                session.push(value);
                break;
            }

            case Op.GetMeth: {
                let obj = session.pop();
                let prop = read_string();
                console.log(obj);
                let fn = obj.typeof().value.methods[prop].value;
                let method = new FGMethod(obj, fn);
                session.push(method);
                break;
            }

            // TODO: Refactor this!!!
            case Op.GetStat: {
                let obj = session.pop() as FGCallNative;
                let prop = read_string();
                let fn = (obj.sig.sigs[0].output as unknown as Class).methods[prop].value;
                let method = new FGMethod(obj, fn, true);
                session.push(method);
                break;
            }

            case Op.SetProp: {
                let value = session.pop();
                let obj = session.pop() as Point;
                let prop = read_string();
                obj.set(prop, value);
                break;
            }

            case Op.Neg: {
                let a = session.pop() as FGNumber;
                a.value *= -1;
                session.push(a);
                break;
            }

            case Op.Not: {
                let a = session.pop() as FGBoolean;
                a.value = !a.value;
                session.push(a);
                break;
            }

            case Op.New: {
                let name  = read_string();
                let type  = (session.pop() as FGType).value;
                let value = session.pop();
                names[name] = { type, value };
                break;
            }

            case Op.Set: {
                let name  = read_string();
                let value = session.pop();
                names[name].value = value;
                break;
            }

            case Op.List: {
                let length = read_byte();
                let elType = (session.pop() as FGType).value;
                create_list(length, elType);
                break;
            }

            case Op.Len: {
                let list = session.pop() as FGList;
                session.push(new FGNumber(list.value.length));
                break;
            }

            case Op.Index: {
                let id = (session.pop() as FGNumber).value;
                let list = session.pop() as FGList;

                if (id >= list.value.length)
                    error("Out of bound access");
                let value = list.value[id];
                session.push(value);
                break;
            }

            case Op.GetLoc: {
                session.push(session.stack[currFrame.slots + read_byte() ]);
                break;
            }

            // Nothing to do for now. Because all name is immutable.
            // TODO: Should we add the type?? It is not used
            case Op.SetLoc: {
                session.pop();      // Its type
                session.stack[currFrame.slots + read_byte()] = session.peek(0);
                break;
            }

            // TODO: it is redundant to assign type again. The type is same.
            case Op.SetLocG: {
                let name  = read_string();
                // let type  = (session.pop() as FGType).value;
                let value = session.pop();

                // names[name] = { type, value };
                names[name].value = value;
                break;
            }

            case Op.Pop: {
                session.pop();
                break;
            }

            // TODO: think again, can only return one value.
            case Op.Ret: {
                let arg = read_byte();
                let returns: Value[] = [];
                for (let i = 0; i < arg; i++) {
                    returns.push(session.pop());
                }
                // TODO: think how about function that doesn't return value?
                session.stackTop = currFrame.slots - 1;
                for (let i = 0; i < arg; i++) {
                    session.push(returns.pop() as Value);
                }
                frames.pop();
                currFrame = frames[frames.length - 1];
                currChunk = currFrame.fn.chunk;
                if (intercept) return true;
                break;
            }

            case Op.Ok: {
                session.pop();
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

type Result<T> =
    | { ok: true, value: T }
    | { ok: false, error: Error };

export const vm = {
    init(): void {
        session.reset();
        names = {...coreNames, ...extraNames};
    },

    interpret(fn: FGCallUser): Result<string> {
        TESTING = false;
        session.output = "";

        session.push(fn);
        call(fn, 0);

        try {
            run();
            return { ok: true, value: session.output };
        }
        catch (error: unknown) {
            if (error instanceof Error) return { ok: false, error };
            return { ok: false, error: new Error("unknown error") };
        }
    },

    set(fn: FGCallUser): void {
        TESTING = true;
        session.output = "";
        session.push(fn);
        call(fn, 0);
    },

    step(): Result<string> {
        try {
            run();
            return { ok: true, value: session.output };
        }
        catch (error: unknown) {
            if (error instanceof Error) return { ok: false, error };
            return { ok: false, error: new Error("unknown error") };
        }
    }
};
