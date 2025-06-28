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
            type: TokenT.EOF,
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
            type: TokenT.EOF,
            line: 1,
            lexeme: "",
        });
    });
});

describe("scanner each token type", () => {
    const tests: {
        [key in TokenT]: [string, { type: key, line: number, lexeme: string }]
    } = {
        [TokenT.Amp]: ["&", { type: TokenT.Amp, line: 1, lexeme: "&" }],
        [TokenT.AmpAmp]: ["&&", { type: TokenT.AmpAmp, line: 1, lexeme: "&&" }],
        [TokenT.Arrow]: ["->", { type: TokenT.Arrow, line: 1, lexeme: "->" }],
        [TokenT.Bang]: ["!", { type: TokenT.Bang, line: 1, lexeme: "!" }],
        [TokenT.BangEq]: ["!=", { type: TokenT.BangEq, line: 1, lexeme: "!=" }],
        [TokenT.BoolT]: ["Bool", { type: TokenT.BoolT, line: 1, lexeme: "Bool" }],
        [TokenT.BSlash]: ["\\", { type: TokenT.BSlash, line: 1, lexeme: "\\" }],
        [TokenT.Colon]: [":", { type: TokenT.Colon, line: 1, lexeme: ":" }],
        [TokenT.Comma]: [",", { type: TokenT.Comma, line: 1, lexeme: "," }],
        [TokenT.CircleT]: ["Circle", { type: TokenT.CircleT, line: 1, lexeme: "Circle" }],
        [TokenT.Dot]: [".", { type: TokenT.Dot, line: 1, lexeme: "." }],
        [TokenT.Else]: ["else", { type: TokenT.Else, line: 1, lexeme: "else" }],
        [TokenT.EOF]: ["", { type: TokenT.EOF, line: 1, lexeme: "" }],
        [TokenT.Eq]: ["=", { type: TokenT.Eq, line: 1, lexeme: "=" }],
        [TokenT.EqEq]: ["==", { type: TokenT.EqEq, line: 1, lexeme: "==" }],
        [TokenT.Error]: ["@", { type: TokenT.Error, line: 1, lexeme: "unexpected character @" }],
        [TokenT.False]: ["false", { type: TokenT.False, line: 1, lexeme: "false" }],
        [TokenT.Fn]: ["fn", { type: TokenT.Fn, line: 1, lexeme: "fn" }],
        [TokenT.FSlash]: ["/", { type: TokenT.FSlash, line: 1, lexeme: "/" }],
        [TokenT.Greater]: [">", { type: TokenT.Greater, line: 1, lexeme: ">" }],
        [TokenT.GreaterEq]: [">=", { type: TokenT.GreaterEq, line: 1, lexeme: ">=" }],
        [TokenT.Hash]: ["#", { type: TokenT.Hash, line: 1, lexeme: "#" }],
        [TokenT.Ident]: ["print", { type: TokenT.Ident, line: 1, lexeme: "print" }],
        [TokenT.If]: ["if", { type: TokenT.If, line: 1, lexeme: "if" }],
        [TokenT.Ifx]: ["ifx", { type: TokenT.Ifx, line: 1, lexeme: "ifx" }],
        [TokenT.LBrace]: ["{", { type: TokenT.LBrace, line: 1, lexeme: "{" }],
        [TokenT.LBracket]: ["[", { type: TokenT.LBracket, line: 1, lexeme: "[" }],
        [TokenT.Less]: ["<", { type: TokenT.Less, line: 1, lexeme: "<" }],
        [TokenT.LessEq]: ["<=", { type: TokenT.LessEq, line: 1, lexeme: "<=" }],
        [TokenT.LParen]: ["(", { type: TokenT.LParen, line: 1, lexeme: "(" }],
        [TokenT.LR]: ["<>", { type: TokenT.LR, line: 1, lexeme: "<>" }],
        [TokenT.Let]: ["let", { type: TokenT.Let, line: 1, lexeme: "let" }],
        [TokenT.Minus]: ["-", { type: TokenT.Minus, line: 1, lexeme: "-" }],
        [TokenT.Number]: ["123.456", { type: TokenT.Number, line: 1, lexeme: "123.456" }],
        [TokenT.NumT]: ["Num", { type: TokenT.NumT, line: 1, lexeme: "Num" }],
        [TokenT.Percent]: ["%", { type: TokenT.Percent, line: 1, lexeme: "%" }],
        [TokenT.PipePipe]: ["||", { type: TokenT.PipePipe, line: 1, lexeme: "||" }],
        [TokenT.Plus]: ["+", { type: TokenT.Plus, line: 1, lexeme: "+" }],
        [TokenT.PlusPlus]: ["++", { type: TokenT.PlusPlus, line: 1, lexeme: "++" }],
        [TokenT.PointT]: ["Point", { type: TokenT.PointT, line: 1, lexeme: "Point" }],
        [TokenT.RBrace]: ["}", { type: TokenT.RBrace, line: 1, lexeme: "}" }],
        [TokenT.RBracket]: ["]", { type: TokenT.RBracket, line: 1, lexeme: "]" }],
        [TokenT.RectT]: ["Rect", { type: TokenT.RectT, line: 1, lexeme: "Rect" }],
        [TokenT.Return]: ["return", { type: TokenT.Return, line: 1, lexeme: "return" }],
        [TokenT.RParen]: [")", { type: TokenT.RParen, line: 1, lexeme: ")" }],
        [TokenT.Semicolon]: [";", { type: TokenT.Semicolon, line: 1, lexeme: ";" }],
        [TokenT.Star]: ["*", { type: TokenT.Star, line: 1, lexeme: "*" }],
        [TokenT.String]: ["\"real\"", { type: TokenT.String, line: 1, lexeme: "real" }],
        [TokenT.StrT]: ["Str", { type: TokenT.StrT, line: 1, lexeme: "Str" }],
        [TokenT.Struct]: ["struct", { type: TokenT.Struct, line: 1, lexeme: "struct" }],
        [TokenT.Then]: ["then", { type: TokenT.Then, line: 1, lexeme: "then" }],
        [TokenT.True]: ["true", { type: TokenT.True, line: 1, lexeme: "true" }],
        [TokenT.Use]:  ["use", { type: TokenT.Use, line: 1, lexeme: "use" }],
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
            type: TokenT.Error,
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
            type: TokenT.Error,
            line: 1,
            lexeme: "unexpected character @",
        });
    });
});
