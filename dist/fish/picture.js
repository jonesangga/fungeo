import { defaultCanvas as canvas } from "../ui/canvas.js";
import { color } from "../data/constant.js";
import { Segment } from "../geo/segment.js";
import { FGType } from "../literal/type.js";
const c = canvas.ctx;
export class PictureT {
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
            let t = this.#segment_scale(obj, scaleX, scaleY);
            target.objs.push(t);
        }
    }
    cw() {
        let pic = new Picture(this.w, this.h);
        for (let obj of this.objs) {
            pic.objs.push(this.#segment_cw(obj));
            break;
        }
        return pic;
    }
    ccw() {
        let pic = new Picture(this.w, this.h);
        for (let obj of this.objs) {
            pic.objs.push(this.#segment_ccw(obj));
        }
        return pic;
    }
    fliph() {
        let pic = new Picture(this.w, this.h);
        for (let obj of this.objs) {
            pic.objs.push(this.#segment_fliph(obj));
        }
        return pic;
    }
    flipv() {
        let pic = new Picture(this.w, this.h);
        for (let obj of this.objs) {
            pic.objs.push(this.#segment_flipv(obj));
        }
        return pic;
    }
    static above(rtop, rbottom, top, bottom) {
        let pic = new Picture(top.w, top.h);
        let scale = rtop / (rtop + rbottom);
        for (let obj of top.objs) {
            pic.objs.push(Picture.segment_top(scale, obj));
        }
        for (let obj of bottom.objs) {
            pic.objs.push(Picture.segment_bottom(scale, bottom, obj));
        }
        return pic;
    }
    static beside(rleft, rright, left, right) {
        let pic = new Picture(left.w, left.h);
        let scale = rleft / (rleft + rright);
        for (let obj of left.objs) {
            pic.objs.push(Picture.segment_left(scale, obj));
        }
        for (let obj of right.objs) {
            pic.objs.push(Picture.segment_right(scale, right, obj));
        }
        return pic;
    }
    static quartet(p, q, r, s) {
        return Picture.above(1, 1, Picture.beside(1, 1, p, q), Picture.beside(1, 1, r, s));
    }
    static cycle(p) {
        return Picture.quartet(p, p.cw(), p.ccw(), p.cw().cw());
    }
    #segment_scale(s, scaleX, scaleY) {
        return new Segment(s.x1 * scaleX, s.y1 * scaleY, s.x2 * scaleX, s.y2 * scaleY, s.strokeStyle);
    }
    #segment_cw(s) {
        let c = this.w / 2;
        let d = this.h / 2;
        let x1 = -s.y1 + c + d;
        let y1 = s.x1 + c - d;
        let x2 = -s.y2 + c + d;
        let y2 = s.x2 + c - d;
        return new Segment(x1, y1, x2, y2, s.strokeStyle);
    }
    #segment_ccw(s) {
        let c = this.w / 2;
        let d = this.h / 2;
        let x1 = s.y1 + c - d;
        let y1 = -s.x1 + c + d;
        let x2 = s.y2 + c - d;
        let y2 = -s.x2 + c + d;
        return new Segment(x1, y1, x2, y2, s.strokeStyle);
    }
    #segment_fliph(s) {
        let c = this.w / 2;
        let x1 = -s.x1 + 2 * c;
        let x2 = -s.x2 + 2 * c;
        return new Segment(x1, s.y1, x2, s.y2, s.strokeStyle);
    }
    #segment_flipv(s) {
        let d = this.h / 2;
        let y1 = -s.y1 + 2 * d;
        let y2 = -s.y2 + 2 * d;
        return new Segment(s.x1, y1, s.x2, y2, s.strokeStyle);
    }
    static segment_top(scale, s) {
        return new Segment(s.x1, s.y1 * scale, s.x2, s.y2 * scale, s.strokeStyle);
    }
    static segment_bottom(scale, p, s) {
        let t = 1 - scale;
        return new Segment(s.x1, p.h * scale + s.y1 * t, s.x2, p.h * scale + s.y2 * t, s.strokeStyle);
    }
    static segment_left(scale, s) {
        return new Segment(s.x1 * scale, s.y1, s.x2 * scale, s.y2, s.strokeStyle);
    }
    static segment_right(scale, p, s) {
        let t = 1 - scale;
        return new Segment(p.w * scale + s.x1 * t, s.y1, p.w * scale + s.x2 * t, s.y2, s.strokeStyle);
    }
}
