// TODO: Think about should the size of pics for above() and beside() be the same?
//       Test this.
//
// NOTE: cw and ccw implementations are actually switched but since canvas use upside down coordinate system
//       that cancels out.

import { defaultCanvas } from "../../ui/canvas.js"
import { color } from "../../data/constant.js"
import { FGCallNative } from "../../value.js"
import { type Type, Class, FGType } from "../../literal/type.js"

const c = defaultCanvas.ctx;

export class PictureT extends Class implements Type {
    fields:  Record<string, Type> = {};
    methods: Record<string, { type: Type, value: FGCallNative }> = {};
    statics: Record<string, { type: Type, value: FGCallNative }> = {};

    to_str(): string {
        return "Type Picture";
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

// TODO: Think how to reset 'currentlyDrawn' after clear().
export class Picture {
    x: number = 0;
    y: number = 0;
    segments: Segment[] = [];
    strokeStyle: string = color.black;
    currentlyDrawn = false;
    frameIncluded = true;

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

    with_frame(): Picture {
        this.frameIncluded = true;
        return this;
    }

    no_frame(): Picture {
        this.frameIncluded = false;
        return this;
    }

    add_segment(x1: number, y1: number, x2: number, y2: number): Picture {
        this.segments.push({x1, y1, x2, y2});
        return this;
    }

    // TODO: Think if this is necessary. Why not push directly?
    //       This is usefull for user. Make it static.
    add_segments(segments: Segment[]): Picture {
        this.segments.push(...segments);
        return this;
    }

    draw(): void {
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

    // TODO: Make mutable version.
    static resize(pic: Picture, w: number, h: number): Picture {
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

    // TODO: Make mutable version.
    static flipH(pic: Picture): Picture {
        const segments = pic.segments.map(s => ({
            x1: -s.x1 + pic.w,
            y1:  s.y1,
            x2: -s.x2 + pic.w,
            y2:  s.y2,
        }));
        return new Picture(pic.w, pic.h).add_segments(segments);
    }

    // TODO: Make mutable version.
    static flipV(pic: Picture): Picture {
        const segments = pic.segments.map(s => ({
            x1:  s.x1,
            y1: -s.y1 + pic.h,
            x2:  s.x2,
            y2: -s.y2 + pic.h,
        }));
        return new Picture(pic.w, pic.h).add_segments(segments);
    }

    // Rotate clockwise (cw).
    // NOTE: Only correct for square picture, because it will rotate the whole picture instead of elements inside it.
    // TODO: Make the mutable equivalent.
    static cw(pic: Picture): Picture {
        const c = pic.w / 2;
        const d = pic.h / 2;
        const segments = pic.segments.map(s => ({
            x1: -s.y1 + c + d,
            y1:  s.x1 + c - d,
            x2: -s.y2 + c + d,
            y2:  s.x2 + c - d,
        }));
        return new Picture(pic.w, pic.h)
                   .add_segments(segments);
    }

    // Rotate counter clockwise (ccw).
    // NOTE: Only correct for square picture, because it will rotate the whole picture instead of elements inside it.
    // TODO: Make the mutable equivalent.
    static ccw(pic: Picture): Picture {
        const c = pic.w / 2;
        const d = pic.h / 2;
        const segments = pic.segments.map(s => ({
            x1:  s.y1 + c - d,
            y1: -s.x1 + c + d,
            x2:  s.y2 + c - d,
            y2: -s.x2 + c + d,
        }));
        return new Picture(pic.w, pic.h)
                   .add_segments(segments);
    }

    // Assuming all pictures have same width and height.
    static quartet(p: Picture, q: Picture, r: Picture, s: Picture): Picture {
        return Picture.above(1,
                             1,
                             Picture.beside(1, 1, p, q),
                             Picture.beside(1, 1, r, s));
    }

    // Assuming all pictures have same width and height.
    static cycle(p: Picture): Picture {
        const rot = Picture.ccw(p)
        const rot2 = Picture.ccw(rot)
        const rot3 = Picture.ccw(rot2)
        return Picture.quartet(p, rot3, rot, rot2)
    }

    // This is under assumption that top and bottom pictures have the same width and height.
    // TODO: Think again.
    static above(rtop: number, rbottom: number, top: Picture, bottom: Picture): Picture {
        const scale = rtop / (rtop + rbottom);

        const topSegments = top.segments.map(s => ({
            x1: s.x1,
            y1: s.y1 * scale,
            x2: s.x2,
            y2: s.y2 * scale
        }));

        const bottomSegments = bottom.segments.map(s => ({
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
        const scale = rleft / (rleft + rright);

        const leftSegments = left.segments.map(s => ({
            x1: s.x1 * scale,
            y1: s.y1,
            x2: s.x2 * scale,
            y2: s.y2,
        }));

        const rightSegments = right.segments.map(s => ({
            x1: left.w * scale + s.x1 * (1-scale),
            y1: s.y1,
            x2: left.w * scale + s.x2 * (1-scale),
            y2: s.y2,
        }));

        return new Picture(left.w, right.h)
                   .add_segments(leftSegments)
                   .add_segments(rightSegments);
    }
}
