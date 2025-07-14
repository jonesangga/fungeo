// @jonesangga, 05-05-2025, MIT License.

import { describe, it } from "node:test";
import { deepEqual, equal } from "node:assert/strict";
import { FGColor } from "../../literal/color.js"
import { colorTVal } from "../../literal/type.js"

describe("Color", () => {
    it("constructor with default opacity", () => {
        let c = new FGColor(10, 20, 30);

        equal(c.r, 10);
        equal(c.g, 20);
        equal(c.b, 30);
        equal(c.a, 255);
    });

    it("constructor with given opacity", () => {
        let c = new FGColor(10, 20, 30, 40);

        equal(c.r, 10);
        equal(c.g, 20);
        equal(c.b, 30);
        equal(c.a, 40);
    });

    it("to_str()", () => {
        let c = new FGColor(10, 20, 30, 40);

        let result = c.to_str();

        equal(result, "Color 10,20,30,40");
    });

    it("typeof()", () => {
        let c = new FGColor(10, 20, 30, 40);

        let result = c.typeof();

        deepEqual(result, colorTVal);
    });

    it("to_hex()", () => {
        let c = new FGColor(10, 20, 30, 40);

        let result = c.to_hex();

        equal(result, "#0a141e28");
    });
});
