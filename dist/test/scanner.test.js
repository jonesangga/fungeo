import { describe, it } from "node:test";
import { deepEqual } from "node:assert/strict";
import { scanner } from "../scanner.js";
describe("scanner handling EOF", () => {
    it("success, on empty code", () => {
        let code = "";
        scanner.init(code);
        let next = scanner.next();
        deepEqual(next, {
            kind: 2100,
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
            kind: 2100,
            line: 1,
            lexeme: "",
        });
    });
});
describe("scanner each token type", () => {
    const tests = {
        [1180]: ["&", { kind: 1180, line: 1, lexeme: "&" }],
        [1190]: ["&&", { kind: 1190, line: 1, lexeme: "&&" }],
        [1195]: ["->", { kind: 1195, line: 1, lexeme: "->" }],
        [1200]: ["!", { kind: 1200, line: 1, lexeme: "!" }],
        [1210]: ["!=", { kind: 1210, line: 1, lexeme: "!=" }],
        [2220]: ["Bool", { kind: 2220, line: 1, lexeme: "Bool" }],
        [1650]: ["Display", { kind: 1650, line: 1, lexeme: "Display" }],
        [1300]: [":", { kind: 1300, line: 1, lexeme: ":" }],
        [1400]: [":=", { kind: 1400, line: 1, lexeme: ":=" }],
        [100]: [",", { kind: 100, line: 1, lexeme: "," }],
        [2230]: ["Circle", { kind: 2230, line: 1, lexeme: "Circle" }],
        [1450]: ["|", { kind: 1450, line: 1, lexeme: "|" }],
        [200]: ["$", { kind: 200, line: 1, lexeme: "$" }],
        [210]: [".", { kind: 210, line: 1, lexeme: "." }],
        [2300]: ["else", { kind: 2300, line: 1, lexeme: "else" }],
        [2100]: ["", { kind: 2100, line: 1, lexeme: "" }],
        [1500]: ["=", { kind: 1500, line: 1, lexeme: "=" }],
        [1505]: ["==", { kind: 1505, line: 1, lexeme: "==" }],
        [2200]: ["@", { kind: 2200, line: 1, lexeme: "unexpected character @" }],
        [1700]: ["false", { kind: 1700, line: 1, lexeme: "false" }],
        [2320]: ["fn", { kind: 2320, line: 1, lexeme: "fn" }],
        [2450]: ["global", { kind: 2450, line: 1, lexeme: "global" }],
        [1520]: [">", { kind: 1520, line: 1, lexeme: ">" }],
        [1525]: [">=", { kind: 1525, line: 1, lexeme: ">=" }],
        [250]: ["#", { kind: 250, line: 1, lexeme: "#" }],
        [2400]: ["if", { kind: 2400, line: 1, lexeme: "if" }],
        [2405]: ["ifx", { kind: 2405, line: 1, lexeme: "ifx" }],
        [300]: ["{", { kind: 300, line: 1, lexeme: "{" }],
        [400]: ["[", { kind: 400, line: 1, lexeme: "[" }],
        [1550]: ["<", { kind: 1550, line: 1, lexeme: "<" }],
        [1555]: ["<=", { kind: 1555, line: 1, lexeme: "<=" }],
        [500]: ["(", { kind: 500, line: 1, lexeme: "(" }],
        [1560]: ["<>", { kind: 1560, line: 1, lexeme: "<>" }],
        [2460]: ["let", { kind: 2460, line: 1, lexeme: "let" }],
        [2500]: ["mut", { kind: 2500, line: 1, lexeme: "mut" }],
        [600]: ["-", { kind: 600, line: 1, lexeme: "-" }],
        [2540]: ["kasukasu", { kind: 2540, line: 1, lexeme: "kasukasu" }],
        [2550]: ["nonlocal", { kind: 2550, line: 1, lexeme: "nonlocal" }],
        [1800]: ["123.456", { kind: 1800, line: 1, lexeme: "123.456" }],
        [2600]: ["Num", { kind: 2600, line: 1, lexeme: "Num" }],
        [1575]: ["|>", { kind: 1575, line: 1, lexeme: "|>" }],
        [1580]: ["||", { kind: 1580, line: 1, lexeme: "||" }],
        [1585]: ["+", { kind: 1585, line: 1, lexeme: "+" }],
        [1590]: ["++", { kind: 1590, line: 1, lexeme: "++" }],
        [2750]: ["proc", { kind: 2750, line: 1, lexeme: "proc" }],
        [695]: ["}", { kind: 695, line: 1, lexeme: "}" }],
        [700]: ["]", { kind: 700, line: 1, lexeme: "]" }],
        [2800]: ["return", { kind: 2800, line: 1, lexeme: "return" }],
        [800]: [")", { kind: 800, line: 1, lexeme: ")" }],
        [900]: [";", { kind: 900, line: 1, lexeme: ";" }],
        [1000]: ["/", { kind: 1000, line: 1, lexeme: "/" }],
        [1100]: ["*", { kind: 1100, line: 1, lexeme: "*" }],
        [1900]: ["\"real\"", { kind: 1900, line: 1, lexeme: "real" }],
        [2900]: ["Str", { kind: 2900, line: 1, lexeme: "Str" }],
        [3000]: ["then", { kind: 3000, line: 1, lexeme: "then" }],
        [2000]: ["true", { kind: 2000, line: 1, lexeme: "true" }],
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
            kind: 2200,
            line: 2,
            lexeme: "unterminated string",
        });
    });
    it("error, when unexpected character", () => {
        let code = "a = @1";
        scanner.init(code);
        scanner.next();
        scanner.next();
        let next = scanner.next();
        deepEqual(next, {
            kind: 2200,
            line: 1,
            lexeme: "unexpected character @",
        });
    });
});
