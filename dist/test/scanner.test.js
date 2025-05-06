import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scanner } from "../scanner.js";
describe("scanner", () => {
    it("repeated next() on empty string", () => {
        let code = "";
        scanner.init(code);
        let eof = {
            kind: 20,
            line: 1,
            lexeme: "",
        };
        assert.deepEqual(scanner.next(), eof);
        assert.deepEqual(scanner.next(), eof);
    });
    it("scan all types", () => {
        let code = ` ! : := , $ = false [ ( - abc 123.456 + ] ) ; / * "real" true `;
        scanner.init(code);
        assert.deepEqual(scanner.next(), {
            kind: 11,
            line: 1,
            lexeme: "!",
        });
        assert.deepEqual(scanner.next(), {
            kind: 12,
            line: 1,
            lexeme: ":",
        });
        assert.deepEqual(scanner.next(), {
            kind: 13,
            line: 1,
            lexeme: ":=",
        });
        assert.deepEqual(scanner.next(), {
            kind: 0,
            line: 1,
            lexeme: ",",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1,
            line: 1,
            lexeme: "$",
        });
        assert.deepEqual(scanner.next(), {
            kind: 14,
            line: 1,
            lexeme: "=",
        });
        assert.deepEqual(scanner.next(), {
            kind: 19,
            line: 1,
            lexeme: "false",
        });
        assert.deepEqual(scanner.next(), {
            kind: 5,
            line: 1,
            lexeme: "[",
        });
        assert.deepEqual(scanner.next(), {
            kind: 3,
            line: 1,
            lexeme: "(",
        });
        assert.deepEqual(scanner.next(), {
            kind: 7,
            line: 1,
            lexeme: "-",
        });
        assert.deepEqual(scanner.next(), {
            kind: 15,
            line: 1,
            lexeme: "abc",
        });
        assert.deepEqual(scanner.next(), {
            kind: 16,
            line: 1,
            lexeme: "123.456",
        });
        assert.deepEqual(scanner.next(), {
            kind: 8,
            line: 1,
            lexeme: "+",
        });
        assert.deepEqual(scanner.next(), {
            kind: 6,
            line: 1,
            lexeme: "]",
        });
        assert.deepEqual(scanner.next(), {
            kind: 4,
            line: 1,
            lexeme: ")",
        });
        assert.deepEqual(scanner.next(), {
            kind: 2,
            line: 1,
            lexeme: ";",
        });
        assert.deepEqual(scanner.next(), {
            kind: 9,
            line: 1,
            lexeme: "/",
        });
        assert.deepEqual(scanner.next(), {
            kind: 10,
            line: 1,
            lexeme: "*",
        });
        assert.deepEqual(scanner.next(), {
            kind: 17,
            line: 1,
            lexeme: "real",
        });
        assert.deepEqual(scanner.next(), {
            kind: 18,
            line: 1,
            lexeme: "true",
        });
        assert.deepEqual(scanner.next(), {
            kind: 20,
            line: 1,
            lexeme: "",
        });
    });
    it("error: unterminated string", () => {
        let code = "a = \"so real\nprint a";
        scanner.init(code);
        scanner.next();
        scanner.next();
        assert.deepEqual(scanner.next(), {
            kind: 21,
            line: 2,
            lexeme: "unterminated string",
        });
        assert.deepEqual(scanner.next(), {
            kind: 20,
            line: 2,
            lexeme: "",
        });
    });
    it("error: unexpected character", () => {
        let code = "a = {1}";
        scanner.init(code);
        scanner.next();
        scanner.next();
        assert.deepEqual(scanner.next(), {
            kind: 21,
            line: 1,
            lexeme: "unexpected character",
        });
        scanner.next();
        assert.deepEqual(scanner.next(), {
            kind: 21,
            line: 1,
            lexeme: "unexpected character",
        });
        assert.deepEqual(scanner.next(), {
            kind: 20,
            line: 1,
            lexeme: "",
        });
    });
});
