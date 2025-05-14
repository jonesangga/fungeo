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

    it("Op.IsDiv", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "isDiv = 5 | 10";
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

        vm.step();      // Op.IsDiv
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGBoolean(true)
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

    it("Op.Eq", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 12 == 34";
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

        vm.step();      // Op.Eq
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGBoolean(false)
        ]);
    });

    it("Op.NEq", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 12 != 34";
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

        vm.step();      // Op.NEq
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGBoolean(true)
        ]);
    });

    it("Op.LT", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 123 < 456";
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

        vm.step();      // Op.LT
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGBoolean(true)
        ]);
    });

    it("Op.LEq", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 123 <= 456";
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

        vm.step();      // Op.LEq
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGBoolean(true)
        ]);
    });

    it("Op.GT", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 123 > 456";
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

        vm.step();      // Op.GT
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGBoolean(false)
        ]);
    });

    it("Op.GEq", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "a = 123 >= 456";
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

        vm.step();      // Op.GEq
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGBoolean(false)
        ]);
    });

    it("Op.SetLoc, Op.GetLoc, Op.Pop", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "{a = 123 b = a}";
        let result = compiler.compile(source, chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[0]
        ]);

        vm.step();      // Op.SetLoc
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[0]
        ]);

        vm.step();      // Op.GetLoc
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[0], chunk.values[0]
        ]);

        vm.step();      // Op.SetLoc
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[0], chunk.values[0]
        ]);

        vm.step();      // Op.Pop
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[0]
        ]);

        vm.step();      // Op.Pop
        assert.deepEqual(stack.slice(0, stackTop), []);
    });

    it("Op.Jmp, Op.JmpF: if branch", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "if 1 < 2 Print \"correct\" else Print \"wrong\"";
        let result = compiler.compile(source, chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[0]
        ]);

        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[0], chunk.values[1]
        ]);

        vm.step();      // Op.LT
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGBoolean(true)
        ]);

        vm.step();      // Op.JmpF
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGBoolean(true)
        ]);

        vm.step();      // Op.Pop
        assert.deepEqual(stack.slice(0, stackTop), []);

        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[2]
        ]);

        vm.step();      // Op.CallNat
        assert.deepEqual(stack.slice(0, stackTop), []);

        vm.step();      // Op.Jmp
        assert.deepEqual(stack.slice(0, stackTop), []);
    });

    it("Op.Jmp, Op.JmpF: else branch", () => {
        vm.init();
        let chunk = new Chunk("test chunk");
        let source = "if 1 > 2 Print \"correct\" else Print \"wrong\"";
        let result = compiler.compile(source, chunk);

        vm.set(chunk);
        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[0]
        ]);

        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[0], chunk.values[1]
        ]);

        vm.step();      // Op.LT
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGBoolean(false)
        ]);

        vm.step();      // Op.JmpF
        assert.deepEqual(stack.slice(0, stackTop), [
            new FGBoolean(false)
        ]);

        vm.step();      // Op.Pop
        assert.deepEqual(stack.slice(0, stackTop), []);

        vm.step();      // Op.Load
        assert.deepEqual(stack.slice(0, stackTop), [
            chunk.values[4]
        ]);

        vm.step();      // Op.CallNat
        assert.deepEqual(stack.slice(0, stackTop), []);
    });

    // it.only("loop", () => {
        // vm.init();
        // let chunk = new Chunk("test chunk");
        // let source = "[0,3] -> i Print i";
        // let result = compiler.compile(source, chunk);

        // vm.set(chunk);
        // vm.step();      // Op.Load
        // vm.step();      // Op.Load
        // vm.step();      // Op.Load
        // assert.deepEqual(stack.slice(0, stackTop), [
            // chunk.values[0], chunk.values[1], chunk.values[2],
        // ]);

        // vm.step();      // Op.Add
        // assert.deepEqual(stack.slice(0, stackTop), [
            // chunk.values[0], chunk.values[1],
        // ]);
        // vm.step();      // Op.SetLoc

        // for (let i = 0; i <= -1; i++) {
            // vm.step();      // Op.Cond
            // assert.deepEqual(stack.slice(0, stackTop), [
                // chunk.values[0], chunk.values[1], chunk.values[2], new FGBoolean(true)
            // ]);

            // // vm.step();      // Op.JmpF
            // // vm.step();      // Op.Pop
            // // assert.deepEqual(stack.slice(0, stackTop), [
                // // chunk.values[0], chunk.values[1]
            // // ]);

            // // vm.step();      // Op.GetLoc
            // // assert.deepEqual(stack.slice(0, stackTop), [
                // // chunk.values[0], chunk.values[1], chunk.values[0]
            // // ]);

            // // vm.step();      // Op.CallNat
            // // assert.deepEqual(stack.slice(0, stackTop), [
                // // chunk.values[0], chunk.values[1]
            // // ]);

            // // vm.step();      // Op.Inc
            // // assert.deepEqual(stack.slice(0, stackTop), [
                // // new FGNumber(i+1), chunk.values[1]
            // // ]);

            // // vm.step();      // Op.JmpBack
        // }

        // // vm.step();      // Op.Cond
        // // assert.deepEqual(stack.slice(0, stackTop), [
            // // chunk.values[0], chunk.values[1], new FGBoolean(false)
        // // ]);

        // // vm.step();      // Op.JmpF
        // // vm.step();      // Op.Pop
        // // assert.deepEqual(stack.slice(0, stackTop), [
            // // chunk.values[0], chunk.values[1]
        // // ]);
        // // vm.step();      // Op.Pop
        // // assert.deepEqual(stack.slice(0, stackTop), [
            // // chunk.values[0]
        // // ]);
        // // vm.step();      // Op.Pop
        // // assert.deepEqual(stack.slice(0, stackTop), []);
    // });
});

describe.skip("vm:output: && and ||", () => {

    function t(code: string, expect: string) {
        vm.init();
        let chunk = new Chunk("");
        let result = compiler.compile(code, chunk);

        if (!result.success) assert.fail("compile error: " + result.message);

        let vmresult = vm.interpret(chunk);
        assert.equal(vmresult.message, expect);
    }

    it("&&", () => {
        t("Print true && true", "true\n");
        t("Print true && false", "false\n");
        t("Print false && true", "false\n");
        t("Print false && false", "false\n");

        t("Print true || true", "true\n");
        t("Print true || false", "true\n");
        t("Print false || true", "true\n");
        t("Print false || false", "false\n");
    });
});
