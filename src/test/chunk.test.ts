// @jonesangga, 05-05-2025, MIT License.
//
// TODO: Test disassemble().

import { describe, it } from "node:test";
import { equal, deepEqual } from "node:assert/strict";
import { Op, OpName, Chunk } from "../chunk.js"
import { Kind, FGNumber, FGString, FGFunction, FGCallable } from "../value.js"
import { nativeNames } from "../names.js"

describe("chunk", () => {
    it("constructor()", () => {
        let chunk = new Chunk("test chunk");

        equal(chunk.name, "test chunk");
        deepEqual(chunk.code, []);
        deepEqual(chunk.lines, []);
        deepEqual(chunk.values, []);
    });

    it("write()", () => {
        let chunk = new Chunk("test chunk");

        chunk.write(Op.Load, 1);
        chunk.write(1, 2);

        deepEqual(chunk.code, [Op.Load, 1]);
        deepEqual(chunk.lines, [1, 2]);
        deepEqual(chunk.values, []);
    });

    it("add_value()", () => {
        let chunk = new Chunk("test chunk");
        let n = new FGNumber(2);
        let s = new FGString("real");

        chunk.add_value(n);
        chunk.add_value(s);

        deepEqual(chunk.values, [n, s]);
    });
});

describe("chunk disassemble op with no arg", () => {
    const tests: [Op, string][] = [
        [Op.Add, "0000  123 Add\n"],
        [Op.AddStr, "0000  123 AddStr\n"],
        [Op.Div, "0000  123 Div\n"],
        [Op.Eq, "0000  123 Eq\n"],
        [Op.GEq, "0000  123 GEq\n"],
        [Op.GT, "0000  123 GT\n"],
        [Op.IsDiv, "0000  123 IsDiv\n"],
        [Op.LEq, "0000  123 LEq\n"],
        [Op.LT, "0000  123 LT\n"],
        [Op.Mul, "0000  123 Mul\n"],
        [Op.Neg, "0000  123 Neg\n"],
        [Op.NEq, "0000  123 NEq\n"],
        [Op.Not, "0000  123 Not\n"],
        [Op.Ok, "0000  123 Ok\n"],
        [Op.Pop, "0000  123 Pop\n"],
        [Op.SetLoc, "0000  123 SetLoc\n"],
        [Op.Sub, "0000  123 Sub\n"],
    ];

    for (let [op, expected] of tests) {
        it(`Op.${ OpName[op] }`, () => {
            let chunk = new Chunk("");
            chunk.write(op, 123);

            let [result, offset] = chunk.disassemble_instr(0);

            deepEqual(result, expected);
            equal(offset, 1);
        });
    }
});

describe("chunk disassemble op arg", () => {
    const tests: [Op, string][] = [
        [Op.CkExc, "0000  100 CkExc      2\n"],
        [Op.CkInc, "0000  100 CkInc      2\n"],
        [Op.GetLoc, "0000  100 GetLoc     2\n"],
        [Op.Inc, "0000  100 Inc        2\n"],
        [Op.Ret, "0000  100 Ret        2\n"],
    ];

    for (let [op, expected] of tests) {
        it(`Op.${ OpName[op] }`, () => {
            let chunk = new Chunk("");
            let index = 2;
            chunk.write(op, 100);
            chunk.write(index, 100);

            let [result, offset] = chunk.disassemble_instr(0);

            deepEqual(result, expected);
            equal(offset, 2);
        });
    }
});

describe("chunk disassemble op arg and value", () => {
    const tests: [Op, string][] = [
        [Op.GetNat, "0000  100 GetNat     0 '123'\n"],
        [Op.GetUsr, "0000  100 GetUsr     0 '123'\n"],
        [Op.Load, "0000  100 Load       0 '123'\n"],
    ];

    for (let [op, expected] of tests) {
        it(`Op.${ OpName[op] }`, () => {
            let chunk = new Chunk("");
            let n = new FGNumber(123);
            let id = chunk.add_value(n);
            chunk.write(op, 100);
            chunk.write(id, 100);

            let [result, offset] = chunk.disassemble_instr(0);

            deepEqual(result, expected);
            equal(offset, 2);
        });
    }
});

describe("chunk disassemble op set", () => {
    it("Op.Set", () => {
        let chunk = new Chunk("test chunk");
        let name = new FGString("a");
        let kind = Kind.Number;
        let id = chunk.add_value(name);
        chunk.write(Op.Set, 123);
        chunk.write(id, 123);
        chunk.write(kind, 123);

        let [result, offset] = chunk.disassemble_instr(0);

        deepEqual(result, "0000  123 Set        0 'a: Number'\n");
        equal(offset, 3);
    });
});

describe("chunk disassemble op jumps", () => {
    const tests: [Op, number, string][] = [
        [Op.Jmp, 5, "0000  100 Jmp        0 -> 7\n"],
        [Op.JmpF, 5, "0000  100 JmpF       0 -> 7\n"],
        [Op.JmpBack, -5, "0000  100 JmpBack    0 -> -3\n"],
    ];

    for (let [op, jump, expected] of tests) {
        it(`Op.${ OpName[op] }`, () => {
            let chunk = new Chunk("");
            chunk.write(op, 100);
            chunk.write(jump, 100);

            let [result, offset] = chunk.disassemble_instr(0);

            deepEqual(result, expected);
            equal(offset, 2);
        });
    }
});

describe("chunk disassemble op calls", () => {
    it("Op.CallNat", () => {
        let chunk = new Chunk("test chunk");
        let fn = nativeNames["Print"].value as FGCallable;
        let arity = 1;
        let ver = 1;
        chunk.write(Op.CallNat, 123);
        chunk.write(arity, 123);
        chunk.write(ver, 123);

        let [result, offset] = chunk.disassemble_instr(0);

        deepEqual(result, "0000  123 CallNat    1 'v1'\n");
        equal(offset, 3);
    });

    it("Op.CallUsr", () => {
        let chunk = new Chunk("test chunk");
        let fn = new FGFunction("dummy", [], new Chunk("dummy chunk"));
        let arity = 1;
        let ver = 1;
        chunk.write(Op.CallUsr, 123);
        chunk.write(arity, 123);
        chunk.write(ver, 123);

        let [result, offset] = chunk.disassemble_instr(0);

        deepEqual(result, "0000  123 CallUsr    1 'v1'\n");
        equal(offset, 3);
    });
});

describe("chunk disassemble default", () => {
    it("default", () => {
        let chunk = new Chunk("test chunk");
        chunk.write(78, 123);

        let [result, offset] = chunk.disassemble_instr(0);

        deepEqual(result, "0000  123 Unknown code 78\n");
        equal(offset, 1);
    });
});
