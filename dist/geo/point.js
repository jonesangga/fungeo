import { c } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { FGType, pointT } from "../literal/type.js";
export default class Point {
    x;
    y;
    lineWidth;
    strokeStyle;
    kind = 850;
    constructor(x, y, lineWidth = 5, strokeStyle = color.black) {
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
        this.strokeStyle = strokeStyle;
    }
    to_str() {
        return `P ${this.x} ${this.y}`;
    }
    typeof() {
        return new FGType(pointT);
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.lineWidth / 2, 0, TAU);
        c.fillStyle = this.strokeStyle;
        c.fill();
    }
}
