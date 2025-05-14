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

    it("|", () => {
        let chunk = new Chunk("test chunk");
        let source = "multipleOf2 = 2 | 6";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.IsDiv,
            Op.Set, 0, Kind.Boolean, Op.Ret,
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

describe("compiler:if", () => {

    it("success", () => {
        let chunk = new Chunk("test chunk");
        let source = "if 1 < 2 Print \"correct\" else Print \"wrong\"";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 0, Op.Load, 1, Op.LT, Op.JmpF, 8, Op.Pop,
            Op.Load, 2, Op.CallNat, 3, 0, Op.Jmp, 6, Op.Pop,
            Op.Load, 4, Op.CallNat, 5, 0, Op.Ret
        ]);
    });

    it("error", () => {
        let chunk = new Chunk("test chunk");
        let source = 'if "real" Print "correct" else Print "wrong"';
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'real': conditional expression must be boolean\n"
        });
    });
});

describe("compiler:&&", () => {

    it("success", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = true && true";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.JmpF, 3, Op.Pop,
            Op.Load, 2, Op.Set, 0, Kind.Boolean, Op.Ret
        ]);
    });

    it("error: left", () => {
        let chunk = new Chunk("test chunk");
        let source = 'a = "real" && false';
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '&&': operands of '&&' must be boolean\n"
        });
    });

    it("error: right", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = true && 2";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '2': operands of '&&' must be boolean\n"
        });
    });
});

describe("compiler:||", () => {

    it("success", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = true || true";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 1, Op.JmpF, 2, Op.Jmp, 3, Op.Pop,
            Op.Load, 2, Op.Set, 0, Kind.Boolean, Op.Ret
        ]);
    });

    it("error: left", () => {
        let chunk = new Chunk("test chunk");
        let source = 'a = "real" || true';
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '||': operands of '||' must be boolean\n"
        });
    });

    it("error: right", () => {
        let chunk = new Chunk("test chunk");
        let source = "a = true || 2";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '2': operands of '||' must be boolean\n"
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

describe("compiler:loop", () => {

    it("success: single", () => {
        let chunk = new Chunk("test chunk");
        let source = "[1,5] i Print i";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 0, Op.Load, 1, Op.Load, 2, Op.Add, Op.Load, 3, Op.SetLoc,
            Op.Cond, 0, Op.JmpF, 10, Op.Pop,
            Op.GetLoc, 0, Op.CallNat, 4, 0,
            Op.Inc, 0, Op.JmpBack, -14,
            Op.Pop, Op.Pop, Op.Pop, Op.Pop, Op.Ret,
        ]);
    });

    it("error: start not number", () => {
        let chunk = new Chunk("test chunk");
        let source = '["a", 2] -> i Print i';
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'a': start of range must be number\n"
        });
    });

    it("error: end not number", () => {
        let chunk = new Chunk("test chunk");
        let source = '[2, false] -> i Print i';
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'false': end of range must be number\n"
        });
    });

    it("error: no comma", () => {
        let chunk = new Chunk("test chunk");
        let source = "[1] -> i Print i";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at ']': expect ',' between start and end\n"
        });
    });

    it("error: no ]", () => {
        let chunk = new Chunk("test chunk");
        let source = "[1,3 i Print i";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at 'i': expect ']' in range\n"
        });
    });

    it("error: no name", () => {
        let chunk = new Chunk("test chunk");
        let source = "[1,3] 2 Print i";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '2': expect name for iterator\n"
        });
    });

    it("error: reassignment to iterator", () => {
        let chunk = new Chunk("test chunk");
        let source = "[1,3] i { i = 3 Print i }";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(result, {
            success: false, message: "1: at '=': i already defined in this scope\n"
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

describe("compiler:block", () => {

    it("simple { }, SetLoc", () => {
        let chunk = new Chunk("test chunk");
        let source = "{a = 1}";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 0, Op.SetLoc, Op.Pop, Op.Ret,
        ]);
        assert.deepEqual(chunk.values[0], new FGNumber(1));
    });

    it("simple { }, GetLoc", () => {
        let chunk = new Chunk("test chunk");
        let source = "{a = 1 Print a}";
        let result = compiler.compile(source, chunk);
        assert.deepEqual(chunk.code, [
            Op.Load, 0, Op.SetLoc, Op.GetLoc, 0,
            Op.CallNat, 1, 0, Op.Pop, Op.Ret,
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
            Op.Load, 0, Op.SetLoc,
            Op.Load, 1, Op.SetLoc,
            Op.GetLoc, 1, Op.CallNat, 2, 0, Op.Pop,
            Op.GetLoc, 0, Op.CallNat, 3, 0, Op.Pop,
            Op.Ret,
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
