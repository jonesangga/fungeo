// @jonesangga, 2025, MIT License.
//
// TODO: Add another case in map().
//       Think about should the size of pics for above() and beside() be the same?
       
// TEST: quartet(), cycle().

// NOTE: cw_* and ccw_* implementations are actually switched but since canvas use upside down coordinate system
//       that cancels out.

import { defaultCanvas as canvas } from "../ui/canvas.js"
import { color } from "../data/constant.js"
import { Kind, type GeoObj } from "../value.js"
import { Circle } from "../geo/circle.js"
import Ellipse from "../geo/ellipse.js"
import Rect from "../geo/rect.js"
import { Segment } from "../geo/segment.js"
// import { FGType, pictureT } from "../literal/type.js"

const c = canvas.ctx;

export default class Picture {
    kind: Kind.Picture = Kind.Picture;
    x: number = 0;
    y: number = 0;
    objs: GeoObj[] = [];
    strokeStyle: string = color.black;

    constructor( 
        public w: number,
        public h: number,
    ) {}

    to_str(): string {
        return `Picture ${this.w} ${this.h}`;
    }

    // typeof(): FGType {
        // return new FGType(pictureT);
    // }

    draw(): void {
        c.strokeStyle = this.strokeStyle;
        c.save();
        c.translate(this.x, this.y);
        c.strokeRect(0, 0, this.w, this.h);
        for (let obj of this.objs)
            obj.draw();
        c.restore();
    }

    map_to(target: Picture): void {
        let scaleX = target.w / this.w;
        let scaleY = target.h / this.h;
        for (let obj of this.objs) {
            switch (obj.kind) {
                case Kind.Segment: {
                    let t = this.#segment_scale(obj, scaleX, scaleY);
                    target.objs.push(t);
                    break;
                }
            }
        }
    }

    cw(): Picture {
        let pic = new Picture(this.w, this.h);

        for (let obj of this.objs) {
            switch (obj.kind) {
                case Kind.Circle: {
                    pic.objs.push( this.#circle_cw(obj) );
                    break;
                }
                case Kind.Segment: {
                    pic.objs.push( this.#segment_cw(obj) );
                    break;
                }
                case Kind.Rect: {
                    pic.objs.push( this.#rect_cw(obj) );
                    break;
                }
            }
        }
        return pic;
    }

    ccw(): Picture {
        let pic = new Picture(this.w, this.h);

        for (let obj of this.objs) {
            switch (obj.kind) {
                case Kind.Circle: {
                    pic.objs.push( this.#circle_ccw(obj) );
                    break;
                }
                case Kind.Segment: {
                    pic.objs.push( this.#segment_ccw(obj) );
                    break;
                }
                case Kind.Rect: {
                    pic.objs.push( this.#rect_ccw(obj) );
                    break;
                }
            }
        }
        return pic;
    }

    fliph(): Picture {
        let pic = new Picture(this.w, this.h);

        for (let obj of this.objs) {
            switch (obj.kind) {
                case Kind.Circle: {
                    pic.objs.push( this.#circle_fliph(obj) );
                    break;
                }
                case Kind.Segment: {
                    pic.objs.push( this.#segment_fliph(obj) );
                    break;
                }
                case Kind.Rect: {
                    pic.objs.push( this.#rect_fliph(obj) );
                    break;
                }
            }
        }
        return pic;
    }

    flipv(): Picture {
        let pic = new Picture(this.w, this.h);

        for (let obj of this.objs) {
            switch (obj.kind) {
                case Kind.Circle: {
                    pic.objs.push( this.#circle_flipv(obj) );
                    break;
                }
                case Kind.Segment: {
                    pic.objs.push( this.#segment_flipv(obj) );
                    break;
                }
                case Kind.Rect: {
                    pic.objs.push( this.#rect_flipv(obj) );
                    break;
                }
            }
        }
        return pic;
    }

    static above(rtop: number, rbottom: number, top: Picture, bottom: Picture): Picture {
        let pic = new Picture(top.w, top.h);
        let scale = rtop / (rtop + rbottom);

        for (let obj of top.objs) {
            switch (obj.kind) {
                case Kind.Circle: {
                    pic.objs.push( Picture.circle_top(scale, obj) );
                    break;
                }
                case Kind.Segment: {
                    pic.objs.push( Picture.segment_top(scale, obj) );
                    break;
                }
                case Kind.Rect: {
                    pic.objs.push( Picture.rect_top(scale, obj) );
                    break;
                }
            }
        }

        for (let obj of bottom.objs) {
            switch (obj.kind) {
                case Kind.Circle: {
                    pic.objs.push( Picture.circle_bottom(scale, bottom, obj) );
                    break;
                }
                case Kind.Segment: {
                    pic.objs.push( Picture.segment_bottom(scale, bottom, obj) );
                    break;
                }
                case Kind.Rect: {
                    pic.objs.push( Picture.rect_bottom(scale, bottom, obj) );
                    break;
                }
            }
        }
        return pic;
    }

    static beside(rleft: number, rright: number, left: Picture, right: Picture): Picture {
        let pic = new Picture(left.w, left.h);
        let scale = rleft / (rleft + rright);

        for (let obj of left.objs) {
            switch (obj.kind) {
                case Kind.Circle: {
                    pic.objs.push( Picture.circle_left(scale, obj) );
                    break;
                }
                case Kind.Segment: {
                    pic.objs.push( Picture.segment_left(scale, obj) );
                    break;
                }
                case Kind.Rect: {
                    pic.objs.push( Picture.rect_left(scale, obj) );
                    break;
                }
            }
        }

        for (let obj of right.objs) {
            switch (obj.kind) {
                case Kind.Circle: {
                    pic.objs.push( Picture.circle_right(scale, right, obj) );
                    break;
                }
                case Kind.Segment: {
                    pic.objs.push( Picture.segment_right(scale, right, obj) );
                    break;
                }
                case Kind.Rect: {
                    pic.objs.push( Picture.rect_right(scale, right, obj) );
                    break;
                }
            }
        }
        return pic;
    }

    static quartet(p: Picture, q: Picture, r: Picture, s: Picture): Picture {
        return Picture.above(1, 1, Picture.beside(1, 1, p, q), Picture.beside(1, 1, r, s));
    }

    static cycle(p: Picture): Picture {
        return Picture.quartet(p, p.cw(), p.ccw(), p.cw().cw());
    }

    #segment_scale(s: Segment, scaleX: number, scaleY: number): Segment {
        return new Segment(s.x1 * scaleX, s.y1 * scaleY, s.x2 *scaleX, s.y2 * scaleY, s.strokeStyle);
    }

    #segment_cw(s: Segment): Segment {
        let c = this.w / 2;
        let d = this.h / 2;
        let x1 = -s.y1 + c + d;
        let y1 =  s.x1 + c - d;
        let x2 = -s.y2 + c + d;
        let y2 =  s.x2 + c - d;
        return new Segment(x1, y1, x2, y2, s.strokeStyle);
    }

    #segment_ccw(s: Segment): Segment {
        let c = this.w / 2;
        let d = this.h / 2;
        let x1 =  s.y1 + c - d;
        let y1 = -s.x1 + c + d;
        let x2 =  s.y2 + c - d;
        let y2 = -s.x2 + c + d;
        return new Segment(x1, y1, x2, y2, s.strokeStyle);
    }

    #segment_fliph(s: Segment): Segment {
        let c = this.w / 2;
        let x1 = -s.x1 + 2*c;
        let x2 = -s.x2 + 2*c;
        return new Segment(x1, s.y1, x2, s.y2, s.strokeStyle);
    }

    #segment_flipv(s: Segment): Segment {
        let d = this.h / 2;
        let y1 = -s.y1 + 2*d;
        let y2 = -s.y2 + 2*d;
        return new Segment(s.x1, y1, s.x2, y2, s.strokeStyle);
    }

    static segment_top(scale: number, s: Segment): Segment {
        return new Segment(s.x1, s.y1 * scale, s.x2, s.y2 * scale, s.strokeStyle);
    }

    static segment_bottom(scale: number, p: Picture, s: Segment): Segment {
        let t = 1 - scale;
        return new Segment(s.x1, p.h * scale + s.y1 * t, s.x2, p.h * scale + s.y2 * t, s.strokeStyle);
    }

    static segment_left(scale: number, s: Segment): Segment {
        return new Segment(s.x1 * scale, s.y1, s.x2 * scale, s.y2, s.strokeStyle);
    }

    static segment_right(scale: number, p: Picture, s: Segment): Segment {
        let t = 1 - scale;
        return new Segment(p.w * scale + s.x1 * t, s.y1, p.w * scale + s.x2 * t, s.y2, s.strokeStyle);
    }

    #circle_cw(ci: Circle): Circle {
        let c = this.w / 2;
        let d = this.h / 2;
        let x = -ci.y + c + d;
        let y =  ci.x + c - d;
        return new Circle(x, y, ci.r, ci.strokeStyle, ci.fillStyle);
    }

    #circle_ccw(ci: Circle): Circle {
        let c = this.w / 2;
        let d = this.h / 2;
        let x =  ci.y + c - d;
        let y = -ci.x + c + d;
        return new Circle(x, y, ci.r, ci.strokeStyle, ci.fillStyle);
    }

    #circle_fliph(ci: Circle): Circle {
        let c = this.w / 2;
        let x = -ci.x + 2*c;
        return new Circle(x, ci.y, ci.r, ci.strokeStyle, ci.fillStyle);
    }

    #circle_flipv(ci: Circle): Circle {
        let d = this.h / 2;
        let y = -ci.y + 2*d;
        return new Circle(ci.x, y, ci.r, ci.strokeStyle, ci.fillStyle);
    }

    static circle_top(scale: number, ci: Circle): Ellipse {
        return new Ellipse(ci.x, ci.y * scale, ci.r, ci.r * scale, 0, ci.strokeStyle, ci.fillStyle);
    }

    static circle_bottom(scale: number, p: Picture, ci: Circle): Ellipse {
        let t = 1 - scale;
        return new Ellipse(ci.x, p.h * scale + ci.y * t, ci.r, ci.r * t, 0, ci.strokeStyle, ci.fillStyle);
    }

    static circle_left(scale: number, ci: Circle): Ellipse {
        return new Ellipse(ci.x * scale, ci.y, ci.r * scale, ci.r, 0, ci.strokeStyle, ci.fillStyle);
    }

    static circle_right(scale: number, p: Picture, ci: Circle): Ellipse {
        let t = 1 - scale;
        return new Ellipse(p.w * scale + ci.x * t, ci.y, ci.r * t, ci.r, 0, ci.strokeStyle, ci.fillStyle);
    }

    #rect_cw(r: Rect): Rect {
        let c = this.w / 2;
        let d = this.h / 2;
        let x1 = -r.y + c + d;
        let y1 =  r.x + c - d;
        let w = -r.h;
        let h = r.w;
        return new Rect(x1, y1, w, h, r.strokeStyle, r.fillStyle);
    }

    #rect_ccw(r: Rect): Rect {
        let c = this.w / 2;
        let d = this.h / 2;
        let x1 =  r.y + c - d;
        let y1 = -r.x + c + d;
        let w = r.h;
        let h = -r.w;
        return new Rect(x1, y1, w, h, r.strokeStyle, r.fillStyle);
    }

    #rect_fliph(r: Rect): Rect {
        let c = this.w / 2;
        let x1 = -r.x + 2*c;
        let w = -r.w;
        return new Rect(x1, r.y, w, r.h, r.strokeStyle, r.fillStyle);
    }

    #rect_flipv(r: Rect): Rect {
        let d = this.h / 2;
        let y1 = -r.y + 2*d;
        let h = -r.h;
        return new Rect(r.x, y1, r.w, h, r.strokeStyle, r.fillStyle);
    }

    static rect_top(scale: number, r: Rect): Rect {
        return new Rect(r.x, r.y * scale, r.w, r.h * scale, r.strokeStyle, r.fillStyle);
    }

    static rect_bottom(scale: number, p: Picture, r: Rect): Rect {
        let t = 1 - scale;
        return new Rect(r.x, p.h * scale + r.y * t, r.w, r.h * t, r.strokeStyle, r.fillStyle);
    }

    static rect_left(scale: number, r: Rect): Rect {
        return new Rect(r.x * scale, r.y, r.w * scale, r.h, r.strokeStyle, r.fillStyle);
    }

    static rect_right(scale: number, p: Picture, r: Rect): Rect {
        let t = 1 - scale;
        return new Rect(p.w * scale + r.x * t, r.y, r.w * t, r.h, r.strokeStyle, r.fillStyle);
    }
}
