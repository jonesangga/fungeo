// @jonesangga, 05-05-2025, MIT License.

import { describe, it } from "node:test";
import { equal } from "node:assert/strict";
import { Kind } from "../../value.js"
import { color } from "../../data/constant.js"
import Ellipse from "../../geo/ellipse.js"

describe("Ellipse", () => {
    it("create Ellipse with default color", () => {
        let e = new Ellipse(10, 20, 30, 40);

        equal(e.kind, Kind.Ellipse);
        equal(e.x, 10);
        equal(e.y, 20);
        equal(e.rx, 30);
        equal(e.ry, 40);
        equal(e.t, 0);
        equal(e.strokeStyle, color.black);
        equal(e.fillStyle, color.nocolor);
    });

    it("Ellipse to string", () => {
        let e = new Ellipse(10, 20, 30, 40);

        let result = e.to_str();

        equal(result, "E 10 20 30 40");
    });
});
