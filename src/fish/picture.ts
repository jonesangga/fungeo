// @jonesangga, 2025, MIT License.
//
// TODO: Think about should the size of pics for above() and beside() be the same?
//       Test this.
       
// NOTE: cw_* and ccw_* implementations are actually switched but since canvas use upside down coordinate system
//       that cancels out.

import { defaultCanvas as canvas } from "../ui/canvas.js"
import { color } from "../data/constant.js"
import { FGCallNative } from "../value.js"
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

// TODO: Think how to reset 'drawn' after clear().
export class Picture {
    x: number = 0;
    y: number = 0;
    segments: Segment[] = [];
    strokeStyle: string = color.black;
    drawn = false;

    constructor(public w: number,
                public h: number) {}

    to_str(): string {
        return `Picture ${this.w} ${this.h}`;
    }

    typeof(): FGType {
        return new FGType(pictureT);
    }

    place(x: number, y: number): Picture {
        this.x = x;
        this.y = y;
        return this;
    }

    add_segment(x1: number, y1: number, x2: number, y2: number): Picture {
        this.segments.push({x1, y1, x2, y2});
        return this;
    }

    // TODO: Think if this is necessary. Why not push directly?
    add_segments(segments: Segment[]): Picture {
        this.segments.push(...segments);
        return this;
    }

    // TODO: Think should we draw the bounding rect?
    draw(): void {
        c.strokeStyle = this.strokeStyle;
        c.save();
        c.translate(this.x, this.y);
        // c.strokeRect(0, 0, this.w, this.h);
        c.beginPath();
        for (let s of this.segments) {
            c.moveTo(s.x1, s.y1);
            c.lineTo(s.x2, s.y2);
        }
        c.stroke();
        c.restore();
    }

    static resize(pic: Picture, w: number, h: number): Picture {
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

    rot(): Picture {
        let segments = this.segments.map(s => this.#segment_rot(s));
        return new Picture(this.w, this.h)
                   .add_segments(segments);
    }

    // NOTE: This is only correct for square picture, because this will rotate the whole picture
    // instead of rotating elements inside it.
    #segment_rot(s: Segment): Segment {
        let c = this.w / 2;
        let d = this.h / 2;
        let x1 =  s.y1 + c - d;
        let y1 = -s.x1 + c + d;
        let x2 =  s.y2 + c - d;
        let y2 = -s.x2 + c + d;
        return {x1, y1, x2, y2};
    }

    // Assuming all pictures have same width and height.
    static quartet(p: Picture, q: Picture, r: Picture, s: Picture): Picture {
        return Picture.above(1,
                             1,
                             Picture.beside(1, 1, p, q),
                             Picture.beside(1, 1, r, s));
    }

    static cycle(p: Picture): Picture {
        return Picture.quartet(p,
                               p.rot().rot().rot(),
                               p.rot(),
                               p.rot().rot());
    }

    // This is under assumption that top and bottom pictures have the same width and height.
    // TODO: Think again.
    static above(rtop: number, rbottom: number, top: Picture, bottom: Picture): Picture {
        let scale = rtop / (rtop + rbottom);

        let topSegments = top.segments.map(s => ({
            x1: s.x1,
            y1: s.y1 * scale,
            x2: s.x2,
            y2: s.y2 * scale
        }));

        let bottomSegments = bottom.segments.map(s => ({
            x1: s.x1,
            y1: bottom.h * scale + s.y1 * (1-scale),
            x2: s.x2,
            y2: bottom.h * scale + s.y2 * (1-scale)
        }));

        return new Picture(top.w, top.h)
                   .add_segments(topSegments)
                   .add_segments(bottomSegments);
    }

    // This is under assumption that left and right pictures have the same width and height.
    // TODO: Think again.
    static beside(rleft: number, rright: number, left: Picture, right: Picture): Picture {
        let scale = rleft / (rleft + rright);

        let leftSegments = left.segments.map(s => ({
            x1: s.x1 * scale,
            y1: s.y1,
            x2: s.x2 * scale,
            y2: s.y2,
        }));

        let rightSegments = right.segments.map(s => ({
            x1: left.w * scale + s.x1 * (1-scale),
            y1: s.y1,
            x2: left.w * scale + s.x2 * (1-scale),
            y2: s.y2,
        }));

        return new Picture(left.w, right.h)
                   .add_segments(leftSegments)
                   .add_segments(rightSegments);
    }

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
}
