import { describe, it } from "node:test";
import { deepEqual } from "node:assert/strict";
import { scanner } from "../scanner.js";
describe("scanner handling EOF", () => {
    it("success, on empty code", () => {
        let code = "";
        scanner.init(code);
        let next = scanner.next();
        deepEqual(next, {
            type: 2100,
            line: 1,
            lexeme: "",
        });
    });
    it("not error, when calling next() after EOF", () => {
        let code = "1";
        scanner.init(code);
        scanner.next();
        scanner.next();
        let next = scanner.next();
        deepEqual(next, {
            type: 2100,
            line: 1,
            lexeme: "",
        });
    });
});
describe("scanner each token type", () => {
    const tests = {
        [1180]: ["&", { type: 1180, line: 1, lexeme: "&" }],
        [1190]: ["&&", { type: 1190, line: 1, lexeme: "&&" }],
        [1195]: ["->", { type: 1195, line: 1, lexeme: "->" }],
        [1200]: ["!", { type: 1200, line: 1, lexeme: "!" }],
        [1210]: ["!=", { type: 1210, line: 1, lexeme: "!=" }],
        [1600]: ["Bool", { type: 1600, line: 1, lexeme: "Bool" }],
        [50]: ["\\", { type: 50, line: 1, lexeme: "\\" }],
        [1300]: [":", { type: 1300, line: 1, lexeme: ":" }],
        [100]: [",", { type: 100, line: 1, lexeme: "," }],
        [1620]: ["Circle", { type: 1620, line: 1, lexeme: "Circle" }],
        [210]: [".", { type: 210, line: 1, lexeme: "." }],
        [2300]: ["else", { type: 2300, line: 1, lexeme: "else" }],
        [2100]: ["", { type: 2100, line: 1, lexeme: "" }],
        [1500]: ["=", { type: 1500, line: 1, lexeme: "=" }],
        [1505]: ["==", { type: 1505, line: 1, lexeme: "==" }],
        [2200]: ["@", { type: 2200, line: 1, lexeme: "unexpected character @" }],
        [1700]: ["false", { type: 1700, line: 1, lexeme: "false" }],
        [2320]: ["fn", { type: 2320, line: 1, lexeme: "fn" }],
        [220]: ["/", { type: 220, line: 1, lexeme: "/" }],
        [1520]: [">", { type: 1520, line: 1, lexeme: ">" }],
        [1525]: [">=", { type: 1525, line: 1, lexeme: ">=" }],
        [250]: ["#", { type: 250, line: 1, lexeme: "#" }],
        [1730]: ["print", { type: 1730, line: 1, lexeme: "print" }],
        [2400]: ["if", { type: 2400, line: 1, lexeme: "if" }],
        [2405]: ["ifx", { type: 2405, line: 1, lexeme: "ifx" }],
        [300]: ["{", { type: 300, line: 1, lexeme: "{" }],
        [400]: ["[", { type: 400, line: 1, lexeme: "[" }],
        [1550]: ["<", { type: 1550, line: 1, lexeme: "<" }],
        [1555]: ["<=", { type: 1555, line: 1, lexeme: "<=" }],
        [500]: ["(", { type: 500, line: 1, lexeme: "(" }],
        [1560]: ["<>", { type: 1560, line: 1, lexeme: "<>" }],
        [2460]: ["let", { type: 2460, line: 1, lexeme: "let" }],
        [600]: ["-", { type: 600, line: 1, lexeme: "-" }],
        [1800]: ["123.456", { type: 1800, line: 1, lexeme: "123.456" }],
        [1820]: ["Num", { type: 1820, line: 1, lexeme: "Num" }],
        [670]: ["%", { type: 670, line: 1, lexeme: "%" }],
        [1580]: ["||", { type: 1580, line: 1, lexeme: "||" }],
        [1585]: ["+", { type: 1585, line: 1, lexeme: "+" }],
        [1590]: ["++", { type: 1590, line: 1, lexeme: "++" }],
        [1850]: ["Point", { type: 1850, line: 1, lexeme: "Point" }],
        [695]: ["}", { type: 695, line: 1, lexeme: "}" }],
        [700]: ["]", { type: 700, line: 1, lexeme: "]" }],
        [1880]: ["Rect", { type: 1880, line: 1, lexeme: "Rect" }],
        [2800]: ["return", { type: 2800, line: 1, lexeme: "return" }],
        [800]: [")", { type: 800, line: 1, lexeme: ")" }],
        [900]: [";", { type: 900, line: 1, lexeme: ";" }],
        [1100]: ["*", { type: 1100, line: 1, lexeme: "*" }],
        [1900]: ["\"real\"", { type: 1900, line: 1, lexeme: "real" }],
        [1910]: ["Str", { type: 1910, line: 1, lexeme: "Str" }],
        [2910]: ["struct", { type: 2910, line: 1, lexeme: "struct" }],
        [3000]: ["then", { type: 3000, line: 1, lexeme: "then" }],
        [2000]: ["true", { type: 2000, line: 1, lexeme: "true" }],
        [2050]: ["use", { type: 2050, line: 1, lexeme: "use" }],
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
        scanner.next();
        scanner.next();
        let next = scanner.next();
        deepEqual(next, {
            type: 2200,
            line: 2,
            lexeme: "unterminated string",
        });
    });
    it("error, when multi-line comment is not closed", () => {
        let code = "a = 2\n/*print(b) print a";
        scanner.init(code);
        scanner.next();
        scanner.next();
        scanner.next();
        let next = scanner.next();
        deepEqual(next, {
            type: 2200,
            line: 2,
            lexeme: "multi-line comment is not closed",
        });
    });
    it("error, when unexpected character", () => {
        let code = "a = @1";
        scanner.init(code);
        scanner.next();
        scanner.next();
        let next = scanner.next();
        deepEqual(next, {
            type: 2200,
            line: 1,
            lexeme: "unexpected character @",
        });
    });
});
