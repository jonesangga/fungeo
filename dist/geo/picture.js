import { c } from "../ui/canvas.js";
import { color } from "../data/constant.js";
import Segment from "../geo/segment.js";
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
    map_to(target) {
        let scaleX = target.w / this.w;
        let scaleY = target.h / this.h;
        for (let obj of this.objs) {
            switch (obj.kind) {
                case 1000: {
                    let t = this.#segment_scale(obj, scaleX, scaleY);
                    target.objs.push(t);
                    break;
                }
            }
        }
    }
    #segment_scale(s, scaleX, scaleY) {
        return new Segment(s.x1 * scaleX, s.y1 * scaleY, s.x2 * scaleX, s.y2 * scaleY, s.strokeStyle);
    }
}
