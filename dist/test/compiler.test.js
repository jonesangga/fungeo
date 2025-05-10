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
            1400, 0, 500, 1300,
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
            1400, 0, 500, 1300,
        ]);
    });
    it("*", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 * 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 900,
            1400, 0, 500, 1300,
        ]);
    });
    it("/", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 / 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 300,
            1400, 0, 500, 1300,
        ]);
    });
    it("prec: +-", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 + 34 - 56";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 100,
            800, 3, 1500,
            1400, 0, 500, 1300,
        ]);
    });
    it("prec: */", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 * 34 / 56";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 900,
            800, 3, 300,
            1400, 0, 500, 1300,
        ]);
    });
    it("prec: +-*/", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 + 34 * 56 - 78 / 9";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 800, 3,
            900, 100, 800, 4, 800, 5, 300, 1500,
            1400, 0, 500, 1300,
        ]);
    });
    it("with variable", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 12 b = a + 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1400, 0, 500, 500, 3,
            800, 4, 100,
            1400, 2, 500, 1300,
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
describe("compiler:binary_str", () => {
    it("++", () => {
        let chunk = new Chunk("test chunk");
        let source = "str = \"so \" ++ \"real\"";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 120,
            1400, 0, 600, 1300,
        ]);
        assert.deepEqual(chunk.values[0], new FGString("str"));
        assert.deepEqual(chunk.values[1], new FGString("so "));
        assert.deepEqual(chunk.values[2], new FGString("real"));
    });
    it("error: string ++ number", () => {
        let chunk = new Chunk("test chunk");
        let source = "str = \"real\" ++ 2";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '2': '++' only for strings\n"
        });
    });
});
describe("compiler:not", () => {
    it("!", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = !false";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1100,
            1400, 0, 300, 1300,
        ]);
    });
    it("double unary: !!", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = !!false";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1100, 1100,
            1400, 0, 300, 1300,
        ]);
    });
    it("error: !number", () => {
        let chunk = new Chunk("test chunk");
        let source = "truth = !2";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '2': '!' is only for boolean\n"
        });
    });
});
describe("compiler:eq", () => {
    it("==", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 2 == 3";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 380,
            1400, 0, 300, 1300,
        ]);
    });
});
describe("compiler:neq", () => {
    it("!=", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 2 != 3";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 1010,
            1400, 0, 300, 1300,
        ]);
    });
});
describe("compiler:compare", () => {
    it("<", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 12 < 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 810,
            1400, 0, 300, 1300,
        ]);
    });
    it("<=", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 12 <= 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 690,
            1400, 0, 300, 1300,
        ]);
    });
    it(">", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 12 > 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 530,
            1400, 0, 300, 1300,
        ]);
    });
    it(">=", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 12 >= 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 800, 2, 390,
            1400, 0, 300, 1300,
        ]);
    });
});
describe("compiler:negate", () => {
    it("-", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = -123";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1000,
            1400, 0, 500, 1300,
        ]);
    });
    it("double unary: --", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = --123";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1000, 1000,
            1400, 0, 500, 1300,
        ]);
    });
    it("error: -string", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = -\"real\"";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'real': '-' is only for number\n"
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
            1400, 0, 500, 1300,
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
            1400, 0, 500, 1300,
        ]);
    });
    it("error: -(String)", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = -(\"real\")";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at ')': '-' is only for number\n"
        });
    });
    it("!()", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = !(false)";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 1, 1100,
            1400, 0, 300, 1300,
        ]);
    });
    it("error: !(Number)", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = !(2)";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at ')': '!' is only for boolean\n"
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
            800, 1, 1400, 0, 500,
            800, 3, 1400, 2, 600,
            800, 5, 1400, 4, 300,
            800, 7, 1400, 6, 300, 1300,
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
            success: false, message: "1: at '=': num already defined\n"
        });
    });
});
describe("compiler:block", () => {
    it("simple { }, SetLoc", () => {
        let chunk = new Chunk("test chunk");
        let source = "{a = 1}";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 0, 1410, 1200, 1300,
        ]);
        assert.deepEqual(chunk.values[0], new FGNumber(1));
    });
    it("simple { }, GetLoc", () => {
        let chunk = new Chunk("test chunk");
        let source = "{a = 1 Print a}";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 0, 1410, 395, 0,
            200, 1, 0, 1200, 1300,
        ]);
        assert.deepEqual(chunk.values[0], new FGNumber(1));
    });
    it("nested { }", () => {
        let chunk = new Chunk("test chunk");
        let source = `
            {
              a = 1
              {
                a = 2
                Print a
              }
              Print a
            }
        `;
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            800, 0, 1410,
            800, 1, 1410,
            395, 1, 200, 2, 0, 1200,
            395, 0, 200, 3, 0, 1200,
            1300,
        ]);
        assert.deepEqual(chunk.values[0], new FGNumber(1));
        assert.deepEqual(chunk.values[1], new FGNumber(2));
    });
    it("error: duplicate", () => {
        let chunk = new Chunk("test chunk");
        let source = "{a = 1 a = 2}";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '=': a already defined in this scope\n"
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
            success: false, message: "1: scanner: unexpected character %\n"
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
