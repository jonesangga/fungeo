// @jonesangga, 05-05-2025, MIT License.
//
// TODO: test FGType
//       test version in FGCallNative and FGCallUser

import { describe, it } from "node:test";
import { equal, deepEqual } from "node:assert/strict";
import { Kind, CallT, FGBoolean, FGCallNative, FGCallUser, FGNumber, FGString } from "../value.js"
import { Chunk } from "../chunk.js"
import { numberT } from "../type.js"

describe("value", () => {

    it("FGBoolean", () => {
        let b = new FGBoolean(false);

        equal(b.kind, Kind.Boolean);
        equal(b.value, false);
        equal(b.to_str(), "false");
    });

    it("FGCallNative", () => {
        let f = () => {return;};
        let b = new FGCallNative("f", CallT.Function, f, {
            input: [numberT],
            output: numberT,
        });

        equal(b.kind, Kind.CallNative);
        equal(b.name, "f");
        equal(b.callType, CallT.Function);
        deepEqual(b.value, f);
        equal(b.to_str(), "{fn f}");
    });

    it("FGCallUser", () => {
        let b = new FGCallUser("testfn", CallT.Function, {
            input: [numberT],
            output: numberT,
        }, new Chunk(""));

        equal(b.kind, Kind.CallUser);
        equal(b.name, "testfn");
        equal(b.callType, CallT.Function);
        equal(b.to_str(), "{fn testfn}");
    });

    it("FGNumber", () => {
        let b = new FGNumber(123);

        equal(b.kind, Kind.Number);
        equal(b.value, 123);
        equal(b.to_str(), "123");
    });

    it("FGString", () => {
        let b = new FGString("real");

        equal(b.kind, Kind.String);
        equal(b.value, "real");
        equal(b.to_str(), "real");
    });

});
