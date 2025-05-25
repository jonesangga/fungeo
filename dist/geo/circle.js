import { c } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { FGNumber } from "../value.js";
export default class Circle {
    x;
    y;
    r;
    strokeStyle;
    fillStyle;
    kind = 700;
    bend;
    constructor(x, y, r, strokeStyle = color.black, fillStyle = color.nocolor) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
    }
    static with_bend(x, y, bend) {
        let c = new Circle(x, y, Math.abs(1 / bend));
        c.bend = bend;
        return c;
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
    static descartes(c1, c2, c3) {
        let k1 = c1.bend;
        let k2 = c2.bend;
        let k3 = c3.bend;
        let sum = k1 + k2 + k3;
        let root = 2 * Math.sqrt(k1 * k2 + k2 * k3 + k1 * k3);
        return [new FGNumber(sum + root), new FGNumber(sum - root)];
    }
}
