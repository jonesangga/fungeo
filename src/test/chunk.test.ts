// @jonesangga, 05-05-2025, MIT License.
//
// TODO: Test disassemble().

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Op, OpName, Chunk } from "../chunk.js"
import { Kind, FGNumber, FGString } from "../value.js"

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

    it("Op.Load", () => {
        let chunk = new Chunk("test chunk");
        let n = new FGNumber(2);
        let id = chunk.add_value(n);
        chunk.write(Op.Load, 100);
        chunk.write(id, 100);

        let a = new FGString("a");
        id = chunk.add_value(a);
        chunk.write(Op.GetUsr, 110);
        chunk.write(id, 110);

        let result = "";
        let offset = 0;
        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0000  100 Load       0 '2'\n");
        assert.equal(offset, 2);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0002  110 GetUsr     1 'a'\n");
        assert.equal(offset, 4);
    });

    it("Op.Ret", () => {
        let chunk = new Chunk("test chunk");
        chunk.write(Op.Add, 50);
        chunk.write(Op.Div, 60);
        chunk.write(Op.Neg, 70);
        chunk.write(Op.Not, 80);
        chunk.write(Op.Mul, 90);
        chunk.write(Op.Ret, 100);
        chunk.write(Op.Sub, 110);

        let result = "";
        let offset = 0;
        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0000   50 Add\n");
        assert.equal(offset, 1);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0001   60 Div\n");
        assert.equal(offset, 2);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0002   70 Neg\n");
        assert.equal(offset, 3);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0003   80 Not\n");
        assert.equal(offset, 4);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0004   90 Mul\n");
        assert.equal(offset, 5);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0005  100 Ret\n");
        assert.equal(offset, 6);

        [result, offset] = chunk.disassemble_instr(offset);
        assert.deepEqual(result, "0006  110 Sub\n");
        assert.equal(offset, 7);
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
