// @jonesangga, 05-04-2025, MIT License.
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
            start: 0,
            end: 0,
            line: 1,
        };
        assert.deepEqual(scanner.next(), eof);
        assert.deepEqual(scanner.next(), eof);
    });

    //----------------------------------------------------------------
    // NOTE: add new lexeme at the end so it doesn't mess with prev passing tests.

    it("scan all types", () => {
        let code = ` ! : := , $ = false [ ( - abc 123.456 + ] ) ; / * "real" true `;
                 // 012345678901234567890123456789012345678901234567890123456789012
                           // 1         2         3         4         5         6

        scanner.init(code);
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Bang,
            start: 1,
            end: 2,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Colon,
            start: 3,
            end: 4,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.ColonEq,
            start: 5,
            end: 7,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Comma,
            start: 8,
            end: 9,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Dollar,
            start: 10,
            end: 11,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Eq,
            start: 12,
            end: 13,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.False,
            start: 14,
            end: 19,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.LBracket,
            start: 20,
            end: 21,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.LParen,
            start: 22,
            end: 23,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Minus,
            start: 24,
            end: 25,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Name,
            start: 26,
            end: 29,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Number,
            start: 30,
            end: 37,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Plus,
            start: 38,
            end: 39,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.RBracket,
            start: 40,
            end: 41,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.RParen,
            start: 42,
            end: 43,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Semicolon,
            start: 44,
            end: 45,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Slash,
            start: 46,
            end: 47,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Star,
            start: 48,
            end: 49,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.String,
            start: 50,
            end: 56,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.True,
            start: 57,
            end: 61,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.EOF,
            start: 62,
            end: 62,
            line: 1,
        });
    });

    it("error: unterminated string", () => {
        let code = "a = \"so real\nprint a";
        scanner.init(code);
        scanner.next(); // a
        scanner.next(); // =

        assert.deepEqual(scanner.next(), {
            kind: TokenT.Error,
            start: 4,
            end: 20,
            line: 2,
            errorMessage: "unterminated string",
        });

        assert.deepEqual(scanner.next(), {
            kind: TokenT.EOF,
            start: 20,
            end: 20,
            line: 2,
        });
    });

    it("error: unexpected character", () => {
        let code = "a = {1}";
        scanner.init(code);
        scanner.next(); // a
        scanner.next(); // =

        assert.deepEqual(scanner.next(), {
            kind: TokenT.Error,
            start: 4,
            end: 5,
            line: 1,
            errorMessage: "unexpected character",
        });

        scanner.next(); // 1
        assert.deepEqual(scanner.next(), {
            kind: TokenT.Error,
            start: 6,
            end: 7,
            line: 1,
            errorMessage: "unexpected character",
        });
        assert.deepEqual(scanner.next(), {
            kind: TokenT.EOF,
            start: 7,
            end: 7,
            line: 1,
        });
    });
});
