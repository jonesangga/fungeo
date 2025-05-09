// @jonesangga, 04-05-2025, MIT License.
//
// TODO: Test scanner.all().
//       Test scanner.all_string().

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TokenT, scanner } from "../scanner.js"

describe("scanner", () => {

    it("repeated next() on empty string", () => {
        let code = "";
        scanner.init(code);
        let eof = {
            kind: TokenT.EOF,
            line: 1,
            lexeme: "",
        };
        assert.deepEqual(scanner.next(), eof);
        assert.deepEqual(scanner.next(), eof);
    });

    //----------------------------------------------------------------
    // NOTE: add new lexeme at the end so it doesn't mess with prev passing tests.

    it("scan all types", () => {
        let code = ` ! : := , $ = false [ ( - abc 123.456 + ] ) ; / * "real" true ++ == != < <= > >=`;
                 // 012345678901234567890123456789012345678901234567890123456789012
                           // 1         2         3         4         5         6

        scanner.init(code);
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Bang,
            line: 1,
            lexeme: "!",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Colon,
            line: 1,
            lexeme: ":",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.ColonEq,
            line: 1,
            lexeme: ":=",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Comma,
            line: 1,
            lexeme: ",",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Dollar,
            line: 1,
            lexeme: "$",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Eq,
            line: 1,
            lexeme: "=",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.False,
            line: 1,
            lexeme: "false",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.LBracket,
            line: 1,
            lexeme: "[",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.LParen,
            line: 1,
            lexeme: "(",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Minus,
            line: 1,
            lexeme: "-",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Name,
            line: 1,
            lexeme: "abc",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Number,
            line: 1,
            lexeme: "123.456",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Plus,
            line: 1,
            lexeme: "+",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.RBracket,
            line: 1,
            lexeme: "]",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.RParen,
            line: 1,
            lexeme: ")",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Semicolon,
            line: 1,
            lexeme: ";",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Slash,
            line: 1,
            lexeme: "/",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Star,
            line: 1,
            lexeme: "*",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.String,
            line: 1,
            lexeme: "real",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.True,
            line: 1,
            lexeme: "true",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.PlusPlus,
            line: 1,
            lexeme: "++",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.EqEq,
            line: 1,
            lexeme: "==",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.BangEq,
            line: 1,
            lexeme: "!=",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Less,
            line: 1,
            lexeme: "<",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.LessEq,
            line: 1,
            lexeme: "<=",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Greater,
            line: 1,
            lexeme: ">",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.GreaterEq,
            line: 1,
            lexeme: ">=",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.EOF,
            line: 1,
            lexeme: "",
        });
    });

    it("error: unterminated string", () => {
        let code = "a = \"so real\nprint a";
        scanner.init(code);
        scanner.next(); // a
        scanner.next(); // =

        assert.deepEqual(scanner.next(), {
            kind: TokenT.Error,
            line: 2,
            lexeme: "unterminated string",
        });

        assert.deepEqual(scanner.next(), {
            kind: TokenT.EOF,
            line: 2,
            lexeme: "",
        });
    });

    it("error: unexpected character", () => {
        let code = "a = {1}";
        scanner.init(code);
        scanner.next(); // a
        scanner.next(); // =

        assert.deepEqual(scanner.next(), {
            kind: TokenT.Error,
            line: 1,
            lexeme: "unexpected character",
        });

        scanner.next(); // 1
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Error,
            line: 1,
            lexeme: "unexpected character",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.EOF,
            line: 1,
            lexeme: "",
        });
    });
});
