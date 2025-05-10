import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scanner } from "../scanner.js";
describe("scanner", () => {
    it("repeated next() on empty string", () => {
        let code = "";
        scanner.init(code);
        let eof = {
            kind: 2100,
            line: 1,
            lexeme: "",
        };
        assert.deepEqual(scanner.next(), eof);
        assert.deepEqual(scanner.next(), eof);
    });
    it("scan all types", () => {
        let code = ` ! : := , $ = false [ ( - abc 123.456 + ] ) ; / * "real" true ++ == != < <= > >=`;
        scanner.init(code);
        assert.deepEqual(scanner.next(), {
            kind: 1200,
            line: 1,
            lexeme: "!",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1300,
            line: 1,
            lexeme: ":",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1400,
            line: 1,
            lexeme: ":=",
        });
        assert.deepEqual(scanner.next(), {
            kind: 100,
            line: 1,
            lexeme: ",",
        });
        assert.deepEqual(scanner.next(), {
            kind: 200,
            line: 1,
            lexeme: "$",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1500,
            line: 1,
            lexeme: "=",
        });
        assert.deepEqual(scanner.next(), {
            kind: 2000,
            line: 1,
            lexeme: "false",
        });
        assert.deepEqual(scanner.next(), {
            kind: 600,
            line: 1,
            lexeme: "[",
        });
        assert.deepEqual(scanner.next(), {
            kind: 400,
            line: 1,
            lexeme: "(",
        });
        assert.deepEqual(scanner.next(), {
            kind: 800,
            line: 1,
            lexeme: "-",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1600,
            line: 1,
            lexeme: "abc",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1700,
            line: 1,
            lexeme: "123.456",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1585,
            line: 1,
            lexeme: "+",
        });
        assert.deepEqual(scanner.next(), {
            kind: 700,
            line: 1,
            lexeme: "]",
        });
        assert.deepEqual(scanner.next(), {
            kind: 500,
            line: 1,
            lexeme: ")",
        });
        assert.deepEqual(scanner.next(), {
            kind: 300,
            line: 1,
            lexeme: ";",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1000,
            line: 1,
            lexeme: "/",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1100,
            line: 1,
            lexeme: "*",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1800,
            line: 1,
            lexeme: "real",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1900,
            line: 1,
            lexeme: "true",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1590,
            line: 1,
            lexeme: "++",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1505,
            line: 1,
            lexeme: "==",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1210,
            line: 1,
            lexeme: "!=",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1550,
            line: 1,
            lexeme: "<",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1555,
            line: 1,
            lexeme: "<=",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1520,
            line: 1,
            lexeme: ">",
        });
        assert.deepEqual(scanner.next(), {
            kind: 1525,
            line: 1,
            lexeme: ">=",
        });
        assert.deepEqual(scanner.next(), {
            kind: 2100,
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
            kind: 2200,
            line: 2,
            lexeme: "unterminated string",
        });
        assert.deepEqual(scanner.next(), {
            kind: 2100,
            line: 2,
            lexeme: "",
        });
    });
    it("error: unexpected character", () => {
        let code = "a = @1%";
        scanner.init(code);
        scanner.next();
        scanner.next();
        assert.deepEqual(scanner.next(), {
            kind: 2200,
            line: 1,
            lexeme: "unexpected character",
        });
        scanner.next();
        assert.deepEqual(scanner.next(), {
            kind: 2200,
            line: 1,
            lexeme: "unexpected character",
        });
        assert.deepEqual(scanner.next(), {
            kind: 2100,
            line: 1,
            lexeme: "",
        });
    });
});
