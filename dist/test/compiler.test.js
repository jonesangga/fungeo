import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Chunk } from "../chunk.js";
import { FGBoolean, FGNumber, FGString } from "../value.js";
import { compiler } from "../compiler.js";
describe("compiler:binary", () => {
    it("+", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 + 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 100,
            1400, 0, 4, 1300,
        ]);
        assert.deepEqual(chunk.values[0], new FGString("num"));
        assert.deepEqual(chunk.values[1], new FGNumber(12));
        assert.deepEqual(chunk.values[2], new FGNumber(34));
    });
    it("-", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 - 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 1500,
            1400, 0, 4, 1300,
        ]);
    });
    it("*", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 * 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 900,
            1400, 0, 4, 1300,
        ]);
    });
    it("/", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 / 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 300,
            1400, 0, 4, 1300,
        ]);
    });
    it("prec: +-", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 + 34 - 56";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 100,
            800, 3, 1500,
            1400, 0, 4, 1300,
        ]);
    });
    it("prec: */", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 * 34 / 56";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 900,
            800, 3, 300,
            1400, 0, 4, 1300,
        ]);
    });
    it("prec: +-*/", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 + 34 * 56 - 78 / 9";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 800, 3,
            900, 100, 800, 4, 800, 5, 300, 1500,
            1400, 0, 4, 1300,
        ]);
    });
    it("with variable", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 12 b = a + 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1400, 0, 4, 500, 3,
            800, 4, 100,
            1400, 2, 4, 1300,
        ]);
    });
    it("error: string + number", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = \"real\" + 2";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '+': '+' only for numbers\n"
        });
    });
    it("error: num * string", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 * \"real\"";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'real': '*' only for numbers\n"
        });
    });
});
describe("compiler:unary", () => {
    it("-", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = -123";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1000,
            1400, 0, 4, 1300,
        ]);
    });
    it("double unary: --", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = --123";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1000, 1000,
            1400, 0, 4, 1300,
        ]);
    });
    it("!", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = !false";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1100,
            1400, 0, 2, 1300,
        ]);
    });
    it("double unary: !!", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = !!false";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1100, 1100,
            1400, 0, 2, 1300,
        ]);
    });
    it("error: -string", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = -\"real\"";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'real': '-' only for number\n"
        });
    });
    it("error: !number", () => {
        let chunk = new Chunk("test chunk");
        let source = "truth = !2";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '2': '!' only for boolean\n"
        });
    });
});
describe("compiler:grouping", () => {
    it("()", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 1 * (2 + 3)";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 800, 3, 100, 900,
            1400, 0, 4, 1300,
        ]);
    });
    it("error: no ')'", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 1 * (2 + 3";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at end: expect ')' after grouping\n"
        });
    });
    it("-()", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = -(2 + 3)";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 100, 1000,
            1400, 0, 4, 1300,
        ]);
    });
    it("error: -(String)", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = -(\"real\")";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at ')': '-' only for number\n"
        });
    });
    it("!()", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = !(false)";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1100,
            1400, 0, 2, 1300,
        ]);
    });
    it("error: !(Number)", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = !(2)";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at ')': '!' only for boolean\n"
        });
    });
});
describe("compiler:assignment", () => {
    it("number, string, boolean", () => {
        let chunk = new Chunk("test chunk");
        let source = `num = 123.456 str = \"real\"
            c = true
            d = false`;
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1400, 0, 4,
            800, 3, 1400, 2, 5,
            800, 5, 1400, 4, 2,
            800, 7, 1400, 6, 2, 1300,
        ]);
        assert.deepEqual(chunk.lines, [
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            2, 2, 2, 2, 2,
            3, 3, 3, 3, 3, 3,
        ]);
        assert.deepEqual(chunk.values[0], new FGString("num"));
        assert.deepEqual(chunk.values[1], new FGNumber(123.456));
        assert.deepEqual(chunk.values[2], new FGString("str"));
        assert.deepEqual(chunk.values[3], new FGString("real"));
        assert.deepEqual(chunk.values[4], new FGString("c"));
        assert.deepEqual(chunk.values[5], new FGBoolean(true));
        assert.deepEqual(chunk.values[6], new FGString("d"));
        assert.deepEqual(chunk.values[7], new FGBoolean(false));
    });
    it("error: reassignment", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 123.456 num = 2";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'num': num already defined\n"
        });
    });
});
describe("compiler", () => {
    it("empty string", () => {
        let chunk = new Chunk("test chunk");
        let source = "";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [1300]);
        assert.deepEqual(chunk.lines, [1]);
        assert.deepEqual(chunk.values, []);
    });
    it("success return", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 123.456";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: true,
        });
    });
    it("semicolon optional delimiter", () => {
        let chunk = new Chunk("test chunk");
        let source = ";num = 123.456; a = 3";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: true,
        });
    });
    it("error: undefined name", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = b";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'b': undefined name b\n"
        });
    });
    it("error: scanner: unexpected character", () => {
        let chunk = new Chunk("test chunk");
        let source = "a % b";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: scanner: unexpected character\n"
        });
    });
    it("error: start statement", () => {
        let chunk = new Chunk("test chunk");
        let source = "2 + 4";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '2': cannot start statement with Number\n"
        });
    });
    it("error: expect expression", () => {
        let chunk = new Chunk("test chunk");
        let source = "a =";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at end: expect expression\n"
        });
    });
    it("error: forbidden expression stmt", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 2 a";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'a': forbidden expression statement\n"
        });
    });
});
