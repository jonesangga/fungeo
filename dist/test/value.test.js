import { describe, it } from "node:test";
import { equal, deepEqual } from "node:assert/strict";
import { FGBoolean, FGCallNative, FGCallUser, FGNumber, FGString } from "../value.js";
import { Chunk } from "../chunk.js";
describe("value", () => {
    it("FGBoolean", () => {
        let b = new FGBoolean(false);
        equal(b.kind, 300);
        equal(b.value, false);
        equal(b.to_str(), "false");
    });
    it("FGCallNative", () => {
        let f = (n) => { return; };
        let b = new FGCallNative("f", 0, f, [
            {
                input: [500],
                output: 500,
            }
        ]);
        equal(b.kind, 400);
        equal(b.name, "f");
        equal(b.callType, 0);
        deepEqual(b.value, f);
        equal(b.to_str(), "<fn f>");
    });
    it("FGCallUser", () => {
        let b = new FGCallUser("testfn", 0, [
            {
                input: [500],
                output: 500,
            }
        ], new Chunk(""));
        equal(b.kind, 450);
        equal(b.name, "testfn");
        equal(b.callType, 0);
        equal(b.to_str(), "<fn testfn>");
    });
    it("FGNumber", () => {
        let b = new FGNumber(123);
        equal(b.kind, 500);
        equal(b.value, 123);
        equal(b.to_str(), "123");
    });
    it("FGString", () => {
        let b = new FGString("real");
        equal(b.kind, 600);
        equal(b.value, "real");
        equal(b.to_str(), "real");
    });
});
