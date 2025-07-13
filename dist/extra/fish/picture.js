import { defaultCanvas } from "../../ui/canvas.js";
import { color } from "../../data/constant.js";
import { Class, FGType } from "../../literal/type.js";
const c = defaultCanvas.ctx;
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
    currentlyDrawn = false;
    frameIncluded = true;
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
    with_frame() {
        this.frameIncluded = true;
        return this;
    }
    no_frame() {
        this.frameIncluded = false;
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
        if (this.frameIncluded) {
            c.strokeRect(0, 0, this.w, this.h);
        }
        c.beginPath();
        for (const s of this.segments) {
            c.moveTo(s.x1, s.y1);
            c.lineTo(s.x2, s.y2);
        }
        c.stroke();
        c.restore();
    }
    static resize(pic, w, h) {
        const scaleX = w / pic.w;
        const scaleY = h / pic.h;
        const segments = pic.segments.map(s => ({
            x1: s.x1 * scaleX,
            y1: s.y1 * scaleY,
            x2: s.x2 * scaleX,
            y2: s.y2 * scaleY,
        }));
        return new Picture(w, h).add_segments(segments);
    }
    static flipH(pic) {
        const segments = pic.segments.map(s => ({
            x1: -s.x1 + pic.w,
            y1: s.y1,
            x2: -s.x2 + pic.w,
            y2: s.y2,
        }));
        return new Picture(pic.w, pic.h).add_segments(segments);
    }
    static flipV(pic) {
        const segments = pic.segments.map(s => ({
            x1: s.x1,
            y1: -s.y1 + pic.h,
            x2: s.x2,
            y2: -s.y2 + pic.h,
        }));
        return new Picture(pic.w, pic.h).add_segments(segments);
    }
    static cw(pic) {
        const c = pic.w / 2;
        const d = pic.h / 2;
        const segments = pic.segments.map(s => ({
            x1: -s.y1 + c + d,
            y1: s.x1 + c - d,
            x2: -s.y2 + c + d,
            y2: s.x2 + c - d,
        }));
        return new Picture(pic.w, pic.h)
            .add_segments(segments);
    }
    static ccw(pic) {
        const c = pic.w / 2;
        const d = pic.h / 2;
        const segments = pic.segments.map(s => ({
            x1: s.y1 + c - d,
            y1: -s.x1 + c + d,
            x2: s.y2 + c - d,
            y2: -s.x2 + c + d,
        }));
        return new Picture(pic.w, pic.h)
            .add_segments(segments);
    }
    static quartet(p, q, r, s) {
        return Picture.above(1, 1, Picture.beside(1, 1, p, q), Picture.beside(1, 1, r, s));
    }
    static cycle(p) {
        const rot = Picture.ccw(p);
        const rot2 = Picture.ccw(rot);
        const rot3 = Picture.ccw(rot2);
        return Picture.quartet(p, rot3, rot, rot2);
    }
    static above(rtop, rbottom, top, bottom) {
        const scale = rtop / (rtop + rbottom);
        const topSegments = top.segments.map(s => ({
            x1: s.x1,
            y1: s.y1 * scale,
            x2: s.x2,
            y2: s.y2 * scale
        }));
        const bottomSegments = bottom.segments.map(s => ({
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
        const scale = rleft / (rleft + rright);
        const leftSegments = left.segments.map(s => ({
            x1: s.x1 * scale,
            y1: s.y1,
            x2: s.x2 * scale,
            y2: s.y2,
        }));
        const rightSegments = right.segments.map(s => ({
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
