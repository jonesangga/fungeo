import { defaultCanvas as canvas } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { FGCallNative } from "../value.js"
import { type Type, Class, FGType } from "../literal/type.js"

const c = canvas.ctx;
const w = canvas.w;
const h = canvas.h;

class Circle {
    strokeStyle: string = color.black;

    constructor(public x: number,
                public y: number,
                public r: number) {}

    draw(): void {
        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, TAU);
        c.strokeStyle = this.strokeStyle;
        c.stroke();
    }
}

export class ApollonianT extends Class implements Type {
    fields: Record<string, Type> = {};
    methods: Record<string, { type: Type, value: FGCallNative }> = {};

    to_str(): string {
        return "Apollonian";
    }
    equal(other: Type): boolean {
        return other instanceof ApollonianT;
    }
}

export const apollonianT = new ApollonianT();

export class Apollonian {
    x = w / 2;
    y = h / 2;
    enclosing_r = 100;
    strokeStyle: string = color.black;
    currentlyDrawn = false;
    gasket: Circle[] = []

    static enclosing(r: number): Apollonian {
        const apol = new Apollonian();
        apol.enclosing_r = r;
        apol.gasket.push(new Circle(apol.x, apol.y, r))
        apol.gasket.push(new Circle(apol.x - r/2, apol.y, r/2))
        apol.gasket.push(new Circle(apol.x + r/2, apol.y, r/2))
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

    // static descartes(c1: Circle, c2: Circle, c3: Circle): FGNumber[] {
        // let k1 = c1.bend as number;
        // let k2 = c2.bend as number;
        // let k3 = c3.bend as number;

        // let sum = k1 + k2 + k3;
        // let root = 2 * Math.sqrt(k1*k2 + k2*k3 + k1*k3);

        // return [new FGNumber(sum + root), new FGNumber(sum - root)];
    // }

    // static complex_descartes(c1: Circle, c2: Circle, c3: Circle, k4: FGNumber): Circle[] {
        // let k1 = c1.bend as number;
        // let k2 = c2.bend as number;
        // let k3 = c3.bend as number;
        // let z1 = new FGComplex(c1.x, c1.y);
        // let z2 = new FGComplex(c2.x, c2.y);
        // let z3 = new FGComplex(c3.x, c3.y);

        // let zk1 = z1.scale(k1);
        // let zk2 = z2.scale(k2);
        // let zk3 = z3.scale(k3);
        // let sum = zk1.add(zk2).add(zk3);

        // let root = zk1.mul(zk2).add(zk2.mul(zk3)).add(zk1.mul(zk3));
        // root = root.sqrt().scale(2);
        // let center1 = sum.add(root).scale(1 / k4.value);
        // let center2 = sum.sub(root).scale(1 / k4.value);

        // let ca = Circle.with_bend(center1.a, center1.b, k4.value);
        // let cb = Circle.with_bend(center2.a, center2.b, k4.value);

        // let got: Circle[] = [];
        // if (is_tangent(c1, c2, c3, ca))
            // got.push(ca);
        // if (is_tangent(c1, c2, c3, cb))
            // got.push(cb);
        // return got;
    // }
}

// let epsilon = 0.0000001;

// function isTangent(c1: Circle, c2: Circle): boolean {
    // let d = c1.dist(c2);
    // let r1 = c1.r;
    // let r2 = c2.r;
    // // Tangency check based on distances and radii
    // let a = Math.abs(d - (r1 + r2)) < epsilon;
    // let b = Math.abs(d - Math.abs(r2 - r1)) < epsilon;
    // return a || b;
// }

// // Determine if two circles are tangent to each other
// function is_tangent(c1: Circle, c2: Circle, c3: Circle, ca: Circle): boolean {
    // return isTangent(ca, c1) && isTangent(ca, c2) && isTangent(ca, c3);
// }
