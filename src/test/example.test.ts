// @jonesangga, 29-05-2025, MIT License.

import "global-jsdom/register"
import { describe, it } from "node:test";
import { equal, fail } from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { compiler } from "../compiler.js"
import { vm } from "../vm.js"

function get_files(path: string): string[] {
    return readdirSync(path, { recursive: true, withFileTypes: true })
              .filter(item => !item.isDirectory())
              .map(item => item.parentPath + "/" + item.name);
}

let failFiles = get_files("./example/fail/");
// console.log(failFiles);

let successFiles = get_files("./example/success/");
// console.log(successFiles);

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

describe("should fail", () => {
    for (let i = 0; i < failFiles.length; i += 2) {
        it(failFiles[i], () => {
            let input = read(failFiles[i]);
            if (!input.ok)
                fail(input.error.message);

            let output = read(failFiles[i + 1]);
            if (!output.ok)
                fail(output.error.message);

            vm.init();
            let compResult = compiler.compile(input.value);
            if (!compResult.ok) {
                let actual = compResult.error.message;
                equal(actual, output.value);
            }
            else {
                let vmResult = vm.interpret(compResult.value);
                if (vmResult.ok)
                    fail("should fail, but succeed");

                let actual = vmResult.error.message;
                equal(actual, output.value);
            }
        });
    }
});

describe("should succeed", () => {
    for (let i = 0; i < successFiles.length; i += 2) {
        it(successFiles[i], () => {
            let input = read(successFiles[i]);
            if (!input.ok)
                fail(input.error.message);

            let output = read(successFiles[i + 1]);
            if (!output.ok)
                fail(output.error.message);

            vm.init();
            let compResult = compiler.compile(input.value);
            if (!compResult.ok)
                fail(compResult.error.message);

            let vmResult = vm.interpret(compResult.value);
            if (!vmResult.ok)
                fail(vmResult.error.message);

            let actual = vmResult.value;
            equal(actual, output.value);
        });
    }
});
