import { c } from "../ui/canvas.js";
import { Color } from "../data/constant.js";
export class Segment {
    x1;
    y1;
    x2;
    y2;
    strokeStyle;
    kind = 800;
    constructor(x1, y1, x2, y2, strokeStyle = Color.BLACK) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.strokeStyle = strokeStyle;
    }
    equal(other) { return false; }
    to_str() {
        return `Seg ${this.x1} ${this.y1} ${this.x2} ${this.y2}`;
    }
    draw() {
        c.beginPath();
        c.moveTo(this.x1, this.y1);
        c.lineTo(this.x2, this.y2);
        c.strokeStyle = this.strokeStyle;
        c.stroke();
    }
}
