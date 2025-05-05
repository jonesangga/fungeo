import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FGBoolean, FGCallable, FGNumber, FGString } from "../value.js";
describe("value", () => {
    it("FGBoolean", () => {
        let b = new FGBoolean(false);
        assert.equal(b.kind, 2);
        assert.equal(b.value, false);
        assert.equal(b.to_str(), "false");
    });
    it("FGCallable", () => {
        let f = (n) => { return; };
        let b = new FGCallable(f);
        assert.equal(b.kind, 3);
        assert.deepEqual(b.value, f);
        assert.equal(b.to_str(), "fn(n: number): void");
    });
    it("FGNumber", () => {
        let b = new FGNumber(123);
        assert.equal(b.kind, 4);
        assert.equal(b.value, 123);
        assert.equal(b.to_str(), "123");
    });
    it("FGString", () => {
        let b = new FGString("real");
        assert.equal(b.kind, 5);
        assert.equal(b.value, "real");
        assert.equal(b.to_str(), "real");
    });
});
