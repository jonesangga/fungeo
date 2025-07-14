import "global-jsdom/register";
import { describe, it } from "node:test";
import { equal, fail } from "node:assert/strict";
import { parse } from "../parser.js";
import { typecheck } from "../typechecker.js";
import { compile } from "../compile.js";
import { vm } from "../vm.js";
const tests = [[
        "printing a + bi form",
        `let a = Complex(123, 4.56)
     print(a)`,
        `123 + 4.56i\n`,
    ], [
        "printing a - bi form",
        `let a = Complex(123, -4.56)
     print(a)`,
        `123 - 4.56i\n`,
    ], [
        "printing a + 0i form",
        `let a = Complex(123, 0)
     print(a)`,
        `123\n`,
    ], [
        "printing a form",
        `let a = Complex(123)
     print(a)`,
        `123\n`,
    ], [
        "printing 0 + bi form",
        `let a = Complex(0, 123)
     print(a)`,
        `123i\n`,
    ], [
        "printing 0 + 0i form",
        `let a = Complex(0, 0)
     print(a)`,
        `0\n`,
    ], [
        "add",
        `let a = Complex(1, 2)
     let b = Complex(3, 4)
     print(a.add(b))`,
        `4 + 6i\n`,
    ], [
        "sub",
        `let a = Complex(1, 2)
     let b = Complex(3, 4)
     print(a.sub(b))`,
        `-2 - 2i\n`,
    ], [
        "mul",
        `let a = Complex(1, 2)
     let b = Complex(3, 4)
     print(a.mul(b))`,
        `-5 + 10i\n`,
    ], [
        "div",
        `let a = Complex(5, -1)
     let b = Complex(-3, 1)
     print(a.div(b))`,
        `-1.6 - 0.2i\n`,
    ], [
        "abs",
        `let a = Complex(3, 4)
     print(a.abs())`,
        `5\n`,
    ], [
        "arg",
        `let a = Complex(1, 1)
     print(a.arg())`,
        `${Math.PI / 4}\n`,
    ], [
        "conj",
        `let a = Complex(1, 2)
     print(a.conj())`,
        `1 - 2i\n`,
    ]];
describe("Complex class", () => {
    for (const [title, input, output] of tests) {
        it(title, () => {
            vm.init();
            const parseR = parse(input);
            if (!parseR.ok)
                fail(parseR.error.message);
            const typecheckR = typecheck(parseR.value);
            if (!typecheckR.ok)
                fail(typecheckR.error.message);
            const compileR = compile(parseR.value, typecheckR.value);
            if (!compileR.ok)
                fail(compileR.error.message);
            const vmResult = vm.interpret(compileR.value);
            if (!vmResult.ok)
                fail(vmResult.error.message);
            const actual = vmResult.value;
            equal(actual, output);
        });
    }
});
