// @jonesangga, 05-05-2025, MIT License.
//
// TODO: Test precedence
//       Looks like all error testing are similar. Think about joining them.
//       Test block case for if()
//       Test chunk.values in a block (local name)
//       Test GetLoc and SetLoc

// import 'global-jsdom/register'
import { describe, it } from "node:test";
import { deepEqual, fail } from "node:assert/strict";
import { Op } from "../chunk.js"
import { Kind, FGNumber, FGString } from "../value.js"
import { compiler } from "../compiler.js"

//--------------------------------------------------------------------
// Testing unary operators.

type CodeTest = [string, string, number[]][];
type ErrorTest = [string, string, string][];

function matchCode(tests: CodeTest) {
    for (let [about, source, code] of tests) {
        it(about, () => {
            let result = compiler.compile(source);
            if (!result.ok) fail(result.error.message);
            let chunk = result.value.chunk;

            deepEqual(chunk.code, code);
        });
    }
}

function matchError(tests: ErrorTest) {
    for (let [about, source, expected] of tests) {
        it(about, () => {
            let result = compiler.compile(source);
            if (result.ok) fail();

            deepEqual(result.error.message, expected);
        });
    }
}

describe("compiler unary grouping", () => {
    const tests: CodeTest = [
        ["() to change precedence", `result = 1 * (2 + 3)`, [
            Op.Load, 1, Op.Load, 2, Op.Load, 3, Op.Add, Op.Mul,
            Op.Set, 0, Kind.Number, Op.Ok,
        ]],
        ["((Str))", `result = (("real"))`, [
            Op.Load, 1, Op.Set, 0, Kind.String, Op.Ok,
        ]],
    ];
    matchCode(tests);
});

describe("compiler unary grouping error", () => {
    const tests: ErrorTest = [
        [
            "error, when ( not closed",
            `result = 1 * (2 + 3`,
            "1: at end: expect ')' after grouping\n"
        ],
    ];
    matchError(tests);
});

describe("compiler unary !", () => {
    const tests: CodeTest = [
        ["!Bool", `result = !false`, [
            Op.Load, 1, Op.Not,
            Op.Set, 0, Kind.Boolean, Op.Ok,
        ]],
        ["!!Bool", `result = !!false`, [
            Op.Load, 1, Op.Not, Op.Not,
            Op.Set, 0, Kind.Boolean, Op.Ok,
        ]],
        ["!(Bool)", `result = !(false)`, [
            Op.Load, 1, Op.Not,
            Op.Set, 0, Kind.Boolean, Op.Ok,
        ]],
    ];
    matchCode(tests);
});

describe("compiler unary ! error", () => {
    const tests: ErrorTest = [
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
    const tests: CodeTest = [
        ["-Num", `result = -2`, [
            Op.Load, 1, Op.Neg,
            Op.Set, 0, Kind.Number, Op.Ok,
        ]],
        ["--Num", `result = --2`, [
            Op.Load, 1, Op.Neg, Op.Neg,
            Op.Set, 0, Kind.Number, Op.Ok,
        ]],
        ["-(Num)", `result = -(2)`, [
            Op.Load, 1, Op.Neg,
            Op.Set, 0, Kind.Number, Op.Ok,
        ]],
    ];
    matchCode(tests);
});

describe("compiler unary - error", () => {
    const tests: ErrorTest = [
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

//--------------------------------------------------------------------
// Testing binary operators.

describe("compiler boolean equality", () => {
    const tests: [string, string, Op][] = [
        ["Expr == Expr", "result = 12 == 34", Op.Eq],
        ["Expr != Expr", "result = 12 != 34", Op.NEq],
    ];

    for (let [about, source, expectedOp] of tests) {
        it(about, () => {
            let result = compiler.compile(source);
            if (!result.ok) fail();
            let chunk = result.value.chunk;

            deepEqual(chunk.code, [
                Op.Load, 1, Op.Load, 2, expectedOp,
                Op.Set, 0, Kind.Boolean, Op.Ok,
            ]);
        });
    }
});

describe("compiler boolean |", () => {
    it("Num | Num", () => {
        let source = "result = 12 | 34";
        let result = compiler.compile(source);
        if (!result.ok) fail();
        let chunk = result.value.chunk;

        deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.IsDiv,
            Op.Set, 0, Kind.Boolean, Op.Ok,
        ]);
    });
});

describe("compiler boolean &&", () => {
    it("Bool && Bool", () => {
        let source = "result = true && true";
        let result = compiler.compile(source);
        if (!result.ok) fail();
        let chunk = result.value.chunk;

        deepEqual(chunk.code, [
            Op.Load, 1, Op.JmpF, 3, Op.Pop,
            Op.Load, 2, Op.Set, 0, Kind.Boolean, Op.Ok,
        ]);
    });
});

describe("compiler boolean && error", () => {
    const tests: ErrorTest = [
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
        if (!result.ok) fail();
        let chunk = result.value.chunk;

        deepEqual(chunk.code, [
            Op.Load, 1, Op.JmpF, 2, Op.Jmp, 3, Op.Pop,
            Op.Load, 2, Op.Set, 0, Kind.Boolean, Op.Ok,
        ]);
    });
});

describe("compiler boolean || error", () => {
    const tests: ErrorTest = [
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
    const tests: [string, string, Op][] = [
        ["Num < Num", "result = 12 < 34", Op.LT],
        ["Num <= Num", "result = 12 <= 34", Op.LEq],
        ["Num > Num", "result = 12 > 34", Op.GT],
        ["Num >= Num", "result = 12 >= 34", Op.GEq],
        ["Str < Str", `result = "so" < "real"`, Op.LT],
        ["Str <= Str", `result = "so" <= "real"`, Op.LEq],
        ["Str > Str", `result = "so" > "real"`, Op.GT],
        ["Str >= Str", `result = "so" >= "real"`, Op.GEq],
    ];

    for (let [about, source, expectedOp] of tests) {
        it(about, () => {
            let result = compiler.compile(source);
            if (!result.ok) fail();
            let chunk = result.value.chunk;

            deepEqual(chunk.code, [
                Op.Load, 1, Op.Load, 2, expectedOp,
                Op.Set, 0, Kind.Boolean, Op.Ok,
            ]);
        });
    }
});

describe("compiler boolean compare error", () => {
    const tests: ErrorTest = [
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
    const tests: [string, string, Op][] = [
        ["Num + Num", "result = 12 + 34", Op.Add],
        ["Num - Num", "result = 12 - 34", Op.Sub],
        ["Num * Num", "result = 12 * 34", Op.Mul],
        ["Num / Num", "result = 12 / 34", Op.Div],
    ];

    for (let [about, source, expectedOp] of tests) {
        it(about, () => {
            let result = compiler.compile(source);
            if (!result.ok) fail();
            let chunk = result.value.chunk;

            deepEqual(chunk.code, [
                Op.Load, 1, Op.Load, 2, expectedOp,
                Op.Set, 0, Kind.Number, Op.Ok,
            ]);
            deepEqual(chunk.values[0], new FGString("result"));
            deepEqual(chunk.values[1], new FGNumber(12));
            deepEqual(chunk.values[2], new FGNumber(34));
        });
    }
});

describe("compiler numeric binary precedence", () => {
    const tests: CodeTest = [
        ["+- term", "result = 12 + 34 - 56", [
            Op.Load, 1, Op.Load, 2, Op.Add,
            Op.Load, 3, Op.Sub,
            Op.Set, 0, Kind.Number, Op.Ok,
        ]],
        ["*/ factor", "result = 12 * 34 / 56", [
            Op.Load, 1, Op.Load, 2, Op.Mul,
            Op.Load, 3, Op.Div,
            Op.Set, 0, Kind.Number, Op.Ok,
        ]],
        ["+-*/ term and factor", "result = 12 + 34 * 56 - 78 / 9", [
            Op.Load, 1, Op.Load, 2, Op.Load, 3, Op.Mul, Op.Add,
            Op.Load, 4, Op.Load, 5, Op.Div, Op.Sub,
            Op.Set, 0, Kind.Number, Op.Ok,
        ]],
    ];
    matchCode(tests);
});

describe("compiler numeric binary error", () => {
    const tests: ErrorTest = [
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
    it("Str <> Str", () => {
        let source = `result = "so " <> "real"`;
        let result = compiler.compile(source);
        if (!result.ok) fail();
        let chunk = result.value.chunk;

        deepEqual(chunk.code, [
            Op.Load, 1, Op.Load, 2, Op.AddStr,
            Op.Set, 0, Kind.String, Op.Ok,
        ]);
        deepEqual(chunk.values[0], new FGString("result"));
        deepEqual(chunk.values[1], new FGString("so "));
        deepEqual(chunk.values[2], new FGString("real"));
    });
});
 
describe("compiler string binary error", () => {
    const tests: ErrorTest = [
        [
            "error, when Str <> Num",
            `result = "real" <> 2`,
            "1: at '2': '<>' only for strings\n"
        ],
        [
            "error, when Num <> Str",
            `result = 2 <> "real"`,
            "1: at '<>': '<>' only for strings\n"
        ],
    ];
    matchError(tests);
});

//--------------------------------------------------------------------
// Testing block.

describe("compiler block", () => {
    const tests: CodeTest = [
        ["empty {}", `{}`, [
            Op.Ok,
        ]],
        ["SetLoc in {}", `{a = 2}`, [
            Op.Load, 0, Op.SetLoc, Op.Pop, Op.Ok,
        ]],
        ["SetLoc GetLoc in {}", `{a = 2 Print a}`, [
            Op.Load, 0, Op.SetLoc, Op.Load, 1, Op.GetLoc, 0,
            Op.CallNat, 1, 0, Op.Pop, Op.Ok,
        ]],
        ["nested {}", `{a = 2 {a = 3 Print a} Print a}`, [
            Op.Load, 0, Op.SetLoc,
            Op.Load, 1, Op.SetLoc,
            Op.Load, 2, Op.GetLoc, 1, Op.CallNat, 1, 0, Op.Pop,
            Op.Load, 3, Op.GetLoc, 0, Op.CallNat, 1, 0, Op.Pop,
            Op.Ok,
        ]],
    ];
    matchCode(tests);
});

describe("compiler block error", () => {
    const tests: ErrorTest = [
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

//--------------------------------------------------------------------
// Testing control flow.

describe("compiler if", () => {
    const tests: CodeTest = [
        ["one statement each branch", `if true Print "correct" else Print "wrong"`, [
            Op.Load, 0, Op.JmpF, 10, Op.Pop,
            Op.Load, 1, Op.Load, 2, Op.CallNat, 1, 0,
            Op.Jmp, 8, Op.Pop,
            Op.Load, 3, Op.Load, 4, Op.CallNat, 1, 0,
            Op.Ok,
        ]],
    ];
    matchCode(tests);
});

describe("compiler if error", () => {
    const tests: ErrorTest = [
        [
            "error, when conditional not Bool",
            `if "real" Print "correct" else Print "wrong"`,
            "1: at 'real': conditional expression must be boolean\n"
        ],
    ];
    matchError(tests);
});

// TODO: test also the values.
describe("compiler loop", () => {
    const tests: CodeTest = [
        ["closed increasing default loop", `[10,15]i Print i`, [
            Op.Load, 0, Op.Load, 1, Op.Load, 2, Op.SetLoc,
            Op.Loop, Op.CkInc, 0, Op.JmpF, 12, Op.Pop,
            Op.Load, 3, Op.GetLoc, 0, Op.CallNat, 1, 0,
            Op.Inc, 0, Op.JmpBack, -16,
            Op.Pop, Op.Pop, Op.Pop, Op.Pop,
            Op.Ok,
        ]],
        ["open left increasing default loop", `(10,15]i Print i`, [
            Op.Load, 0, Op.Load, 1, Op.Load, 2, Op.SetLoc,
            Op.Loop, Op.Jmp, 12, Op.CkInc, 0, Op.JmpF, 12, Op.Pop,
            Op.Load, 3, Op.GetLoc, 0, Op.CallNat, 1, 0,
            Op.Inc, 0, Op.JmpBack, -16,
            Op.Pop, Op.Pop, Op.Pop, Op.Pop,
            Op.Ok,
        ]],
        ["open right increasing default loop", `[10,15)i Print i`, [
            Op.Load, 0, Op.Load, 1, Op.Load, 2, Op.SetLoc,
            Op.Loop, Op.CkExc, 0, Op.JmpF, 12, Op.Pop,
            Op.Load, 3, Op.GetLoc, 0, Op.CallNat, 1, 0,
            Op.Inc, 0, Op.JmpBack, -16,
            Op.Pop, Op.Pop, Op.Pop, Op.Pop,
            Op.Ok,
        ]],
        ["open increasing default loop", `(10,15)i Print i`, [
            Op.Load, 0, Op.Load, 1, Op.Load, 2, Op.SetLoc,
            Op.Loop, Op.Jmp, 12, Op.CkExc, 0, Op.JmpF, 12, Op.Pop,
            Op.Load, 3, Op.GetLoc, 0, Op.CallNat, 1, 0,
            Op.Inc, 0, Op.JmpBack, -16,
            Op.Pop, Op.Pop, Op.Pop, Op.Pop,
            Op.Ok,
        ]],
    ];
    matchCode(tests);
});

describe("compiler loop error", () => {
    const tests: ErrorTest = [
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

//--------------------------------------------------------------------
// Testing expression.

// TODO: test type annotation when it is implemented.
describe("compiler global assignment", () => {
    const tests: CodeTest = [
        ["infer Num", `a = 3`, [
            Op.Load, 1, Op.Set, 0, Kind.Number, Op.Ok,
        ]],
        ["infer Str", `a = "real"`, [
            Op.Load, 1, Op.Set, 0, Kind.String, Op.Ok,
        ]],
        ["infer Bool", `a = false`, [
            Op.Load, 1, Op.Set, 0, Kind.Boolean, Op.Ok,
        ]],
    ];
    matchCode(tests);
});

describe("compiler global assignment error", () => {
    const tests: ErrorTest = [
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

//--------------------------------------------------------------------
// Testing functions and procedures
// TODO: test $

describe.only("compiler: native function", () => {
    const tests: CodeTest = [
        ["call native function 1 arg", `Print 2`, [
            Op.Load, 0, Op.Load, 1, Op.CallNat, 1, 0, Op.Ok,
        ]],
        ["call native function 2 args", `p = P 100 200`, [
            Op.Load, 1, Op.Load, 2, Op.Load, 3,
            Op.CallNat, 2, 0, Op.Set, 0, Kind.Point, Op.Ok,
        ]],
        ["call native function 3 args", `c = C 100 200 50`, [
            Op.Load, 1, Op.Load, 2, Op.Load, 3, Op.Load, 4,
            Op.CallNat, 3, 0, Op.Set, 0, Kind.Circle, Op.Ok,
        ]],
        ["call native function 4 args", `r = R 100 200 300 400`, [
            Op.Load, 1, Op.Load, 2, Op.Load, 3, Op.Load, 4, Op.Load, 5,
            Op.CallNat, 4, 0, Op.Set, 0, Kind.Rect, Op.Ok,
        ]],
        ["call native function v1 2 args", `p = P 100 200 q = P 300 400 s = Seg p q`, [
            Op.Load, 1, Op.Load, 2, Op.Load, 3,
            Op.CallNat, 2, 0, Op.Set, 0, Kind.Point,
            Op.Load, 5, Op.Load, 6, Op.Load, 7,
            Op.CallNat, 2, 0, Op.Set, 4, Kind.Point,
            Op.Load, 9, Op.GetUsr, 10, Op.GetUsr, 11,
            Op.CallNat, 2, 1, Op.Set, 8, Kind.Segment,
            Op.Ok,
        ]],
    ];
    matchCode(tests);
});

// TODO: test code in the proc chunk
//       maybe change the CodeTest type?

describe.only("compiler: native procedure", () => {
    const tests: CodeTest = [
        ["call native procedure 0 arg", `Help`, [
            Op.Load, 0, Op.CallNat, 0, 0, Op.Ok,
        ]],
    ];
    matchCode(tests);
});

// TODO: test ifx
//       test code in the fn chunk
//       maybe change the CodeTest type?

describe.only("compiler: user function", () => {
    const tests: CodeTest = [
        ["define and call user function 1 arg", `fn double x: Num -> Num = x * 2 a = double 10`, [
            Op.Load, 1, Op.Set, 0, Kind.CallUser,
            Op.Load, 3, Op.Load, 4, Op.CallUsr, 1, 0, Op.Set, 2, Kind.Number,
            Op.Ok,
        ]],
        ["define and call user function 2 arg", `fn add x: Num, y: Num -> Num = x + y a = add 2 3`, [
            Op.Load, 1, Op.Set, 0, Kind.CallUser,
            Op.Load, 3, Op.Load, 4, Op.Load, 5, Op.CallUsr, 2, 0, Op.Set, 2, Kind.Number,
            Op.Ok,
        ]],
    ];
    matchCode(tests);
});

// TODO: test code in the proc chunk
//       maybe change the CodeTest type?

describe.only("compiler: user procedure", () => {
    const tests: CodeTest = [
        ["define and call user procedure 1 arg", `proc print_double x: Num { Print $ x * 2 } print_double 10`, [
            Op.Load, 1, Op.Set, 0, Kind.CallUser,
            Op.Load, 2, Op.Load, 3, Op.CallUsr, 1, 0,
            Op.Ok,
        ]],
        ["define and call user procedure 2 arg", `proc print_add x: Num, y: Num { Print $ x + y } print_add 10 20`, [
            Op.Load, 1, Op.Set, 0, Kind.CallUser,
            Op.Load, 2, Op.Load, 3, Op.Load, 4, Op.CallUsr, 2, 0,
            Op.Ok,
        ]],
    ];
    matchCode(tests);
});

//--------------------------------------------------------------------

describe("compiler general", () => {
    const tests: CodeTest = [
        ["empty source", ``, [
            Op.Ok,
        ]],
        ["optional delimiter ;", `a = 2; b = 3`, [
            Op.Load, 1, Op.Set, 0, Kind.Number, Op.Load, 3, Op.Set, 2, Kind.Number, Op.Ok,
        ]],
    ];
    matchCode(tests);
});

describe("compiler general error", () => {
    const tests: ErrorTest = [
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
