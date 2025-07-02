import { defaultCanvas as canvas } from "../ui/canvas.js";
import { color } from "../data/constant.js";
import { FGNumber } from "../value.js";
import { Point } from "./point.js";
import { FGType, segmentT } from "../literal/type.js";
const c = canvas.ctx;
export class Segment {
    x1;
    y1;
    x2;
    y2;
    strokeStyle;
    kind = 1000;
    field = {};
    constructor(x1, y1, x2, y2, strokeStyle = color.black) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.strokeStyle = strokeStyle;
        this.field["x1"] = new FGNumber(this.x1);
        this.field["y1"] = new FGNumber(this.y1);
        this.field["x2"] = new FGNumber(this.x2);
        this.field["y2"] = new FGNumber(this.y2);
    }
    to_str() {
        return `Seg ${this.x1} ${this.y1} ${this.x2} ${this.y2}`;
    }
    typeof() {
        return new FGType(segmentT);
    }
    length() {
        return Math.sqrt((this.x2 - this.x1) ** 2 + (this.y2 - this.y1) ** 2);
    }
    draw() {
        c.beginPath();
        c.moveTo(this.x1, this.y1);
        c.lineTo(this.x2, this.y2);
        c.strokeStyle = this.strokeStyle;
        c.stroke();
    }
    midpoint() {
        return new Point((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2);
    }
}
