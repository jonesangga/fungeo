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
    rot() {
        let segments = this.segments.map(s => this.#segment_rot(s));
        return new Picture(this.w, this.h)
            .add_segments(segments);
    }
    #segment_rot(s) {
        let c = this.w / 2;
        let d = this.h / 2;
        let x1 = s.y1 + c - d;
        let y1 = -s.x1 + c + d;
        let x2 = s.y2 + c - d;
        let y2 = -s.x2 + c + d;
        return { x1, y1, x2, y2 };
    }
    static quartet(p, q, r, s) {
        return Picture.above(1, 1, Picture.beside(1, 1, p, q), Picture.beside(1, 1, r, s));
    }
    static cycle(p) {
        return Picture.quartet(p, p.rot().rot().rot(), p.rot(), p.rot().rot());
    }
    static above(rtop, rbottom, top, bottom) {
        let scale = rtop / (rtop + rbottom);
        let topSegments = top.segments.map(s => ({
            x1: s.x1,
            y1: s.y1 * scale,
            x2: s.x2,
            y2: s.y2 * scale
        }));
        let bottomSegments = bottom.segments.map(s => ({
            x1: s.x1,
            y1: bottom.h * scale + s.y1 * (1 - scale),
            x2: s.x2,
            y2: bottom.h * scale + s.y2 * (1 - scale)
        }));
        return new Picture(top.w, top.h)
            .add_segments(topSegments)
            .add_segments(bottomSegments);
    }
    static beside(rleft, rright, left, right) {
        let scale = rleft / (rleft + rright);
        let leftSegments = left.segments.map(s => ({
            x1: s.x1 * scale,
            y1: s.y1,
            x2: s.x2 * scale,
            y2: s.y2,
        }));
        let rightSegments = right.segments.map(s => ({
            x1: left.w * scale + s.x1 * (1 - scale),
            y1: s.y1,
            x2: left.w * scale + s.x2 * (1 - scale),
            y2: s.y2,
        }));
        return new Picture(left.w, right.h)
            .add_segments(leftSegments)
            .add_segments(rightSegments);
    }
}
