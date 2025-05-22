import { c } from "../ui/canvas.js";
import { color } from "../data/constant.js";
export default class Picture {
    w;
    h;
    x = 0;
    y = 0;
    kind = 840;
    objs = [];
    strokeStyle = color.black;
    constructor(w, h) {
        this.w = w;
        this.h = h;
    }
    to_str() {
        return `Picture ${this.w} ${this.h}`;
    }
    draw() {
        c.strokeStyle = this.strokeStyle;
        c.save();
        c.translate(this.x, this.y);
        c.strokeRect(0, 0, this.w, this.h);
        for (let obj of this.objs)
            obj.draw();
        c.restore();
    }
}
