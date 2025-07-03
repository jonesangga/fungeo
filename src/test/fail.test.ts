// @jonesangga, 29-05-2025, MIT License.

import "global-jsdom/register"
import { describe, it } from "node:test";
import { equal, fail } from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { parse } from "../parser.js"
import { typecheck } from "../typechecker.js";
import { compile } from "../compile.js"
import { vm } from "../vm.js"

function get_files(path: string): string[] {
    return readdirSync(path, { recursive: true, withFileTypes: true })
              .filter(item => !item.isDirectory())
              .map(item => item.parentPath + "/" + item.name);
}

let testFiles = get_files("./test_fail/");
// console.log(testFiles);

type Result =
    | { ok: true, value: string }
    | { ok: false, error: Error };

function read(path: string): Result {
    try {
        let data = readFileSync(path, "utf8");
        return { ok: true, value: data };
    } catch (err: unknown) {
        return { ok: false, error: err as Error };
    }
}

describe("Should fail", () => {
    for (let i = 0; i < testFiles.length; i += 2) {
        it(testFiles[i], () => {
            let input = read(testFiles[i]);
            if (!input.ok)
                fail(input.error.message);

            let output = read(testFiles[i + 1]);
            if (!output.ok)
                fail(output.error.message);

            vm.init();
            let parseR = parse(input.value);
            if (!parseR.ok) {
                equal(parseR.error.message, output.value);
                return;
            }

            let typecheckR = typecheck(parseR.value);
            if (!typecheckR.ok) {
                equal(typecheckR.error.message, output.value);
                return;
            }

            let compileR = compile(parseR.value, typecheckR.value);
            if (!compileR.ok) {
                equal(compileR.error.message, output.value);
                return;
            }

            let vmResult = vm.interpret(compileR.value);
            if (!vmResult.ok) {
                equal(vmResult.error.message, output.value);
                return;
            }

            fail("should error, but not error");
        });
    }
});
