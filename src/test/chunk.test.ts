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
        chunk.write(Op.Load, 123);
        let id = chunk.add_value(n);
        chunk.write(id, 123);
        let [result, offset] = chunk.disassemble_instr(0);
        assert.deepEqual(result, "0000  123 Load      0 '2'\n");
        assert.equal(offset, 2);
    });

    it("Op.Ret", () => {
        let chunk = new Chunk("test chunk");
        chunk.write(Op.Ret, 123);
        let [result, offset] = chunk.disassemble_instr(0);
        assert.deepEqual(result, "0000  123 Ret\n");
        assert.equal(offset, 1);
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
        assert.deepEqual(result, "0000  123 Set       0 'a: Number'\n");
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
