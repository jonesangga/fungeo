import 'global-jsdom/register';
import { describe, it } from "node:test";
import { equal, deepEqual } from "node:assert/strict";
import { OpName, Chunk } from "../chunk.js";
import { FGNumber, FGString } from "../value.js";
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
        chunk.write(800, 1);
        chunk.write(1, 2);
        deepEqual(chunk.code, [800, 1]);
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
    const tests = [
        [100, "0000  123 Add\n"],
        [120, "0000  123 AddStr\n"],
        [300, "0000  123 Div\n"],
        [380, "0000  123 Eq\n"],
        [390, "0000  123 GEq\n"],
        [530, "0000  123 GT\n"],
        [610, "0000  123 IsDiv\n"],
        [690, "0000  123 LEq\n"],
        [810, "0000  123 LT\n"],
        [900, "0000  123 Mul\n"],
        [1000, "0000  123 Neg\n"],
        [1010, "0000  123 NEq\n"],
        [1100, "0000  123 Not\n"],
        [1150, "0000  123 Ok\n"],
        [1200, "0000  123 Pop\n"],
        [1500, "0000  123 Sub\n"],
    ];
    for (let [op, expected] of tests) {
        it(`Op.${OpName[op]}`, () => {
            let chunk = new Chunk("");
            chunk.write(op, 123);
            let [result, offset] = chunk.disassemble_instr(0);
            deepEqual(result, expected);
            equal(offset, 1);
        });
    }
});
describe("chunk disassemble op arg", () => {
    const tests = [
        [210, "0000  100 CkExc      2\n"],
        [215, "0000  100 CkInc      2\n"],
        [395, "0000  100 GetLoc     2\n"],
        [595, "0000  100 Inc        2\n"],
        [1300, "0000  100 Ret        2\n"],
    ];
    for (let [op, expected] of tests) {
        it(`Op.${OpName[op]}`, () => {
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
    const tests = [
        [500, "0000  100 GetGlob    0 '123'\n"],
        [800, "0000  100 Load       0 '123'\n"],
    ];
    for (let [op, expected] of tests) {
        it(`Op.${OpName[op]}`, () => {
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
        let index = chunk.add_value(name);
        chunk.write(1400, 123);
        chunk.write(index, 123);
        let [result, offset] = chunk.disassemble_instr(0);
        deepEqual(result, "0000  123 Set        0 'a'\n");
        equal(offset, 2);
    });
});
describe("chunk disassemble op jumps", () => {
    const tests = [
        [615, 5, "0000  100 Jmp        0 -> 7\n"],
        [620, 5, "0000  100 JmpF       0 -> 7\n"],
        [616, -5, "0000  100 JmpBack    0 -> -3\n"],
    ];
    for (let [op, jump, expected] of tests) {
        it(`Op.${OpName[op]}`, () => {
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
