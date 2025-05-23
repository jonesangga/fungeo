import { describe, it } from "node:test";
import { equal } from "node:assert/strict";
import { color } from "../../data/constant.js";
import Rect from "../../geo/rect.js";
describe("Rect", () => {
    it("create Rect with default color", () => {
        let r = new Rect(10, 20, 30, 40);
        equal(r.kind, 900);
        equal(r.x, 10);
        equal(r.y, 20);
        equal(r.w, 30);
        equal(r.h, 40);
        equal(r.strokeStyle, color.black);
        equal(r.fillStyle, color.nocolor);
    });
    it("Rect to string", () => {
        let r = new Rect(10, 20, 30, 40);
        let result = r.to_str();
        equal(result, "R 10 20 30 40");
    });
});
