import { describe, it } from "node:test";
import { deepEqual, fail } from "node:assert/strict";
import { FGNumber, FGString } from "../value.js";
import { compiler } from "../compiler.js";
function matchCode(tests) {
    for (let [about, source, code] of tests) {
        it(about, () => {
            let result = compiler.compile(source);
            if (!result.ok)
                fail(result.error.message);
            let chunk = result.value.chunk;
            deepEqual(chunk.code, code);
        });
    }
}
function matchError(tests) {
    for (let [about, source, expected] of tests) {
        it(about, () => {
            let result = compiler.compile(source);
            if (result.ok)
                fail();
            deepEqual(result.error.message, expected);
        });
    }
}
describe("compiler unary grouping", () => {
    const tests = [
        ["() to change precedence", `result = 1 * (2 + 3)`, [
                800, 1, 800, 2, 800, 3, 100, 900,
                1400, 0, 500, 1290,
            ]],
        ["((Str))", `result = (("real"))`, [
                800, 1, 1400, 0, 600, 1290,
            ]],
    ];
    matchCode(tests);
});
describe("compiler unary grouping error", () => {
    const tests = [
        [
            "error, when ( not closed",
            `result = 1 * (2 + 3`,
            "1: at end: expect ')' after grouping\n"
        ],
    ];
    matchError(tests);
});
describe("compiler unary !", () => {
    const tests = [
        ["!Bool", `result = !false`, [
                800, 1, 1100,
                1400, 0, 300, 1290,
            ]],
        ["!!Bool", `result = !!false`, [
                800, 1, 1100, 1100,
                1400, 0, 300, 1290,
            ]],
        ["!(Bool)", `result = !(false)`, [
                800, 1, 1100,
                1400, 0, 300, 1290,
            ]],
    ];
    matchCode(tests);
});
describe("compiler unary ! error", () => {
    const tests = [
        [
            "error, when !Num",
            `result = !2`,
            "1: at '2': '!' is only for boolean\n"
        ],
        [
            "error, when !Str",
            `result = !"real"`,
            "1: at 'real': '!' is only for boolean\n"
        ],
    ];
    matchError(tests);
});
describe("compiler unary -", () => {
    const tests = [
        ["-Num", `result = -2`, [
                800, 1, 1000,
                1400, 0, 500, 1290,
            ]],
        ["--Num", `result = --2`, [
                800, 1, 1000, 1000,
                1400, 0, 500, 1290,
            ]],
        ["-(Num)", `result = -(2)`, [
                800, 1, 1000,
                1400, 0, 500, 1290,
            ]],
    ];
    matchCode(tests);
});
describe("compiler unary - error", () => {
    const tests = [
        [
            "error, when -Str",
            `result = -"real"`,
            "1: at 'real': '-' is only for number\n"
        ],
        [
            "error, when -Bool",
            `result = -false`,
            "1: at 'false': '-' is only for number\n"
        ],
    ];
    matchError(tests);
});
describe("compiler boolean equality", () => {
    const tests = [
        ["Expr == Expr", "result = 12 == 34", 380],
        ["Expr != Expr", "result = 12 != 34", 1010],
    ];
    for (let [about, source, expectedOp] of tests) {
        it(about, () => {
            let result = compiler.compile(source);
            if (!result.ok)
                fail();
            let chunk = result.value.chunk;
            deepEqual(chunk.code, [
                800, 1, 800, 2, expectedOp,
                1400, 0, 300, 1290,
            ]);
        });
    }
});
describe("compiler boolean |", () => {
    it("Num | Num", () => {
        let source = "result = 12 | 34";
        let result = compiler.compile(source);
        if (!result.ok)
            fail();
        let chunk = result.value.chunk;
        deepEqual(chunk.code, [
            800, 1, 800, 2, 610,
            1400, 0, 300, 1290,
        ]);
    });
});
describe("compiler boolean &&", () => {
    it("Bool && Bool", () => {
        let source = "result = true && true";
        let result = compiler.compile(source);
        if (!result.ok)
            fail();
        let chunk = result.value.chunk;
        deepEqual(chunk.code, [
            800, 1, 620, 3, 1200,
            800, 2, 1400, 0, 300, 1290,
        ]);
    });
});
describe("compiler boolean && error", () => {
    const tests = [
        [
            "error, when Bool && Num",
            `result = true && 2`,
            "1: at '2': operands of '&&' must be booleans\n"
        ],
        [
            "error, when Num && Bool",
            `result = 2 && true`,
            "1: at '&&': operands of '&&' must be booleans\n"
        ],
    ];
    matchError(tests);
});
describe("compiler boolean ||", () => {
    it("Bool || Bool", () => {
        let source = "result = true || true";
        let result = compiler.compile(source);
        if (!result.ok)
            fail();
        let chunk = result.value.chunk;
        deepEqual(chunk.code, [
            800, 1, 620, 2, 615, 3, 1200,
            800, 2, 1400, 0, 300, 1290,
        ]);
    });
});
describe("compiler boolean || error", () => {
    const tests = [
        [
            "error, when Bool || Num",
            `result = true || 2`,
            "1: at '2': operands of '||' must be booleans\n"
        ],
        [
            "error, when Num || Bool",
            `result = 2 || true`,
            "1: at '||': operands of '||' must be booleans\n"
        ],
    ];
    matchError(tests);
});
describe("compiler boolean compare", () => {
    const tests = [
        ["Num < Num", "result = 12 < 34", 810],
        ["Num <= Num", "result = 12 <= 34", 690],
        ["Num > Num", "result = 12 > 34", 530],
        ["Num >= Num", "result = 12 >= 34", 390],
        ["Str < Str", `result = "so" < "real"`, 810],
        ["Str <= Str", `result = "so" <= "real"`, 690],
        ["Str > Str", `result = "so" > "real"`, 530],
        ["Str >= Str", `result = "so" >= "real"`, 390],
    ];
    for (let [about, source, expectedOp] of tests) {
        it(about, () => {
            let result = compiler.compile(source);
            if (!result.ok)
                fail();
            let chunk = result.value.chunk;
            deepEqual(chunk.code, [
                800, 1, 800, 2, expectedOp,
                1400, 0, 300, 1290,
            ]);
        });
    }
});
describe("compiler boolean compare error", () => {
    const tests = [
        [
            "error, when Str < Num",
            `result = "real" < 2`,
            "1: at '2': operands type for comparison didn't match\n"
        ],
        [
            "error, when Num < Str",
            `result = true < "real"`,
            "1: at '<': can only compare strings and numbers\n"
        ],
    ];
    matchError(tests);
});
describe("compiler numeric binary", () => {
    const tests = [
        ["Num + Num", "result = 12 + 34", 100],
        ["Num - Num", "result = 12 - 34", 1500],
        ["Num * Num", "result = 12 * 34", 900],
        ["Num / Num", "result = 12 / 34", 300],
    ];
    for (let [about, source, expectedOp] of tests) {
        it(about, () => {
            let result = compiler.compile(source);
            if (!result.ok)
                fail();
            let chunk = result.value.chunk;
            deepEqual(chunk.code, [
                800, 1, 800, 2, expectedOp,
                1400, 0, 500, 1290,
            ]);
            deepEqual(chunk.values[0], new FGString("result"));
            deepEqual(chunk.values[1], new FGNumber(12));
            deepEqual(chunk.values[2], new FGNumber(34));
        });
    }
});
describe("compiler numeric binary precedence", () => {
    const tests = [
        ["+- term", "result = 12 + 34 - 56", [
                800, 1, 800, 2, 100,
                800, 3, 1500,
                1400, 0, 500, 1290,
            ]],
        ["*/ factor", "result = 12 * 34 / 56", [
                800, 1, 800, 2, 900,
                800, 3, 300,
                1400, 0, 500, 1290,
            ]],
        ["+-*/ term and factor", "result = 12 + 34 * 56 - 78 / 9", [
                800, 1, 800, 2, 800, 3, 900, 100,
                800, 4, 800, 5, 300, 1500,
                1400, 0, 500, 1290,
            ]],
    ];
    matchCode(tests);
});
describe("compiler numeric binary error", () => {
    const tests = [
        [
            "error, when Str + Num",
            `result = "real" + 2`,
            "1: at '+': '+' only for numbers\n"
        ],
        [
            "error, when Num + Str",
            `result = 2 + "real"`,
            "1: at 'real': '+' only for numbers\n"
        ],
    ];
    matchError(tests);
});
describe("compiler string binary", () => {
    it("Str ++ Str", () => {
        let source = `result = "so " ++ "real"`;
        let result = compiler.compile(source);
        if (!result.ok)
            fail();
        let chunk = result.value.chunk;
        deepEqual(chunk.code, [
            800, 1, 800, 2, 120,
            1400, 0, 600, 1290,
        ]);
        deepEqual(chunk.values[0], new FGString("result"));
        deepEqual(chunk.values[1], new FGString("so "));
        deepEqual(chunk.values[2], new FGString("real"));
    });
});
describe("compiler string binary error", () => {
    const tests = [
        [
            "error, when Str ++ Num",
            `result = "real" ++ 2`,
            "1: at '2': '++' only for strings\n"
        ],
        [
            "error, when Num ++ Str",
            `result = 2 ++ "real"`,
            "1: at '++': '++' only for strings\n"
        ],
    ];
    matchError(tests);
});
describe("compiler block", () => {
    const tests = [
        ["empty {}", `{}`, [
                1290,
            ]],
        ["SetLoc in {}", `{a = 2}`, [
                800, 0, 1410, 1200, 1290,
            ]],
        ["SetLoc GetLoc in {}", `{a = 2 Print a}`, [
                800, 0, 1410, 800, 1, 395, 0,
                200, 1, 0, 1200, 1290,
            ]],
        ["nested {}", `{a = 2 {a = 3 Print a} Print a}`, [
                800, 0, 1410,
                800, 1, 1410,
                800, 2, 395, 1, 200, 1, 0, 1200,
                800, 3, 395, 0, 200, 1, 0, 1200,
                1290,
            ]],
    ];
    matchCode(tests);
});
describe("compiler block error", () => {
    const tests = [
        [
            "error, when reassign local name",
            `{a = 1 a = 2}`,
            "1: at '=': a already defined in this scope\n"
        ],
        [
            "error, when no }",
            `{a = 1`,
            "1: at end: expect '}' at the end of block\n"
        ],
    ];
    matchError(tests);
});
describe("compiler if", () => {
    const tests = [
        ["one statement each branch", `if true Print "correct" else Print "wrong"`, [
                800, 0, 620, 10, 1200,
                800, 1, 800, 2, 200, 1, 0,
                615, 8, 1200,
                800, 3, 800, 4, 200, 1, 0,
                1290,
            ]],
    ];
    matchCode(tests);
});
describe("compiler if error", () => {
    const tests = [
        [
            "error, when conditional not Bool",
            `if "real" Print "correct" else Print "wrong"`,
            "1: at 'real': conditional expression must be boolean\n"
        ],
    ];
    matchError(tests);
});
describe("compiler loop", () => {
    const tests = [
        ["closed increasing default loop", `[10,15]i Print i`, [
                800, 0, 800, 1, 800, 2, 1410,
                805, 215, 0, 620, 12, 1200,
                800, 3, 395, 0, 200, 1, 0,
                595, 0, 616, -16,
                1200, 1200, 1200, 1200,
                1290,
            ]],
        ["open left increasing default loop", `(10,15]i Print i`, [
                800, 0, 800, 1, 800, 2, 1410,
                805, 615, 12, 215, 0, 620, 12, 1200,
                800, 3, 395, 0, 200, 1, 0,
                595, 0, 616, -16,
                1200, 1200, 1200, 1200,
                1290,
            ]],
        ["open right increasing default loop", `[10,15)i Print i`, [
                800, 0, 800, 1, 800, 2, 1410,
                805, 210, 0, 620, 12, 1200,
                800, 3, 395, 0, 200, 1, 0,
                595, 0, 616, -16,
                1200, 1200, 1200, 1200,
                1290,
            ]],
        ["open increasing default loop", `(10,15)i Print i`, [
                800, 0, 800, 1, 800, 2, 1410,
                805, 615, 12, 210, 0, 620, 12, 1200,
                800, 3, 395, 0, 200, 1, 0,
                595, 0, 616, -16,
                1200, 1200, 1200, 1200,
                1290,
            ]],
    ];
    matchCode(tests);
});
describe("compiler loop error", () => {
    const tests = [
        [
            "error, when start is not numeric",
            `["real", 2]i Print i`,
            "1: at 'real': start of range must be numeric\n"
        ],
        [
            "error, when no comma between start and end",
            `[2]i Print i`,
            "1: at ']': expect ',' between start and end of range\n"
        ],
        [
            "error, when end is not numeric",
            `[2, "real"]i Print i`,
            "1: at 'real': end of range must be numeric\n"
        ],
        [
            "error, when no ]",
            `[2, 5 i Print i`,
            "1: at 'i': expect ']' in range\n"
        ],
        [
            "error, when no iterator name",
            `[2, 5] 2 Print i`,
            "1: at '2': expect name for iterator\n"
        ],
        [
            "error, when reassign to iterator",
            `[2, 5] i { i = 2 Print i }`,
            "1: at '=': i already defined in this scope\n"
        ],
    ];
    matchError(tests);
});
describe("compiler global assignment", () => {
    const tests = [
        ["infer Num", `a = 3`, [
                800, 1, 1400, 0, 500, 1290,
            ]],
        ["infer Str", `a = "real"`, [
                800, 1, 1400, 0, 600, 1290,
            ]],
        ["infer Bool", `a = false`, [
                800, 1, 1400, 0, 300, 1290,
            ]],
    ];
    matchCode(tests);
});
describe("compiler global assignment error", () => {
    const tests = [
        [
            "error, when reassign",
            `a = 123.456 a = 2`,
            "1: at '=': a already defined\n"
        ],
        [
            "error, when no expression to assign",
            `a =`,
            "1: at end: expect expression\n"
        ],
    ];
    matchError(tests);
});
describe.only("compiler: native function", () => {
    const tests = [
        ["call native function 1 arg", `Print 2`, [
                800, 0, 800, 1, 200, 1, 0, 1290,
            ]],
        ["call native function 2 args", `p = P 100 200`, [
                800, 1, 800, 2, 800, 3,
                200, 2, 0, 1400, 0, 850, 1290,
            ]],
        ["call native function 3 args", `c = C 100 200 50`, [
                800, 1, 800, 2, 800, 3, 800, 4,
                200, 3, 0, 1400, 0, 700, 1290,
            ]],
        ["call native function 4 args", `r = R 100 200 300 400`, [
                800, 1, 800, 2, 800, 3, 800, 4, 800, 5,
                200, 4, 0, 1400, 0, 900, 1290,
            ]],
        ["call native function v1 2 args", `p = P 100 200 q = P 300 400 s = Seg p q`, [
                800, 1, 800, 2, 800, 3,
                200, 2, 0, 1400, 0, 850,
                800, 5, 800, 6, 800, 7,
                200, 2, 0, 1400, 4, 850,
                800, 9, 500, 10, 500, 11,
                200, 2, 1, 1400, 8, 1000,
                1290,
            ]],
    ];
    matchCode(tests);
});
describe.only("compiler: user function", () => {
    const tests = [
        ["define and call user function 1 arg", `fn double x: Num -> Num = x * 2 a = double 10`, [
                800, 1, 1400, 0, 450,
                800, 3, 800, 4, 205, 1, 0, 1400, 2, 500,
                1290,
            ]],
        ["define and call user function 2 arg", `fn add x: Num, y: Num -> Num = x + y a = add 2 3`, [
                800, 1, 1400, 0, 450,
                800, 3, 800, 4, 800, 5, 205, 2, 0, 1400, 2, 500,
                1290,
            ]],
    ];
    matchCode(tests);
});
describe.only("compiler: user function", () => {
    const tests = [
        ["define and call user procedure 1 arg", `proc print_double x: Num { Print $ x * 2 } print_double 10`, [
                800, 1, 1400, 0, 450,
                800, 2, 800, 3, 205, 1, 0,
                1290,
            ]],
        ["define and call user procedure 2 arg", `proc print_add x: Num, y: Num { Print $ x + y } print_add 10 20`, [
                800, 1, 1400, 0, 450,
                800, 2, 800, 3, 800, 4, 205, 2, 0,
                1290,
            ]],
    ];
    matchCode(tests);
});
describe("compiler general", () => {
    const tests = [
        ["empty source", ``, [
                1290,
            ]],
        ["optional delimiter ;", `a = 2; b = 3`, [
                800, 1, 1400, 0, 500, 800, 3, 1400, 2, 500, 1290,
            ]],
    ];
    matchCode(tests);
});
describe("compiler general error", () => {
    const tests = [
        [
            "error, when unexpected character",
            `a = 4 % 2`,
            "1: scanner: unexpected character %\n"
        ],
        [
            "error, when undefined name",
            `a = b`,
            "1: at 'b': undefined name b\n"
        ],
        [
            "error, when begin statement with Num",
            `2 + 3`,
            "1: at '2': cannot start statement with Number\n"
        ],
        [
            "error, when begin statement with Str",
            `"so" ++ " real"`,
            "1: at 'so': cannot start statement with String\n"
        ],
        [
            "error, when begin statement with Bool",
            `false || true`,
            "1: at 'false': cannot start statement with False\n"
        ],
        [
            "error, when expression statement",
            `a = 2 a`,
            "1: at 'a': expression statement is not supported\n"
        ],
    ];
    matchError(tests);
});
