// @jonesangga, 2025, MIT License.
//
// TODO: Think about should the size of pics for above() and beside() be the same?
//       Test this.
       
// NOTE: cw_* and ccw_* implementations are actually switched but since canvas use upside down coordinate system
//       that cancels out.

import { defaultCanvas as canvas } from "../ui/canvas.js"
import { color } from "../data/constant.js"
import { Kind, FGCallNative } from "../value.js"
import { type Type, Class, FGType } from "../literal/type.js"

const c = canvas.ctx;

export class PictureT extends Class implements Type {
    fields: Record<string, Type> = {};
    methods: Record<string, { type: Type, value: FGCallNative }> = {};

    to_str(): string {
        return "Picture";
    }
    equal(other: Type): boolean {
        return other instanceof PictureT;
    }
}

export const pictureT = new PictureT();

type Segment = {
    x1: number,
    y1: number,
    x2: number,
    y2: number,
}

export class Picture {
    kind: Kind.Picture = Kind.Picture;
    x: number = 0;
    y: number = 0;
    objs: Segment[] = [];
    strokeStyle: string = color.black;
    drawn = false;

    constructor( 
        public w: number,
        public h: number,
    ) {}

    to_str(): string {
        return `Picture ${this.w} ${this.h}`;
    }

    typeof(): FGType {
        return new FGType(pictureT);
    }

    segment(x1: number, y1: number, x2: number, y2: number): Picture {
        this.objs.push({x1, y1, x2, y2});
        return this;
    }

    segments(segments: Segment[]): Picture {
        this.objs.push(...segments);
        return this;
    }

    static resize(pic: Picture, w: number, h: number): Picture {
        let scaleX = w / pic.w;
        let scaleY = h / pic.h;
        let objs = [];
        for (let obj of pic.objs) {
            let t = {
                x1: obj.x1 * scaleX,
                y1: obj.y1 * scaleY,
                x2: obj.x2 * scaleX,
                y2: obj.y2 * scaleY,
            }
            objs.push(t);
        }
        return new Picture(w, h).segments(objs);
    }

    draw(): void {
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

    // map_to(target: Picture): void {
        // let scaleX = target.w / this.w;
        // let scaleY = target.h / this.h;
        // for (let obj of this.objs) {
            // let t = this.#segment_scale(obj, scaleX, scaleY);
            // target.objs.push(t);
        // }
    // }

    // cw(): Picture {
        // let pic = new Picture(this.w, this.h);

        // for (let obj of this.objs) {
            // pic.objs.push( this.#segment_cw(obj) );
            // break;
        // }
        // return pic;
    // }

    // ccw(): Picture {
        // let pic = new Picture(this.w, this.h);

        // for (let obj of this.objs) {
            // pic.objs.push( this.#segment_ccw(obj) );
        // }
        // return pic;
    // }

    // fliph(): Picture {
        // let pic = new Picture(this.w, this.h);

        // for (let obj of this.objs) {
            // pic.objs.push( this.#segment_fliph(obj) );
        // }
        // return pic;
    // }

    // flipv(): Picture {
        // let pic = new Picture(this.w, this.h);

        // for (let obj of this.objs) {
            // pic.objs.push( this.#segment_flipv(obj) );
        // }
        // return pic;
    // }

    // static above(rtop: number, rbottom: number, top: Picture, bottom: Picture): Picture {
        // let pic = new Picture(top.w, top.h);
        // let scale = rtop / (rtop + rbottom);

        // for (let obj of top.objs) {
            // pic.objs.push( Picture.segment_top(scale, obj) );
        // }

        // for (let obj of bottom.objs) {
            // pic.objs.push( Picture.segment_bottom(scale, bottom, obj) );
        // }
        // return pic;
    // }

    // static beside(rleft: number, rright: number, left: Picture, right: Picture): Picture {
        // let pic = new Picture(left.w, left.h);
        // let scale = rleft / (rleft + rright);

        // for (let obj of left.objs) {
            // pic.objs.push( Picture.segment_left(scale, obj) );
        // }

        // for (let obj of right.objs) {
            // pic.objs.push( Picture.segment_right(scale, right, obj) );
        // }
        // return pic;
    // }

    // static quartet(p: Picture, q: Picture, r: Picture, s: Picture): Picture {
        // return Picture.above(1, 1, Picture.beside(1, 1, p, q), Picture.beside(1, 1, r, s));
    // }

    // static cycle(p: Picture): Picture {
        // return Picture.quartet(p, p.cw(), p.ccw(), p.cw().cw());
    // }

    // #segment_scale(s: Segment, scaleX: number, scaleY: number): Segment {
        // return new Segment(s.x1 * scaleX, s.y1 * scaleY, s.x2 *scaleX, s.y2 * scaleY, s.strokeStyle);
    // }

    // #segment_cw(s: Segment): Segment {
        // let c = this.w / 2;
        // let d = this.h / 2;
        // let x1 = -s.y1 + c + d;
        // let y1 =  s.x1 + c - d;
        // let x2 = -s.y2 + c + d;
        // let y2 =  s.x2 + c - d;
        // return new Segment(x1, y1, x2, y2, s.strokeStyle);
    // }

    // #segment_ccw(s: Segment): Segment {
        // let c = this.w / 2;
        // let d = this.h / 2;
        // let x1 =  s.y1 + c - d;
        // let y1 = -s.x1 + c + d;
        // let x2 =  s.y2 + c - d;
        // let y2 = -s.x2 + c + d;
        // return new Segment(x1, y1, x2, y2, s.strokeStyle);
    // }

    // #segment_fliph(s: Segment): Segment {
        // let c = this.w / 2;
        // let x1 = -s.x1 + 2*c;
        // let x2 = -s.x2 + 2*c;
        // return new Segment(x1, s.y1, x2, s.y2, s.strokeStyle);
    // }

    // #segment_flipv(s: Segment): Segment {
        // let d = this.h / 2;
        // let y1 = -s.y1 + 2*d;
        // let y2 = -s.y2 + 2*d;
        // return new Segment(s.x1, y1, s.x2, y2, s.strokeStyle);
    // }

    // static segment_top(scale: number, s: Segment): Segment {
        // return new Segment(s.x1, s.y1 * scale, s.x2, s.y2 * scale, s.strokeStyle);
    // }

    // static segment_bottom(scale: number, p: Picture, s: Segment): Segment {
        // let t = 1 - scale;
        // return new Segment(s.x1, p.h * scale + s.y1 * t, s.x2, p.h * scale + s.y2 * t, s.strokeStyle);
    // }

    // static segment_left(scale: number, s: Segment): Segment {
        // return new Segment(s.x1 * scale, s.y1, s.x2 * scale, s.y2, s.strokeStyle);
    // }

    // static segment_right(scale: number, p: Picture, s: Segment): Segment {
        // let t = 1 - scale;
        // return new Segment(p.w * scale + s.x1 * t, s.y1, p.w * scale + s.x2 * t, s.y2, s.strokeStyle);
    // }
}
