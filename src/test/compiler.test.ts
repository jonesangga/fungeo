// @jonesangga, 05-05-2025, MIT License.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Op, OpName, Chunk } from "../chunk.js"
import { Kind, FGBoolean, FGNumber, FGString } from "../value.js"
import { compiler } from "../compiler.js"

describe("compiler", () => {

    it("empty string", () => {
        let chunk = new Chunk("test chunk");
        let source = "";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [Op.Ret]);
        assert.deepEqual(chunk.lines, [1]);
        assert.deepEqual(chunk.values, []);
    });

    it("number, string, boolean assignment", () => {
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

    it("binary: +", () => {
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

    it("binary: -", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 - 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.Sub,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("binary: *", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 * 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.Mul,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("binary: /", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 / 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.Div,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("binary prec: +-", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 + 34 - 56";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.Add,
            Op.Load, 3, Op.Sub,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("binary prec: */", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 * 34 / 56";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.Mul,
            Op.Load, 3, Op.Div,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("binary prec: +-*/", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 + 34 * 56 - 78 / 9";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.Load, 3,
            Op.Mul, Op.Add, Op.Load, 4, Op.Load, 5, Op.Div, Op.Sub,
            Op.Set, 0, Kind.Number, Op.Ret,
        ]);
    });

    it("binary with variable", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 12 b = a + 34";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Set, 0, Kind.Number, Op.Get, 3,
            Op.Load, 4, Op.Add,
            Op.Set, 2, Kind.Number, Op.Ret,
        ]);
    });

    it("error binary: string + number", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = \"real\" + 2";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '+': '+' only for numbers\n"
        });
    });

    it("error binary: num * string", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 12 * \"real\"";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'real': '*' only for numbers\n"
        });
    });

    it("unary: -", () => {
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

    it("unary: !", () => {
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

    it("error unary: -string", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = -\"real\"";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'real': '-' only for number\n"
        });
    });

    it("error unary: !number", () => {
        let chunk = new Chunk("test chunk");
        let source = "truth = !2";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '2': '!' only for boolean\n"
        });
    });

    it("reassignment error", () => {
        let chunk = new Chunk("test chunk");
        let source = "num = 123.456 num = 2";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'num': num already defined\n"
        });
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

    it("error: forbidden expression stmt", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = 2 a";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'a': forbidden expression statement\n"
        });
    });

});
