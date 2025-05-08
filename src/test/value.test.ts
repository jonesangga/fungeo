// @jonesangga, 05-05-2025, MIT License.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Kind, FGBoolean, FGCallable, FGNumber, FGString } from "../value.js"

describe("value", () => {

    it("FGBoolean", () => {
        let b = new FGBoolean(false);
        assert.equal(b.kind, Kind.Boolean);
        assert.equal(b.value, false);
        assert.equal(b.to_str(), "false");
    });

    it("FGCallable", () => {
        let f = (n: number) => {return;};
        let b = new FGCallable(f, [
            {
                input: [Kind.Number],
                output: Kind.Number,
            }
        ]);
        assert.equal(b.kind, Kind.Callable);
        assert.deepEqual(b.value, f);
        assert.equal(b.to_str(), "fn(n: number): void");
    });

    it("FGNumber", () => {
        let b = new FGNumber(123);
        assert.equal(b.kind, Kind.Number);
        assert.equal(b.value, 123);
        assert.equal(b.to_str(), "123");
    });

    it("FGString", () => {
        let b = new FGString("real");
        assert.equal(b.kind, Kind.String);
        assert.equal(b.value, "real");
        assert.equal(b.to_str(), "real");
    });

});
