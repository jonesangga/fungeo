import { defaultCanvas as canvas } from "../ui/canvas.js";
import { color } from "../data/constant.js";
import { Class, FGType } from "../literal/type.js";
const c = canvas.ctx;
export class PictureT extends Class {
    fields = {};
    methods = {};
    to_str() {
        return "Picture";
    }
    equal(other) {
        return other instanceof PictureT;
    }
}
export const pictureT = new PictureT();
export class Picture {
    w;
    h;
    kind = 840;
    x = 0;
    y = 0;
    objs = [];
    strokeStyle = color.black;
    drawn = false;
    constructor(w, h) {
        this.w = w;
        this.h = h;
    }
    to_str() {
        return `Picture ${this.w} ${this.h}`;
    }
    typeof() {
        return new FGType(pictureT);
    }
    segment(x1, y1, x2, y2) {
        this.objs.push({ x1, y1, x2, y2 });
        return this;
    }
    segments(segments) {
        this.objs.push(...segments);
        return this;
    }
    draw() {
        c.strokeStyle = this.strokeStyle;
        c.save();
        c.translate(this.x, this.y);
        c.strokeRect(0, 0, this.w, this.h);
        c.beginPath();
        for (let s of this.objs) {
            c.moveTo(s.x1, s.y1);
            c.lineTo(s.x2, s.y2);
        }
        c.strokeStyle = this.strokeStyle;
        c.stroke();
        c.restore();
    }
}
