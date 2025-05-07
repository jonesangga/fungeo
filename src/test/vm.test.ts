// @jonesangga, 07-05-2025, MIT License.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Op, OpName, Chunk } from "../chunk.js"
import { Kind, FGBoolean, FGNumber, FGString } from "../value.js"
import { compiler } from "../compiler.js"
import { stack, stackTop, vm } from "../vm.js"

describe("vm:stack", () => {

    it("Op.Ret", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "";
        let result = compiler.compile(source, chunk);
        console.log(chunk);
        vm.set(chunk);
        vm.step();
        assert.deepEqual(stack, []);
    });

    it("Op.Set", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 2";
        let result = compiler.compile(source, chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1]
        ]);

        vm.step();      // Op.Set
        assert.deepEqual(stack.slice(0, stackTop), []);
        vm.step();      // Op.Ret
    });

    it("Op.GetUsr", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 2 b = a";
        let result = compiler.compile(source, chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1]
        ]);

        vm.step();      // Op.Set
        assert.deepEqual(stack.slice(0, stackTop), []);

        vm.step();      // Op.GetUsr
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1]
        ]);

        vm.step();      // Op.Set
        assert.deepEqual(stack.slice(0, stackTop), []);
    });

});
