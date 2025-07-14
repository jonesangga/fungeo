// @jonesangga, 05-05-2025, MIT License.
//
// TODO: test FGType
//       test version in FGCallNative and FGCallUser

import { describe, it } from "node:test";
import { equal } from "node:assert/strict";
import { FGBoolean, FGCallUser, FGNumber, FGString } from "../value.js"
import { Chunk } from "../chunk.js"
import { numberT } from "../literal/type.js"

describe("value", () => {

    it("FGBoolean", () => {
        let b = new FGBoolean(false);

        equal(b.value, false);
        equal(b.to_str(), "false");
    });

    // it("FGCallNative", () => {
        // let f = () => {return;};
        // let b = new FGCallNative("f", f, [numberT], numberT);

        // equal(b.name, "f");
        // deepEqual(b.value, f);
        // equal(b.to_str(), "{fn f}");
    // });

    it("FGCallUser", () => {
        let b = new FGCallUser("testfn", [numberT], numberT, new Chunk(""));

        equal(b.name, "testfn");
        equal(b.to_str(), "{fn testfn}");
    });

    it("FGNumber", () => {
        let b = new FGNumber(123);

        equal(b.value, 123);
        equal(b.to_str(), "123");
    });

    it("FGString", () => {
        let b = new FGString("real");

        equal(b.value, "real");
        equal(b.to_str(), "real");
    });

});
