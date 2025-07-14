import { defaultCanvas as canvas } from "../../ui/canvas.js"
import { color, TAU } from "../../data/constant.js"
import { FGCallNative } from "../../value.js"
import { Complex } from "../../core/complex.js"
import { type Type, Class, FGType } from "../../literal/type.js"

const c = canvas.ctx;

class Circle {
    strokeStyle: string = color.black;
    bend: number;

    constructor(public x: number,
                public y: number,
                public r: number)
    {
        this.bend = 1/r;
    }

    static bend(x: number, y: number, b: number): Circle {
        let c = new Circle(x, y, Math.abs(1/b));
        c.bend = b;
        return c;
    }

    draw(): void {
        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, TAU);
        c.strokeStyle = this.strokeStyle;
        c.stroke();
    }

    dist(other: Circle): number {
        return Math.sqrt((this.x - other.x)**2 + (this.y - other.y)**2);
    }
}

export class ApollonianT extends Class implements Type {
    fields:  Record<string, Type> = {};
    methods: Record<string, { type: Type, value: FGCallNative }> = {};
    statics: Record<string, { type: Type, value: FGCallNative }> = {};

    to_str(): string {
        return "Apollonian";
    }
    equal(other: Type): boolean {
        return other instanceof ApollonianT;
    }
}

export const apollonianT = new ApollonianT();

export class Apollonian {
    x = canvas.w / 2;
    y = canvas.h / 2;
    enclosing_r = 100;
    strokeStyle: string = color.black;
    currentlyDrawn = false;
    gasket: Circle[] = []
    queue: Circle[][] = []

    private constructor() {}

    static enclosing(r: number): Apollonian {
        const apol = new Apollonian();
        apol.enclosing_r = r;
        let c1 = Circle.bend(apol.x, apol.y, -1/r);
        let c2 = Circle.bend(apol.x - r/2, apol.y, 2/r);
        let c3 = Circle.bend(apol.x + r/2, apol.y, 2/r);
        apol.gasket.push(c1, c2, c3);
        apol.queue.push([c1, c2, c3]);
        return apol;
    }

    to_str(): string {
        return `Apollonian`;
    }

    typeof(): FGType {
        return new FGType(apollonianT);
    }

    draw(): void {
        c.beginPath();
        c.arc(this.x, this.y, this.enclosing_r, 0, TAU);
        c.strokeStyle = this.strokeStyle;
        c.stroke();

        for (const circle of this.gasket) {
            circle.draw();
        }
    }

    next(): Apollonian {
        const next: Circle[][] = [];
        for (const q of this.queue) {
            let c1 = q[0]
            let c2 = q[1]
            let c3 = q[2]
            let curvs = this.descartes(c1, c2, c3);
            let max = curvs[0] > curvs[1] ? curvs[0] : curvs[1];
            let cs = this.complex_descartes(c1, c2, c3, max);
            this.gasket.push(...cs)
            this.draw();
            for (const c of cs) {
                next.push([c1, c2, c])
                next.push([c1, c3, c])
                next.push([c2, c3, c])
            }
            console.log(curvs);
        }
        this.queue = next;
        return this;
    }

    descartes(c1: Circle, c2: Circle, c3: Circle): number[] {
        let k1 = c1.bend;
        let k2 = c2.bend;
        let k3 = c3.bend;

        let sum = k1 + k2 + k3;
        let root = 2 * Math.sqrt(k1*k2 + k2*k3 + k1*k3);

        return [sum + root, sum - root];
    }

    complex_descartes(c1: Circle, c2: Circle, c3: Circle, k4: number): Circle[] {
        let k1 = c1.bend;
        let k2 = c2.bend;
        let k3 = c3.bend;
        let z1 = new Complex(c1.x, c1.y);
        let z2 = new Complex(c2.x, c2.y);
        let z3 = new Complex(c3.x, c3.y);

        let zk1 = z1.scale(k1);
        let zk2 = z2.scale(k2);
        let zk3 = z3.scale(k3);
        let sum = zk1.add(zk2).add(zk3);

        let root = zk1.mul(zk2).add(zk2.mul(zk3)).add(zk1.mul(zk3));
        root = root.sqrt().scale(2);
        let center1 = sum.add(root).scale(1 / k4);
        let center2 = sum.sub(root).scale(1 / k4);

        let ca = Circle.bend(center1.re, center1.im, k4);
        let cb = Circle.bend(center2.re, center2.im, k4);

        let got: Circle[] = [];
        if (is_tangent(c1, c2, c3, ca))
            got.push(ca);
        if (is_tangent(c1, c2, c3, cb))
            got.push(cb);
        return got;
    }
}

let epsilon = 0.0000001;

function isTangent(c1: Circle, c2: Circle): boolean {
    let d = c1.dist(c2);
    let r1 = c1.r;
    let r2 = c2.r;
    // Tangency check based on distances and radii
    let a = Math.abs(d - (r1 + r2)) < epsilon;
    let b = Math.abs(d - Math.abs(r2 - r1)) < epsilon;
    return a || b;
}

// // Determine if two circles are tangent to each other
function is_tangent(c1: Circle, c2: Circle, c3: Circle, ca: Circle): boolean {
    return isTangent(ca, c1) && isTangent(ca, c2) && isTangent(ca, c3);
}
