import "global-jsdom/register";
import { describe, it } from "node:test";
import { equal, fail } from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { parse } from "../parser.js";
import { typecheck } from "../typechecker.js";
import { compile } from "../compile.js";
import { vm } from "../vm.js";
function get_files(path) {
    return readdirSync(path, { recursive: true, withFileTypes: true })
        .filter(item => !item.isDirectory())
        .map(item => item.parentPath + "/" + item.name);
}
let testFiles = get_files("./test_output/");
function read(path) {
    try {
        let data = readFileSync(path, "utf8");
        return { ok: true, value: data };
    }
    catch (err) {
        return { ok: false, error: err };
    }
}
describe("Testing output", () => {
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
            if (!parseR.ok)
                fail(parseR.error.message);
            let typecheckR = typecheck(parseR.value);
            if (!typecheckR.ok)
                fail(typecheckR.error.message);
            let compileR = compile(parseR.value, typecheckR.value);
            if (!compileR.ok)
                fail(compileR.error.message);
            let vmResult = vm.interpret(compileR.value);
            if (!vmResult.ok)
                fail(vmResult.error.message);
            let actual = vmResult.value;
            equal(actual, output.value);
        });
    }
});
