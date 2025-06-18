// @jonesangga, 04-05-2025, MIT License.
//
// TODO: Test scanner.all().
//       Test scanner.all_string().

import { describe, it } from "node:test";
import { deepEqual } from "node:assert/strict";
import { TokenT, scanner } from "../scanner.js"

describe("scanner handling EOF", () => {
    it("success, on empty code", () => {
        let code = "";
        scanner.init(code);

        let next = scanner.next();

        deepEqual(next, {
            kind: TokenT.EOF,
            line: 1,
            lexeme: "",
        });
    });

    it("not error, when calling next() after EOF", () => {
        let code = "1";
        scanner.init(code);

        scanner.next();     // 1
        scanner.next();     // EOF
        let next = scanner.next();

        deepEqual(next, {
            kind: TokenT.EOF,
            line: 1,
            lexeme: "",
        });
    });
});

describe("scanner each token type", () => {
    const tests: {
        [key in TokenT]: [string, { kind: key, line: number, lexeme: string }]
    } = {
        [TokenT.Amp]: ["&", { kind: TokenT.Amp, line: 1, lexeme: "&" }],
        [TokenT.AmpAmp]: ["&&", { kind: TokenT.AmpAmp, line: 1, lexeme: "&&" }],
        [TokenT.Arrow]: ["->", { kind: TokenT.Arrow, line: 1, lexeme: "->" }],
        [TokenT.Bang]: ["!", { kind: TokenT.Bang, line: 1, lexeme: "!" }],
        [TokenT.BangEq]: ["!=", { kind: TokenT.BangEq, line: 1, lexeme: "!=" }],
        [TokenT.BoolT]: ["Bool", { kind: TokenT.BoolT, line: 1, lexeme: "Bool" }],
        [TokenT.Colon]: [":", { kind: TokenT.Colon, line: 1, lexeme: ":" }],
        [TokenT.ColonEq]: [":=", { kind: TokenT.ColonEq, line: 1, lexeme: ":=" }],
        [TokenT.ColonMin]: [":-", { kind: TokenT.ColonMin, line: 1, lexeme: ":-" }],
        [TokenT.Comma]: [",", { kind: TokenT.Comma, line: 1, lexeme: "," }],
        [TokenT.CircleT]: ["Circle", { kind: TokenT.CircleT, line: 1, lexeme: "Circle" }],
        [TokenT.DivBy]: ["|", { kind: TokenT.DivBy, line: 1, lexeme: "|" }],
        [TokenT.Dot]: [".", { kind: TokenT.Dot, line: 1, lexeme: "." }],
        [TokenT.Else]: ["else", { kind: TokenT.Else, line: 1, lexeme: "else" }],
        [TokenT.EOF]: ["", { kind: TokenT.EOF, line: 1, lexeme: "" }],
        [TokenT.Eq]: ["=", { kind: TokenT.Eq, line: 1, lexeme: "=" }],
        [TokenT.EqEq]: ["==", { kind: TokenT.EqEq, line: 1, lexeme: "==" }],
        [TokenT.Error]: ["@", { kind: TokenT.Error, line: 1, lexeme: "unexpected character @" }],
        [TokenT.False]: ["false", { kind: TokenT.False, line: 1, lexeme: "false" }],
        [TokenT.Fn]: ["fn", { kind: TokenT.Fn, line: 1, lexeme: "fn" }],
        [TokenT.Global]: ["global", { kind: TokenT.Global, line: 1, lexeme: "global" }],
        [TokenT.Greater]: [">", { kind: TokenT.Greater, line: 1, lexeme: ">" }],
        [TokenT.GreaterEq]: [">=", { kind: TokenT.GreaterEq, line: 1, lexeme: ">=" }],
        [TokenT.Hash]: ["#", { kind: TokenT.Hash, line: 1, lexeme: "#" }],
        [TokenT.Ident]: ["print", { kind: TokenT.Ident, line: 1, lexeme: "print" }],
        [TokenT.If]: ["if", { kind: TokenT.If, line: 1, lexeme: "if" }],
        [TokenT.Ifx]: ["ifx", { kind: TokenT.Ifx, line: 1, lexeme: "ifx" }],
        [TokenT.LBrace]: ["{", { kind: TokenT.LBrace, line: 1, lexeme: "{" }],
        [TokenT.LBracket]: ["[", { kind: TokenT.LBracket, line: 1, lexeme: "[" }],
        [TokenT.Less]: ["<", { kind: TokenT.Less, line: 1, lexeme: "<" }],
        [TokenT.LessEq]: ["<=", { kind: TokenT.LessEq, line: 1, lexeme: "<=" }],
        [TokenT.LParen]: ["(", { kind: TokenT.LParen, line: 1, lexeme: "(" }],
        [TokenT.LR]: ["<>", { kind: TokenT.LR, line: 1, lexeme: "<>" }],
        [TokenT.Let]: ["let", { kind: TokenT.Let, line: 1, lexeme: "let" }],
        [TokenT.Mut]: ["mut", { kind: TokenT.Mut, line: 1, lexeme: "mut" }],
        [TokenT.Minus]: ["-", { kind: TokenT.Minus, line: 1, lexeme: "-" }],
        [TokenT.Number]: ["123.456", { kind: TokenT.Number, line: 1, lexeme: "123.456" }],
        [TokenT.NumT]: ["Num", { kind: TokenT.NumT, line: 1, lexeme: "Num" }],
        [TokenT.Percent]: ["%", { kind: TokenT.Percent, line: 1, lexeme: "%" }],
        [TokenT.PipePipe]: ["||", { kind: TokenT.PipePipe, line: 1, lexeme: "||" }],
        [TokenT.Plus]: ["+", { kind: TokenT.Plus, line: 1, lexeme: "+" }],
        [TokenT.PlusPlus]: ["++", { kind: TokenT.PlusPlus, line: 1, lexeme: "++" }],
        [TokenT.PointT]: ["Point", { kind: TokenT.PointT, line: 1, lexeme: "Point" }],
        [TokenT.RBrace]: ["}", { kind: TokenT.RBrace, line: 1, lexeme: "}" }],
        [TokenT.RBracket]: ["]", { kind: TokenT.RBracket, line: 1, lexeme: "]" }],
        [TokenT.RectT]: ["Rect", { kind: TokenT.RectT, line: 1, lexeme: "Rect" }],
        [TokenT.Return]: ["return", { kind: TokenT.Return, line: 1, lexeme: "return" }],
        [TokenT.RParen]: [")", { kind: TokenT.RParen, line: 1, lexeme: ")" }],
        [TokenT.Semicolon]: [";", { kind: TokenT.Semicolon, line: 1, lexeme: ";" }],
        [TokenT.Slash]: ["/", { kind: TokenT.Slash, line: 1, lexeme: "/" }],
        [TokenT.Star]: ["*", { kind: TokenT.Star, line: 1, lexeme: "*" }],
        [TokenT.String]: ["\"real\"", { kind: TokenT.String, line: 1, lexeme: "real" }],
        [TokenT.StrT]: ["Str", { kind: TokenT.StrT, line: 1, lexeme: "Str" }],
        [TokenT.Struct]: ["struct", { kind: TokenT.Struct, line: 1, lexeme: "struct" }],
        [TokenT.Then]: ["then", { kind: TokenT.Then, line: 1, lexeme: "then" }],
        [TokenT.True]: ["true", { kind: TokenT.True, line: 1, lexeme: "true" }],
    };

    for (let [input, expected] of Object.values(tests)) {
        it(`scan ${input}`, () => {
            scanner.init(input);

            let next = scanner.next();

            deepEqual(next, expected);
        });
    }
});

describe("scanner error", () => {
    it("error, when unterminated string", () => {
        let code = "a = \"so real\nprint a";
        scanner.init(code);

        scanner.next();     // a
        scanner.next();     // =
        let next = scanner.next();

        deepEqual(next, {
            kind: TokenT.Error,
            line: 2,
            lexeme: "unterminated string",
        });
    });

    it("error, when unexpected character", () => {
        let code = "a = @1";
        scanner.init(code);

        scanner.next();     // a
        scanner.next();     // =
        let next = scanner.next();

        deepEqual(next, {
            kind: TokenT.Error,
            line: 1,
            lexeme: "unexpected character @",
        });
    });
});
