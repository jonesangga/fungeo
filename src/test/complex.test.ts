// High level test.

import "global-jsdom/register"
import { describe, it } from "node:test";
import { equal, fail } from "node:assert/strict";

import { parse } from "../parser.js"
import { typecheck } from "../typechecker.js";
import { compile } from "../compile.js"
import { vm } from "../vm.js"

const tests = [
    [`let a = Complex(1, 2)
      print(a)`,
      `1+2i\n`,
    ],
    [`let a = Complex(1, 2)
      let b = Complex(3, 4)
      print(a.add(b))`,
      `4+6i\n`,
    ],
    [`let a = Complex(3, 4)
      let b = Complex(1, 2)
      print(a.sub(b))`,
      `2+2i\n`,
    ],
    [`let a = Complex(1, 2)
      let b = Complex(3, 4)
      print(a.mul(b))`,
      `-5+10i\n`,
    ],
];

describe("Testing output", () => {
    for (const [input, output] of tests) {
        it("", () => {
            vm.init();
            const parseR = parse(input);
            if (!parseR.ok) fail(parseR.error.message);

            const typecheckR = typecheck(parseR.value);
            if (!typecheckR.ok) fail(typecheckR.error.message);

            const compileR = compile(parseR.value, typecheckR.value);
            if (!compileR.ok) fail(compileR.error.message);

            const vmResult = vm.interpret(compileR.value);
            if (!vmResult.ok) fail(vmResult.error.message);

            const actual = vmResult.value;

            equal(actual, output);
        });
    }
});
