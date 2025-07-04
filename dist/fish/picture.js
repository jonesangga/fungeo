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
    x = 0;
    y = 0;
    segments = [];
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
    place(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    add_segment(x1, y1, x2, y2) {
        this.segments.push({ x1, y1, x2, y2 });
        return this;
    }
    add_segments(segments) {
        this.segments.push(...segments);
        return this;
    }
    draw() {
        c.strokeStyle = this.strokeStyle;
        c.save();
        c.translate(this.x, this.y);
        c.beginPath();
        for (let s of this.segments) {
            c.moveTo(s.x1, s.y1);
            c.lineTo(s.x2, s.y2);
        }
        c.stroke();
        c.restore();
    }
    static resize(pic, w, h) {
        let scaleX = w / pic.w;
        let scaleY = h / pic.h;
        let segments = pic.segments.map(s => ({
            x1: s.x1 * scaleX,
            y1: s.y1 * scaleY,
            x2: s.x2 * scaleX,
            y2: s.y2 * scaleY,
        }));
        return new Picture(w, h).add_segments(segments);
    }
    static quartet(p, q, r, s) {
        return Picture.above(1, 1, Picture.beside(1, 1, p, q), Picture.beside(1, 1, r, s));
    }
    static above(rtop, rbottom, top, bottom) {
        let pic = new Picture(top.w, top.h);
        let scale = rtop / (rtop + rbottom);
        for (let obj of top.segments) {
            pic.segments.push(Picture.segment_top(scale, obj));
        }
        for (let obj of bottom.segments) {
            pic.segments.push(Picture.segment_bottom(scale, bottom, obj));
        }
        return pic;
    }
    static beside(rleft, rright, left, right) {
        let pic = new Picture(left.w, left.h);
        let scale = rleft / (rleft + rright);
        for (let obj of left.segments) {
            pic.segments.push(Picture.segment_left(scale, obj));
        }
        for (let obj of right.segments) {
            pic.segments.push(Picture.segment_right(scale, right, obj));
        }
        return pic;
    }
    static segment_top(scale, s) {
        return {
            x1: s.x1,
            y1: s.y1 * scale,
            x2: s.x2,
            y2: s.y2 * scale
        };
    }
    static segment_bottom(scale, p, s) {
        let t = 1 - scale;
        return {
            x1: s.x1,
            y1: p.h * scale + s.y1 * t,
            x2: s.x2,
            y2: p.h * scale + s.y2 * t
        };
    }
    static segment_left(scale, s) {
        return {
            x1: s.x1 * scale,
            y1: s.y1,
            x2: s.x2 * scale,
            y2: s.y2,
        };
    }
    static segment_right(scale, p, s) {
        let t = 1 - scale;
        return {
            x1: p.w * scale + s.x1 * t,
            y1: s.y1,
            x2: p.w * scale + s.x2 * t,
            y2: s.y2,
        };
    }
}
