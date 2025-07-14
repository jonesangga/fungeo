import { describe, it } from "node:test";
import { equal } from "node:assert/strict";
import { color } from "../../data/constant.js";
import { Segment } from "../../geo/segment.js";
describe("Segment", () => {
    it("create Segment with default color", () => {
        let seg = new Segment(10, 20, 30, 40);
        equal(seg.x1, 10);
        equal(seg.y1, 20);
        equal(seg.x2, 30);
        equal(seg.y2, 40);
        equal(seg.strokeStyle, color.black);
    });
    it("Segment to string", () => {
        let seg = new Segment(10, 20, 30, 40);
        let result = seg.to_str();
        equal(result, "Seg 10 20 30 40");
    });
    it("midpoint of Segment", () => {
        let seg = new Segment(10, 20, 30, 40);
        let p = seg.midpoint();
        equal(p.x, 20);
        equal(p.y, 30);
        equal(p.lineWidth, 5);
        equal(p.strokeStyle, color.black);
    });
});
