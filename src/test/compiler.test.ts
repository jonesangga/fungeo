// @jonesangga, 05-05-2025, MIT License.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Op, OpName, Chunk } from "../chunk.js"
import { Kind, FGBoolean, FGNumber, FGString } from "../value.js"
import { compiler } from "../compiler.js"

describe("compiler:binary", () => {

    it("+", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 + 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.Add,
            Op.Set, 0, Kind.Number, Op.Ret,
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
            Op.Load, 1, Op.Load, 2, Op.Sub,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("*", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 * 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.Mul,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("/", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 / 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.Div,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("prec: +-", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 + 34 - 56";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.Add,
            Op.Load, 3, Op.Sub,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("prec: */", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 * 34 / 56";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.Mul,
            Op.Load, 3, Op.Div,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("prec: +-*/", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 + 34 * 56 - 78 / 9";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.Load, 3,
            Op.Mul, Op.Add, Op.Load, 4, Op.Load, 5, Op.Div, Op.Sub,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("with variable", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 12 b = a + 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Set, 0, Kind.Number, Op.GetUsr, 3,
            Op.Load, 4, Op.Add,
            Op.Set, 2, Kind.Number, Op.Ret,
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
            Op.Load, 1, Op.Load, 2, Op.AddStr,
            Op.Set, 0, Kind.String, Op.Ret,
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
            Op.Load, 1, Op.Not,
            Op.Set, 0, Kind.Boolean, Op.Ret,
        ]);
    });

    it("double unary: !!", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = !!false";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Not, Op.Not,
            Op.Set, 0, Kind.Boolean, Op.Ret,
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
            Op.Load, 1, Op.Load, 2, Op.Eq,
            Op.Set, 0, Kind.Boolean, Op.Ret,
        ]);
    });

});

describe("compiler:neq", () => {

    it("!=", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 2 != 3";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.NEq,
            Op.Set, 0, Kind.Boolean, Op.Ret,
        ]);
    });

});

describe("compiler:compare", () => {

    it("<", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 12 < 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.LT,
            Op.Set, 0, Kind.Boolean, Op.Ret,
        ]);
    });

    it("<=", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 12 <= 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.LEq,
            Op.Set, 0, Kind.Boolean, Op.Ret,
        ]);
    });

    it(">", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 12 > 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.GT,
            Op.Set, 0, Kind.Boolean, Op.Ret,
        ]);
    });

    it(">=", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 12 >= 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.GEq,
            Op.Set, 0, Kind.Boolean, Op.Ret,
        ]);
    });
});

describe("compiler:negate", () => {

    it("-", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = -123";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Neg,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("double unary: --", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = --123";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Neg, Op.Neg,
            Op.Set, 0, Kind.Number, Op.Ret,
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
            Op.Load, 1, Op.Load, 2, Op.Load, 3, Op.Add, Op.Mul,
            Op.Set, 0, Kind.Number, Op.Ret,
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
            Op.Load, 1, Op.Load, 2, Op.Add, Op.Neg,
            Op.Set, 0, Kind.Number, Op.Ret,
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
            Op.Load, 1, Op.Not,
            Op.Set, 0, Kind.Boolean, Op.Ret,
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
            Op.Load, 1, Op.Set, 0, Kind.Number,
            Op.Load, 3, Op.Set, 2, Kind.String,
            Op.Load, 5, Op.Set, 4, Kind.Boolean,
            Op.Load, 7, Op.Set, 6, Kind.Boolean, Op.Ret,
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

describe("compiler", () => {

    it("empty string", () => {
        let chunk = new Chunk("test chunk");
        let source = "";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [Op.Ret]);
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
