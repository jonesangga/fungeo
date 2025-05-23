import { describe, it } from "node:test";
import { equal } from "node:assert/strict";
import { color } from "../../data/constant.js";
import Point from "../../geo/point.js";
describe("Point", () => {
    it("create Point with default color", () => {
        let p = new Point(10, 20);
        equal(p.kind, 850);
        equal(p.x, 10);
        equal(p.y, 20);
        equal(p.lineWidth, 5);
        equal(p.strokeStyle, color.black);
    });
    it("Point to string", () => {
        let p = new Point(10, 20);
        let result = p.to_str();
        equal(result, "P 10 20");
    });
});
