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

    it("Op.Add", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 123 + 456";
        let result = compiler.compile(source, chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1]
        ]);

        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);

        vm.step();      // Op.Add
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGNumber(579)
        ]);
    });

    it("Op.AddStr", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "str = \"so \" ++ \"real\"";
        let result = compiler.compile(source, chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1]
        ]);

        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);

        vm.step();      // Op.AddStr
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGString("so real")
        ]);
    });

    it("Op.Sub", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 100 - 50";
        let result = compiler.compile(source, chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1]
        ]);

        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);

        vm.step();      // Op.Sub
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGNumber(50)
        ]);
    });

    it("Op.Mul", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 10 * 50";
        let result = compiler.compile(source, chunk);
        console.log(chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1]
        ]);

        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);

        vm.step();      // Op.Mul
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGNumber(500)
        ]);
    });

    it("Op.Div", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 50 / 10";
        let result = compiler.compile(source, chunk);
        console.log(chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1]
        ]);

        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);

        vm.step();      // Op.Div
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGNumber(5)
        ]);
    });

    it("error: Op.Div", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 50 / 0";
        let result = compiler.compile(source, chunk);
        console.log(chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1]
        ]);

        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);

        let runresult = vm.step();      // Op.Div
        assert.deepEqual(runresult, {
            success: false, message: "1: in script: division by zero\n"
        });
    });

    it("Op.Neg", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = -50";
        let result = compiler.compile(source, chunk);
        console.log(chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1]
        ]);

        vm.step();      // Op.Neg
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGNumber(-50)
        ]);
    });

    it("Op.Not", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = !false";
        let result = compiler.compile(source, chunk);
        console.log(chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[1]
        ]);

        vm.step();      // Op.Not
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGBoolean(true)
        ]);
    });

});
