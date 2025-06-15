import { describe, it } from "node:test";
import { equal } from "node:assert/strict";
import { FGBoolean, FGCallUser, FGNumber, FGString } from "../value.js";
import { Chunk } from "../chunk.js";
import { numberT } from "../literal/type.js";
describe("value", () => {
    it("FGBoolean", () => {
        let b = new FGBoolean(false);
        equal(b.kind, 300);
        equal(b.value, false);
        equal(b.to_str(), "false");
    });
    it("FGCallUser", () => {
        let b = new FGCallUser("testfn", [numberT], numberT, new Chunk(""));
        equal(b.kind, 450);
        equal(b.name, "testfn");
        equal(b.to_str(), "{fn testfn}");
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
