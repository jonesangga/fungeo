// @jonesangga, 05-05-2025, MIT License.
//
// TODO: Test disassemble().

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Op, OpName, Chunk } from "../chunk.js"
import { Kind, FGNumber, FGString } from "../value.js"
import { compiler } from "../compiler.js"

describe("chunk", () => {

    it("constructor()", () => {
        let chunk = new Chunk("test chunk");
        assert.equal(chunk.name, "test chunk");
        assert.deepEqual(chunk.code, []);
        assert.deepEqual(chunk.lines, []);
        assert.deepEqual(chunk.values, []);
    });

    it("write()", () => {
        let chunk = new Chunk("test chunk");
        chunk.write(Op.Load, 1);
        chunk.write(Op.Add, 2);
        assert.deepEqual(chunk.code, [Op.Load, Op.Add]);
        assert.deepEqual(chunk.lines, [1, 2]);
        assert.deepEqual(chunk.values, []);
    });

    it("add_value()", () => {
        let chunk = new Chunk("test chunk");
        let n = new FGNumber(2);
        let s = new FGString("real");
        chunk.add_value(n);
        chunk.add_value(s);
        assert.deepEqual(chunk.values, [n, s]);
    });
});

describe("chunk:disassemble_instr", () => {

    function t(op: Op, expect: string): void {
        let chunk = new Chunk("");
        chunk.write(op, 123);

        let [result, offset] = chunk.disassemble_instr(0);
        assert.deepEqual(result, expect);
        assert.equal(offset, 1);
    }

    it("all op with no arg", () => {
        t(Op.Add, "0000  123 Add\n");
        t(Op.AddStr, "0000  123 AddStr\n");
        t(Op.Div, "0000  123 Div\n");
        t(Op.Eq, "0000  123 Eq\n");
        t(Op.GEq, "0000  123 GEq\n");
        t(Op.GT, "0000  123 GT\n");
        t(Op.IsDiv, "0000  123 IsDiv\n");
        t(Op.LEq, "0000  123 LEq\n");
        t(Op.LT, "0000  123 LT\n");
        t(Op.Mul, "0000  123 Mul\n");
        t(Op.Neg, "0000  123 Neg\n");
        t(Op.NEq, "0000  123 NEq\n");
        t(Op.Not, "0000  123 Not\n");
        t(Op.Ret, "0000  123 Ret\n");
        t(Op.Sub, "0000  123 Sub\n");
    });

    function s(op: Op, expect: string): void {
        let chunk = new Chunk("");
        let n = new FGNumber(123);
        let id = chunk.add_value(n);
        chunk.write(op, 100);
        chunk.write(id, 100);

        let [result, offset] = chunk.disassemble_instr(0);
        assert.deepEqual(result, expect);
        assert.equal(offset, 2);
    }

    it("Load and Get", () => {
        s(Op.GetNat, "0000  100 GetNat     0 '123'\n");
        s(Op.GetUsr, "0000  100 GetUsr     0 '123'\n");
        s(Op.Load, "0000  100 Load       0 '123'\n");
    });

    function r(op: Op, expect: string): void {
        let chunk = new Chunk("");
        let start = 3;
        chunk.write(op, 100);
        chunk.write(start, 100);

        let [result, offset] = chunk.disassemble_instr(0);
        assert.deepEqual(result, expect);
        assert.equal(offset, 2);
    }

    it("Cond and Inc", () => {
        r(Op.Cond, "0000  100 Cond       3\n");
        r(Op.Inc, "0000  100 Inc        3\n");
    });

    it("Op.GetLoc, Op.SetLoc, Op.Pop", () => {
        let chunk = new Chunk("");
        // compiler.compiler("{a = 123 b = a}");
        let n = new FGNumber(123);
        let id = chunk.add_value(n);
        chunk.write(Op.Load, 100);
        chunk.write(id, 100);
        chunk.write(Op.SetLoc, 100);
        chunk.write(Op.GetLoc, 101);
        chunk.write(0, 101);
        chunk.write(Op.SetLoc, 101);
        chunk.write(Op.Pop, 101);
        chunk.write(Op.Pop, 101);

        let result = "";
        let offset = 0;
        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0000  100 Load       0 '123'\n");
        assert.equal(offset, 2);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0002    | SetLoc\n");
        assert.equal(offset, 3);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0003  101 GetLoc     0\n");
        assert.equal(offset, 5);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0005    | SetLoc\n");
        assert.equal(offset, 6);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0006    | Pop\n");
        assert.equal(offset, 7);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0007    | Pop\n");
        assert.equal(offset, 8);
    });

    it("Op.Jmp, Op.JmpF", () => {
        let chunk = new Chunk("");
        compiler.compile("if 1 < 2 Print \"correct\" else Print \"wrong\"", chunk);
        console.log(chunk);

        let result = "";
        let offset = 0;
        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0000    1 Load       0 '1'\n");
        assert.equal(offset, 2);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0002    | Load       1 '2'\n");
        assert.equal(offset, 4);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0004    | LT\n");
        assert.equal(offset, 5);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0005    | JmpF       5 -> 15\n");
        assert.equal(offset, 7);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0007    | Pop\n");
        assert.equal(offset, 8);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0008    | Load       2 'correct'\n");
        assert.equal(offset, 10);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0010    | CallNat    3 'v0'\n");
        assert.equal(offset, 13);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0013    | Jmp       13 -> 21\n");
        assert.equal(offset, 15);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0015    | Pop\n");
        assert.equal(offset, 16);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0016    | Load       4 'wrong'\n");
        assert.equal(offset, 18);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0018    | CallNat    5 'v0'\n");
        assert.equal(offset, 21);

    });

    // it("Op.JmpBack", () => {
        // let chunk = new Chunk("");
        // compiler.compile("[1,3] -> i Print i", chunk);
        // console.log(chunk);

        // let result = "";
        // let offset = 0;
        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0000    1 Load       0 '1'\n");
        // assert.equal(offset, 2);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0002    | Load       1 '3'\n");
        // assert.equal(offset, 4);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0004    | SetLoc\n");
        // assert.equal(offset, 5);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0005    | Cond       0\n");
        // assert.equal(offset, 7);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0007    | JmpF       7 -> 19\n");
        // assert.equal(offset, 9);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0009    | Pop\n");
        // assert.equal(offset, 10);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0010    | GetLoc     0\n");
        // assert.equal(offset, 12);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0012    | CallNat    2 'v0'\n");
        // assert.equal(offset, 15);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0015    | Inc        0\n");
        // assert.equal(offset, 17);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0017    | JmpBack   17 -> 5\n");
        // assert.equal(offset, 19);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0019    | Pop\n");
        // assert.equal(offset, 20);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0020    | Pop\n");
        // assert.equal(offset, 21);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0021    | Pop\n");
        // assert.equal(offset, 22);

        // [result, offset] = chunk.disassemble_instr(offset);
        // assert.deepEqual(result, "0022    | Ret\n");
        // assert.equal(offset, 23);
    // });

    it("Op.CallNat", () => {
        let chunk = new Chunk("test chunk");
        let n = new FGNumber(2);
        let id = chunk.add_value(n);
        chunk.write(Op.Load, 100);
        chunk.write(id, 100);

        let a = new FGString("a");
        id = chunk.add_value(a);
        chunk.write(Op.CallNat, 110);
        chunk.write(id, 110);
        chunk.write(0, 110);

        let result = "";
        let offset = 0;
        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0000  100 Load       0 '2'\n");
        assert.equal(offset, 2);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0002  110 CallNat    1 'v0'\n");
        assert.equal(offset, 5);
    });

    it("Op.Set", () => {
        let chunk = new Chunk("test chunk");
        let name = new FGString("a");
        let kind: number = Kind.Number;
        let id = chunk.add_value(name);
        chunk.write(Op.Set, 123);
        chunk.write(id, 123);
        chunk.write(kind, 123);

        let [result, offset] = chunk.disassemble_instr(0);
        assert.deepEqual(result, "0000  123 Set        0 'a: Number'\n");
        assert.equal(offset, 3);
    });

    it("default", () => {
        let chunk = new Chunk("test chunk");
        chunk.write(78 as number, 123);

        let [result, offset] = chunk.disassemble_instr(0);
        assert.deepEqual(result, "0000  123 Unknown code 78\n");
        assert.equal(offset, 1);
    });
});
