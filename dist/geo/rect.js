import { c } from "../ui/canvas.js";
import { color } from "../data/constant.js";
import { FGType } from "../value.js";
import { rectT } from "../type.js";
export default class Rect {
    x;
    y;
    w;
    h;
    strokeStyle;
    fillStyle;
    kind = 900;
    constructor(x, y, w, h, strokeStyle = color.black, fillStyle = color.nocolor) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
    }
    to_str() {
        return `R ${this.x} ${this.y} ${this.w} ${this.h}`;
    }
    typeof() {
        return new FGType(rectT);
    }
    draw() {
        if (this.fillStyle !== "") {
            c.fillStyle = this.fillStyle;
            c.fillRect(this.x, this.y, this.w, this.h);
        }
        if (this.strokeStyle !== "") {
            c.strokeStyle = this.strokeStyle;
            c.strokeRect(this.x, this.y, this.w, this.h);
        }
    }
}
