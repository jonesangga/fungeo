// @jonesangga, 2025, MIT License.

import { c } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { Value, Kind, FGNumber, FGComplex } from "../value.js"
import { FGType, circleT, numberT } from "../literal/type.js"
import { Point, RichPoint } from "./point.js"

export class Circle {
    kind: Kind.Circle = Kind.Circle;
    bend?: number;
    field: Record<string, Value> = {};

    constructor( 
        public x: number,
        public y: number,
        public r: number,
        public strokeStyle: string = color.black,
        public fillStyle: string = color.nocolor
    ) {
        this.field["x"] = new FGNumber(this.x);
        this.field["y"] = new FGNumber(this.y);
        this.field["r"] = new FGNumber(this.r);
    }

    static with_bend(x: number, y: number, bend: number): Circle {
        let c = new Circle(x, y, Math.abs(1/bend));
        c.bend = bend;
        return c;
    }

    to_str(): string {
        return `C ${this.x} ${this.y} ${this.r}`;
    }

    typeof(): FGType {
        return new FGType(circleT);
    }

    dist(other: Circle): number {
        return Math.sqrt((this.x - other.x)**2 + (this.y - other.y)**2);
    }

    draw(): void {
        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, TAU);
        if (this.fillStyle !== "") {
            c.fillStyle = this.fillStyle;
            c.fill();
        }
        if (this.strokeStyle !== "") {
            c.strokeStyle = this.strokeStyle;
            c.stroke();
        }
    }

    // TODO: simplify this.
    intersect(other: Circle): Point[] {
        let x1 = this.x
        let y1 = this.y
        let r1 = this.r
        let x2 = other.x
        let y2 = other.y
        let r2 = other.r

        let dx = x1 - x2;
        let dy = y1 - y2;
        let R = Math.sqrt(dx * dx + dy * dy);
        if (!(Math.abs(r1 - r2) <= R && R <= r1 + r2))
            return [];

        let R2 = R * R;
        let R4 = R2 * R2;
        let a = (r1*r1 - r2*r2) / (2*R2);
        let r2r2 = (r1*r1 - r2*r2);
        let c = Math.sqrt(2 * (r1*r1 + r2*r2) / R2 - (r2r2 * r2r2) / R4 - 1);

        let fx = (x1+x2) / 2 + a * (x2-x1);
        let gx = c * (y2-y1) / 2;
        let ix1 = fx + gx;
        let ix2 = fx - gx;

        let fy = (y1+y2) / 2 + a * (y2-y1);
        let gy = c * (x1-x2) / 2;
        let iy1 = fy + gy;
        let iy2 = fy - gy;

        return [new Point(ix1, iy1), new Point(ix2, iy2)];
    }

    static descartes(c1: Circle, c2: Circle, c3: Circle): FGNumber[] {
        let k1 = c1.bend as number;
        let k2 = c2.bend as number;
        let k3 = c3.bend as number;

        let sum = k1 + k2 + k3;
        let root = 2 * Math.sqrt(k1*k2 + k2*k3 + k1*k3);

        return [new FGNumber(sum + root), new FGNumber(sum - root)];
    }

    static complex_descartes(c1: Circle, c2: Circle, c3: Circle, k4: FGNumber): Circle[] {
        let k1 = c1.bend as number;
        let k2 = c2.bend as number;
        let k3 = c3.bend as number;
        let z1 = new FGComplex(c1.x, c1.y);
        let z2 = new FGComplex(c2.x, c2.y);
        let z3 = new FGComplex(c3.x, c3.y);

        let zk1 = z1.scale(k1);
        let zk2 = z2.scale(k2);
        let zk3 = z3.scale(k3);
        let sum = zk1.add(zk2).add(zk3);

        let root = zk1.mul(zk2).add(zk2.mul(zk3)).add(zk1.mul(zk3));
        root = root.sqrt().scale(2);
        let center1 = sum.add(root).scale(1 / k4.value);
        let center2 = sum.sub(root).scale(1 / k4.value);

        let ca = Circle.with_bend(center1.a, center1.b, k4.value);
        let cb = Circle.with_bend(center2.a, center2.b, k4.value);

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

// Determine if two circles are tangent to each other
function is_tangent(c1: Circle, c2: Circle, c3: Circle, ca: Circle): boolean {
    return isTangent(ca, c1) && isTangent(ca, c2) && isTangent(ca, c3);
}

let cos_ = Math.cos(Math.PI * 5/4);
let sin_ = Math.sin(Math.PI * 5/4);

export class RichCircle {
    kind: Kind.RichCircle = Kind.RichCircle;
    r: number;
    field: Record<string, Value> = {};

    constructor(
        public p: RichPoint,
        public q: RichPoint,
        public label: string = "",
        public strokeStyle: string = color.black,
        public fillStyle: string = color.nocolor
    ) {
        this.r = Math.sqrt((p.x - q.x)**2 + (p.y - q.y)**2);
        this.field["p"] = this.p;
        this.field["q"] = this.q;
    }

    radius(): number {
        return Math.sqrt((this.p.x - this.q.x)**2 + (this.p.y - this.q.y)**2);
    }

    to_str(): string {
        return `C ${ this.p.to_str() } ${ this.q.to_str() }`;
    }

    typeof(): FGType {
        return new FGType(circleT);
    }

    draw(): void {
        c.beginPath();
        this.r = this.radius();
        c.arc(this.p.x, this.p.y, this.r, 0, TAU);
        if (this.fillStyle !== "") {
            c.fillStyle = this.fillStyle;
            c.fill();
        }
        if (this.strokeStyle !== "") {
            c.strokeStyle = this.strokeStyle;
            c.stroke();
        }
        this.p.draw();
        this.q.draw();
    }

    draw_label(): void {
        this.p.draw_label();
        this.q.draw_label();
        c.fillStyle = this.strokeStyle;
        c.textBaseline = "top";
        c.font = "16px monospace"
        let x = this.p.x + this.r * cos_;
        let y = this.p.y + this.r * sin_;
        c.fillText(this.label, x + 0, y + 0);
    }
}
