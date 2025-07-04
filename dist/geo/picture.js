import { defaultCanvas as canvas } from "../ui/canvas.js";
import { color } from "../data/constant.js";
import { Circle } from "../geo/circle.js";
import Ellipse from "../geo/ellipse.js";
import Rect from "../geo/rect.js";
import { Segment } from "../geo/segment.js";
const c = canvas.ctx;
export default class Picture {
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
    cw() {
        let pic = new Picture(this.w, this.h);
        for (let obj of this.objs) {
            switch (obj.kind) {
                case 700: {
                    pic.objs.push(this.#circle_cw(obj));
                    break;
                }
                case 1000: {
                    pic.objs.push(this.#segment_cw(obj));
                    break;
                }
                case 900: {
                    pic.objs.push(this.#rect_cw(obj));
                    break;
                }
            }
        }
        return pic;
    }
    ccw() {
        let pic = new Picture(this.w, this.h);
        for (let obj of this.objs) {
            switch (obj.kind) {
                case 700: {
                    pic.objs.push(this.#circle_ccw(obj));
                    break;
                }
                case 1000: {
                    pic.objs.push(this.#segment_ccw(obj));
                    break;
                }
                case 900: {
                    pic.objs.push(this.#rect_ccw(obj));
                    break;
                }
            }
        }
        return pic;
    }
    fliph() {
        let pic = new Picture(this.w, this.h);
        for (let obj of this.objs) {
            switch (obj.kind) {
                case 700: {
                    pic.objs.push(this.#circle_fliph(obj));
                    break;
                }
                case 1000: {
                    pic.objs.push(this.#segment_fliph(obj));
                    break;
                }
                case 900: {
                    pic.objs.push(this.#rect_fliph(obj));
                    break;
                }
            }
        }
        return pic;
    }
    flipv() {
        let pic = new Picture(this.w, this.h);
        for (let obj of this.objs) {
            switch (obj.kind) {
                case 700: {
                    pic.objs.push(this.#circle_flipv(obj));
                    break;
                }
                case 1000: {
                    pic.objs.push(this.#segment_flipv(obj));
                    break;
                }
                case 900: {
                    pic.objs.push(this.#rect_flipv(obj));
                    break;
                }
            }
        }
        return pic;
    }
    static above(rtop, rbottom, top, bottom) {
        let pic = new Picture(top.w, top.h);
        let scale = rtop / (rtop + rbottom);
        for (let obj of top.objs) {
            switch (obj.kind) {
                case 700: {
                    pic.objs.push(Picture.circle_top(scale, obj));
                    break;
                }
                case 1000: {
                    pic.objs.push(Picture.segment_top(scale, obj));
                    break;
                }
                case 900: {
                    pic.objs.push(Picture.rect_top(scale, obj));
                    break;
                }
            }
        }
        for (let obj of bottom.objs) {
            switch (obj.kind) {
                case 700: {
                    pic.objs.push(Picture.circle_bottom(scale, bottom, obj));
                    break;
                }
                case 1000: {
                    pic.objs.push(Picture.segment_bottom(scale, bottom, obj));
                    break;
                }
                case 900: {
                    pic.objs.push(Picture.rect_bottom(scale, bottom, obj));
                    break;
                }
            }
        }
        return pic;
    }
    static beside(rleft, rright, left, right) {
        let pic = new Picture(left.w, left.h);
        let scale = rleft / (rleft + rright);
        for (let obj of left.objs) {
            switch (obj.kind) {
                case 700: {
                    pic.objs.push(Picture.circle_left(scale, obj));
                    break;
                }
                case 1000: {
                    pic.objs.push(Picture.segment_left(scale, obj));
                    break;
                }
                case 900: {
                    pic.objs.push(Picture.rect_left(scale, obj));
                    break;
                }
            }
        }
        for (let obj of right.objs) {
            switch (obj.kind) {
                case 700: {
                    pic.objs.push(Picture.circle_right(scale, right, obj));
                    break;
                }
                case 1000: {
                    pic.objs.push(Picture.segment_right(scale, right, obj));
                    break;
                }
                case 900: {
                    pic.objs.push(Picture.rect_right(scale, right, obj));
                    break;
                }
            }
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
    #circle_cw(ci) {
        let c = this.w / 2;
        let d = this.h / 2;
        let x = -ci.y + c + d;
        let y = ci.x + c - d;
        return new Circle(x, y, ci.r, ci.strokeStyle, ci.fillStyle);
    }
    #circle_ccw(ci) {
        let c = this.w / 2;
        let d = this.h / 2;
        let x = ci.y + c - d;
        let y = -ci.x + c + d;
        return new Circle(x, y, ci.r, ci.strokeStyle, ci.fillStyle);
    }
    #circle_fliph(ci) {
        let c = this.w / 2;
        let x = -ci.x + 2 * c;
        return new Circle(x, ci.y, ci.r, ci.strokeStyle, ci.fillStyle);
    }
    #circle_flipv(ci) {
        let d = this.h / 2;
        let y = -ci.y + 2 * d;
        return new Circle(ci.x, y, ci.r, ci.strokeStyle, ci.fillStyle);
    }
    static circle_top(scale, ci) {
        return new Ellipse(ci.x, ci.y * scale, ci.r, ci.r * scale, 0, ci.strokeStyle, ci.fillStyle);
    }
    static circle_bottom(scale, p, ci) {
        let t = 1 - scale;
        return new Ellipse(ci.x, p.h * scale + ci.y * t, ci.r, ci.r * t, 0, ci.strokeStyle, ci.fillStyle);
    }
    static circle_left(scale, ci) {
        return new Ellipse(ci.x * scale, ci.y, ci.r * scale, ci.r, 0, ci.strokeStyle, ci.fillStyle);
    }
    static circle_right(scale, p, ci) {
        let t = 1 - scale;
        return new Ellipse(p.w * scale + ci.x * t, ci.y, ci.r * t, ci.r, 0, ci.strokeStyle, ci.fillStyle);
    }
    #rect_cw(r) {
        let c = this.w / 2;
        let d = this.h / 2;
        let x1 = -r.y + c + d;
        let y1 = r.x + c - d;
        let w = -r.h;
        let h = r.w;
        return new Rect(x1, y1, w, h, r.strokeStyle, r.fillStyle);
    }
    #rect_ccw(r) {
        let c = this.w / 2;
        let d = this.h / 2;
        let x1 = r.y + c - d;
        let y1 = -r.x + c + d;
        let w = r.h;
        let h = -r.w;
        return new Rect(x1, y1, w, h, r.strokeStyle, r.fillStyle);
    }
    #rect_fliph(r) {
        let c = this.w / 2;
        let x1 = -r.x + 2 * c;
        let w = -r.w;
        return new Rect(x1, r.y, w, r.h, r.strokeStyle, r.fillStyle);
    }
    #rect_flipv(r) {
        let d = this.h / 2;
        let y1 = -r.y + 2 * d;
        let h = -r.h;
        return new Rect(r.x, y1, r.w, h, r.strokeStyle, r.fillStyle);
    }
    static rect_top(scale, r) {
        return new Rect(r.x, r.y * scale, r.w, r.h * scale, r.strokeStyle, r.fillStyle);
    }
    static rect_bottom(scale, p, r) {
        let t = 1 - scale;
        return new Rect(r.x, p.h * scale + r.y * t, r.w, r.h * t, r.strokeStyle, r.fillStyle);
    }
    static rect_left(scale, r) {
        return new Rect(r.x * scale, r.y, r.w * scale, r.h, r.strokeStyle, r.fillStyle);
    }
    static rect_right(scale, p, r) {
        let t = 1 - scale;
        return new Rect(p.w * scale + r.x * t, r.y, r.w * t, r.h, r.strokeStyle, r.fillStyle);
    }
}
