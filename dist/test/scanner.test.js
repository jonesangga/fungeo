import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scanner } from "../scanner.js";
describe("scanner", () => {
    it("repeated next() on empty string", () => {
        let code = "";
        scanner.init(code);
        let eof = {
            kind: 20,
            start: 0,
            end: 0,
            line: 1,
        };
        assert.deepEqual(scanner.next(), eof);
        assert.deepEqual(scanner.next(), eof);
    });
    it("scan all types", () => {
        let code = ` ! : := , $ = false [ ( - abc 123.456 + ] ) ; / * "real" true `;
        scanner.init(code);
        assert.deepEqual(scanner.next(), {
            kind: 11,
            start: 1,
            end: 2,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 12,
            start: 3,
            end: 4,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 13,
            start: 5,
            end: 7,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 0,
            start: 8,
            end: 9,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 1,
            start: 10,
            end: 11,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 14,
            start: 12,
            end: 13,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 19,
            start: 14,
            end: 19,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 5,
            start: 20,
            end: 21,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 3,
            start: 22,
            end: 23,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 7,
            start: 24,
            end: 25,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 15,
            start: 26,
            end: 29,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 16,
            start: 30,
            end: 37,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 8,
            start: 38,
            end: 39,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 6,
            start: 40,
            end: 41,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 4,
            start: 42,
            end: 43,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 2,
            start: 44,
            end: 45,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 9,
            start: 46,
            end: 47,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 10,
            start: 48,
            end: 49,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 17,
            start: 50,
            end: 56,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 18,
            start: 57,
            end: 61,
            line: 1,
        });
        assert.deepEqual(scanner.next(), {
            kind: 20,
            start: 62,
            end: 62,
            line: 1,
        });
    });
    it("error: unterminated string", () => {
        let code = "a = \"so real\nprint a";
        scanner.init(code);
        scanner.next();
        scanner.next();
        assert.deepEqual(scanner.next(), {
            kind: 21,
            start: 4,
            end: 20,
            line: 2,
            errorMessage: "unterminated string",
        });
        assert.deepEqual(scanner.next(), {
            kind: 20,
            start: 20,
            end: 20,
            line: 2,
        });
    });
    it("error: unexpected character", () => {
        let code = "a = {1}";
        scanner.init(code);
        scanner.next();
        scanner.next();
        assert.deepEqual(scanner.next(), {
            kind: 21,
            start: 4,
            end: 5,
            line: 1,
            errorMessage: "unexpected character",
        });
        scanner.next();
        assert.deepEqual(scanner.next(), {
            kind: 21,
            start: 6,
            end: 7,
            line: 1,
            errorMessage: "unexpected character",
        });
        assert.deepEqual(scanner.next(), {
            kind: 20,
            start: 7,
            end: 7,
            line: 1,
        });
    });
});
