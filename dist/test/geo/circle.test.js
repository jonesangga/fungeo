import 'global-jsdom/register';
import { describe, it } from "node:test";
import { equal } from "node:assert/strict";
import { color } from "../../data/constant.js";
import Circle from "../../geo/circle.js";
describe("Circle", () => {
    it("create Circle with default color", () => {
        let c = new Circle(10, 20, 30);
        equal(c.kind, 700);
        equal(c.x, 10);
        equal(c.y, 20);
        equal(c.r, 30);
        equal(c.strokeStyle, color.black);
        equal(c.fillStyle, color.nocolor);
    });
    it("Circle to string", () => {
        let c = new Circle(10, 20, 30);
        let result = c.to_str();
        equal(result, "C 10 20 30");
    });
});
