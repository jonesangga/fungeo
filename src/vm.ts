import { Op, Chunk } from "./chunk.js"
import { Kind, KindName, FGBoolean, FGNumber, FGString, FGCallable, type Value } from "./value.js"
import { names } from "./names.js"
import { compiler } from "./compiler.js"

let stack: Value[] = [];
let stackTop = 0;

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

let replOutput = "";
function print_output(s: string): void {
    replOutput += s;
}

const enum InterpretResult {
    Ok,
    CompileError,
    RuntimeError,
};

function add() {
    // let b = asNumber(pop());
    // let a = asNumber(pop());
    // push(newNumber(a + b));
}

let chunk = new Chunk("vm");
let ip    = 0;     // Index of current instruction in chunk.code array.

function read_byte(): number {
    ip++;
    return chunk.code[ip - 1];
}

function read_constant(): Value {
    return chunk.values[read_byte()];
}

function read_string(): string {
    return (read_constant() as FGString).value;
}

function run(): InterpretResult {
    for (;;) {

        let instruction: Op;
        switch (instruction = read_byte()) {
            case Op.Add: add(); break;
            case Op.Load: {
                push(read_constant());
                break;
            }
            case Op.Get: {
                let name = read_string();
                let value = names[name].value as Value;
                push(value);
                break;
            }
            case Op.Set: {
                let name = read_string();
                let kind = read_byte();
                let value = pop();
                names[name] = { kind, value };
                break;
            }
            case Op.Ret: {
                return InterpretResult.Ok;
            }
        }
    }
}

interface VMResult {
    status: InterpretResult;
    message?: string;
}

const vm = {
    init(): void {
        resetStack();
    },

    interpret(chunk_: Chunk): VMResult {
        chunk = chunk_;
        ip = 0;

        replOutput = "";
        let result = run();
        if (result === InterpretResult.Ok) {
            return {status: result, message: replOutput};
        } else {
            return {status: result, message: "runtime: " + replOutput};
        }
    }
};

export { vm };
