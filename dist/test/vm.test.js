import 'global-jsdom/register';
import { describe, it } from "node:test";
import { deepEqual, equal, fail } from "node:assert/strict";
import { FGBoolean, FGNumber, FGString } from "../value.js";
import { compiler } from "../compiler.js";
import { stack, stackTop, vm } from "../vm.js";
function setup(source) {
    vm.init();
    let result = compiler.compile(source);
    if (!result.ok)
        fail();
    let fn = result.value;
    vm.set(fn);
    return fn.chunk;
}
describe("vm Op.Ok", () => {
    it("empty source", () => {
        let chunk = setup("");
        vm.step();
        deepEqual(stack.slice(1, stackTop), []);
    });
});
describe("vm Op.Set", () => {
    it("global assignment", () => {
        let chunk = setup("a = 2");
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), []);
    });
});
describe("vm Op.GetUsr", () => {
    it("Get name's value", () => {
        let chunk = setup("a = 2 b = a");
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), []);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), []);
    });
});
describe("vm Op.Not", () => {
    it("Op.Not", () => {
        let chunk = setup("a = !false");
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGBoolean(true)
        ]);
    });
});
describe("vm Op.Neg", () => {
    it("Op.Neg", () => {
        let chunk = setup("a = -123");
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGNumber(-123)
        ]);
    });
});
describe("vm Op.Add", () => {
    it("Op.Add", () => {
        let chunk = setup("a = 100 + 200");
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGNumber(300)
        ]);
    });
});
describe("vm Op.Sub", () => {
    it("Op.Sub", () => {
        let chunk = setup("a = 100 - 50");
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGNumber(50)
        ]);
    });
});
describe("vm Op.Mul", () => {
    it("Op.Mul", () => {
        let chunk = setup("a = 10 * 50");
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGNumber(500)
        ]);
    });
});
describe("vm Op.Div", () => {
    it("Op.Div", () => {
        let chunk = setup("a = 50 / 10");
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGNumber(5)
        ]);
    });
});
describe("vm Op.IsDiv", () => {
    it("Op.IsDiv", () => {
        let chunk = setup("a = 5 | 10");
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGBoolean(true)
        ]);
    });
});
describe("vm Op.IsDiv error", () => {
    it("Op.IsDiv error", () => {
        let chunk = setup("a = 0 | 5");
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);
        let result = vm.step();
        equal(result.ok, false);
        equal(result.error.message, "1: in TOP: division by zero\n");
    });
});
describe("vm Op.AddStr", () => {
    it("Op.AddStr", () => {
        let chunk = setup(`a = "so " ++ "real"`);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGString("so real")
        ]);
    });
});
describe("vm Op.Eq", () => {
    it("Op.Eq", () => {
        let chunk = setup(`a = 12 == 34`);
        vm.step();
        vm.step();
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGBoolean(false)
        ]);
    });
});
describe("vm Op.NEq", () => {
    it("Op.NEq", () => {
        let chunk = setup(`a = 12 != 34`);
        vm.step();
        vm.step();
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGBoolean(true)
        ]);
    });
});
describe("vm Op.LT", () => {
    it("Op.LT", () => {
        let chunk = setup(`a = 12 < 34`);
        vm.step();
        vm.step();
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGBoolean(true)
        ]);
    });
});
describe("vm Op.LEq", () => {
    it("Op.LEq", () => {
        let chunk = setup(`a = 12 <= 34`);
        vm.step();
        vm.step();
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGBoolean(true)
        ]);
    });
});
describe("vm Op.GT", () => {
    it("Op.GT", () => {
        let chunk = setup(`a = 12 > 34`);
        vm.step();
        vm.step();
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGBoolean(false)
        ]);
    });
});
describe("vm Op.GEq", () => {
    it("Op.GEq", () => {
        let chunk = setup(`a = 12 >= 34`);
        vm.step();
        vm.step();
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            new FGBoolean(false)
        ]);
    });
});
describe("vm Op.GetLoc Op.SetLoc, Op.Pop", () => {
    it("Op.GetLoc Op.SetLoc, Op.Pop", () => {
        let chunk = setup(`{a = 123 b = a}`);
        vm.step();
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[0]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[0], chunk.values[0]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[0], chunk.values[0]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[0]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), []);
    });
});
describe("vm Op.Jmp, Op.JmpF: if branch", () => {
    it("Op.Jmp, Op.JmpF: if branch", () => {
        let chunk = setup(`if true Print "correct" else Print "wrong"`);
        vm.step();
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[0]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), []);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[1], chunk.values[2]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), []);
    });
});
describe("vm Op.Jmp, Op.JmpF: else branch", () => {
    it("Op.Jmp, Op.JmpF: else branch", () => {
        let chunk = setup(`if false Print "correct" else Print "wrong"`);
        vm.step();
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[0]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), []);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[3]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), [
            chunk.values[3], chunk.values[4]
        ]);
        vm.step();
        deepEqual(stack.slice(1, stackTop), []);
    });
});
describe("vm output && ||", () => {
    const tests = [
        ["Print $ true && true", "true\n"],
        ["Print $ true && false", "false\n"],
        ["Print $ false && false", "false\n"],
        ["Print $ false && true", "false\n"],
        ["Print $ true || true", "true\n"],
        ["Print $ true || false", "true\n"],
        ["Print $ false || false", "false\n"],
        ["Print $ false || true", "true\n"],
    ];
    for (let [source, expected] of tests) {
        it(source, () => {
            vm.init();
            let result = compiler.compile(source);
            if (!result.ok)
                fail(result.error.message);
            let vmresult = vm.interpret(result.value);
            if (!vmresult.ok)
                fail(vmresult.error.message);
            equal(vmresult.value, expected);
        });
    }
});
