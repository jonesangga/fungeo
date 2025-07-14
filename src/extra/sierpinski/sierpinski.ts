import { defaultCanvas as canvas } from "../../ui/canvas.js"
import { color } from "../../data/constant.js"
import { FGCallNative } from "../../value.js"
import { type Type, ClassT, FGType } from "../../literal/type.js"

const c = canvas.ctx;

class Triangle {
    constructor(readonly x1: number,
                readonly y1: number,
                readonly x2: number,
                readonly y2: number,
                readonly x3: number,
                readonly y3: number,
                readonly strokeStyle: string = color.black) {}

    to_str(): string {
        return `Tri ${this.x1} ${this.y1} ${this.x2} ${this.y2} ${this.x3} ${this.y3}`;
    }

    draw(): void {
        c.beginPath();
        c.moveTo(this.x1, this.y1);
        c.lineTo(this.x2, this.y2);
        c.lineTo(this.x3, this.y3);
        c.closePath();
        c.strokeStyle = this.strokeStyle;
        c.stroke();
    }
}

export class SierpinskiT extends ClassT {
    fields:  Record<string, Type> = {};
    methods: Record<string, { type: Type, value: FGCallNative }> = {};
    statics: Record<string, { type: Type, value: FGCallNative }> = {};

    to_str(): string {
        return "Type Sierpinski";
    }

    equal(other: Type): boolean {
        return other instanceof SierpinskiT;
    }
}

export const sierpinskiT = new SierpinskiT();

export class Sierpinski {
    x = canvas.w / 2;
    y = canvas.h / 2;
    strokeStyle: string = color.black;
    currentlyDrawn = false;
    tris: Triangle[] = []
    queue: Triangle[] = []

    constructor(readonly x1: number,
                readonly y1: number,
                readonly x2: number,
                readonly y2: number,
                readonly x3: number,
                readonly y3: number)
    {
        this.tris.push(new Triangle(x1, y1, x2, y2, x3, y3));
        this.queue.push(new Triangle(x1, y1, x2, y2, x3, y3));
    }

    to_str(): string {
        return `Sierpinski`;
    }

    typeof(): FGType {
        return new FGType(sierpinskiT);
    }

    draw(): void {
        for (const tri of this.tris) {
            tri.draw();
        }
    }

    dist(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt( (x2-x1)**2 + (y2-y1)**2 );
    }

    next(): Sierpinski {
        console.log(this.tris.length);
        console.log(this.queue.length);
        const next: Triangle[] = [];
        for (const q of this.queue) {
            let ax = q.x1;
            let ay = q.y1;
            let bx = q.x2;
            let by = q.y2;
            let cx = q.x3;
            let cy = q.y3;

            let a = this.dist(bx, by, cx, cy);
            let b = this.dist(ax, ay, cx, cy);
            let c = this.dist(ax, ay, bx, by);
            let s = (a + b + c) / 2;
            let A = Math.sqrt( s*(s-a)*(s-b)*(s-c) );
            let ta = 2*A/a;
            let tb = 2*A/b;
            let tc = 2*A/c;
            let xa = Math.sqrt( b*b - ta*ta );
            let xb = Math.sqrt( a*a - tb*tb );
            let xc = Math.sqrt( a*a - tc*tc );
            let D = [ cx + xa*(bx-cx)/a, cy + xa*(by-cy)/a ];
            let E = [ cx + xb*(ax-cx)/b, cy + xb*(ay-cy)/b ];
            let F = [ bx + xc*(ax-bx)/c, by + xc*(ay-by)/c ];
            let t = new Triangle(D[0], D[1], E[0], E[1], F[0], F[1]);
            this.tris.push(t)
            t.draw();
            // this.draw();
            next.push(new Triangle(D[0], D[1], E[0], E[1], cx, cy));
            next.push(new Triangle(D[0], D[1], bx, by, F[0], F[1]));
            next.push(new Triangle(ax, ay, E[0], E[1], F[0], F[1]));
        }
        this.queue = next;
        return this;
    }
}
