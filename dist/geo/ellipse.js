import { c } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { FGType } from "../value.js";
import { ellipseT } from "../type.js";
export default class Ellipse {
    x;
    y;
    rx;
    ry;
    t;
    strokeStyle;
    fillStyle;
    kind = 750;
    constructor(x, y, rx, ry, t = 0, strokeStyle = color.black, fillStyle = color.nocolor) {
        this.x = x;
        this.y = y;
        this.rx = rx;
        this.ry = ry;
        this.t = t;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
    }
    to_str() {
        return `E ${this.x} ${this.y} ${this.rx} ${this.ry}`;
    }
    typeof() {
        return new FGType(ellipseT);
    }
    draw() {
        c.beginPath();
        c.ellipse(this.x, this.y, this.rx, this.ry, this.t, 0, TAU);
        if (this.fillStyle !== "") {
            c.fillStyle = this.fillStyle;
            c.fill();
        }
        if (this.strokeStyle !== "") {
            c.strokeStyle = this.strokeStyle;
            c.stroke();
        }
    }
}
