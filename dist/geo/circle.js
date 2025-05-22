import { c } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
export default class Circle {
    x;
    y;
    r;
    strokeStyle;
    fillStyle;
    kind = 700;
    constructor(x, y, r, strokeStyle = color.black, fillStyle = color.nocolor) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
    }
    to_str() {
        return `C ${this.x} ${this.y} ${this.r}`;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, TAU);
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
