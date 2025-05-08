import { Op, Chunk } from "./chunk.js"
import { Kind, KindName, FGBoolean, FGNumber, FGString, FGCallable, type Value } from "./value.js"
import { nativeNames, userNames } from "./names.js"
import { compiler } from "./compiler.js"

const TESTING = true;

export let stack: Value[] = [];
export let stackTop = 0;

function push(value: Value): void {
    stack[stackTop++] = value;
}

function pop(): Value {
    return stack[--stackTop];
}

function peek(distance: number): Value {
    return stack[stackTop - 1 - distance];
}

function resetStack(): void {
    stackTop = 0;
}

let output = "";

let chunk = new Chunk("vm");
let ip    = 0;     // Index of current instruction in chunk.code array.

function error(msg: string): void {
    let line = chunk.lines[ip - 1];
    output += `${ line }: in script: ${ msg }\n`;
    resetStack();
}

function read_byte(): number {
    return chunk.code[ip++];
}

function read_constant(): Value {
    return chunk.values[read_byte()];
}

function read_string(): string {
    return (read_constant() as FGString).value;
}

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
            let [result, ] = chunk.disassemble_instr(ip);
            console.log(str + result);
        }

        switch (read_byte()) {
            case Op.Add: {
                let b = pop() as FGNumber;
                let a = pop() as FGNumber;
                push(a.add(b));
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

            case Op.Ret: {
                return true;
            }
        }

        if (TESTING) return true;
    }
}

interface VMResult {
    success: boolean;
    message?: string;
}

const vm = {
    init(): void {
        resetStack();
        for (let name in userNames) {
            delete userNames[name];
        }
    },

    interpret(chunk_: Chunk): VMResult {
        chunk = chunk_;
        ip = 0;
        output = "";

        let result = run();
        if (result) {
            return {success: true, message: output};
        } else {
            return {success: false, message: output};
        }
    },

    set(chunk_: Chunk): void {
        chunk = chunk_;
        ip = 0;
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
