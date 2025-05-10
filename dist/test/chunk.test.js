import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Chunk } from "../chunk.js";
import { FGNumber, FGString } from "../value.js";
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
        chunk.write(800, 1);
        chunk.write(100, 2);
        assert.deepEqual(chunk.code, [800, 100]);
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
    function t(op, expect) {
        let chunk = new Chunk("");
        chunk.write(op, 123);
        let [result, offset] = chunk.disassemble_instr(0);
        assert.deepEqual(result, expect);
        assert.equal(offset, 1);
    }
    it("all op with no arg", () => {
        t(100, "0000  123 Add\n");
        t(120, "0000  123 AddStr\n");
        t(300, "0000  123 Div\n");
        t(380, "0000  123 Eq\n");
        t(390, "0000  123 GEq\n");
        t(530, "0000  123 GT\n");
        t(690, "0000  123 LEq\n");
        t(810, "0000  123 LT\n");
        t(900, "0000  123 Mul\n");
        t(1000, "0000  123 Neg\n");
        t(1010, "0000  123 NEq\n");
        t(1100, "0000  123 Not\n");
        t(1300, "0000  123 Ret\n");
        t(1500, "0000  123 Sub\n");
    });
    function s(op, expect) {
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
        s(400, "0000  100 GetNat     0 '123'\n");
        s(500, "0000  100 GetUsr     0 '123'\n");
        s(800, "0000  100 Load       0 '123'\n");
    });
    it("Op.GetLoc, Op.SetLoc, Op.Pop", () => {
        let chunk = new Chunk("");
        let n = new FGNumber(123);
        let id = chunk.add_value(n);
        chunk.write(800, 100);
        chunk.write(id, 100);
        chunk.write(1410, 100);
        chunk.write(395, 101);
        chunk.write(0, 101);
        chunk.write(1410, 101);
        chunk.write(1200, 101);
        chunk.write(1200, 101);
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
    it("Op.CallNat", () => {
        let chunk = new Chunk("test chunk");
        let n = new FGNumber(2);
        let id = chunk.add_value(n);
        chunk.write(800, 100);
        chunk.write(id, 100);
        let a = new FGString("a");
        id = chunk.add_value(a);
        chunk.write(200, 110);
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
        let kind = 500;
        let id = chunk.add_value(name);
        chunk.write(1400, 123);
        chunk.write(id, 123);
        chunk.write(kind, 123);
        let [result, offset] = chunk.disassemble_instr(0);
        assert.deepEqual(result, "0000  123 Set        0 'a: Number'\n");
        assert.equal(offset, 3);
    });
    it("default", () => {
        let chunk = new Chunk("test chunk");
        chunk.write(78, 123);
        let [result, offset] = chunk.disassemble_instr(0);
        assert.deepEqual(result, "0000  123 Unknown code 78\n");
        assert.equal(offset, 1);
    });
});
