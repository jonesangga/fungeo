import { defaultCanvas as canvas } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { FGNumber } from "../value.js";
import { Complex } from "../core/complex.js";
import { FGType, circleT } from "../literal/type.js";
import { Point } from "./point.js";
const c = canvas.ctx;
export class Circle {
    x;
    y;
    r;
    strokeStyle;
    fillStyle;
    kind = 700;
    bend;
    field = {};
    constructor(x, y, r, strokeStyle = color.black, fillStyle = color.nocolor) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
        this.field["x"] = new FGNumber(this.x);
        this.field["y"] = new FGNumber(this.y);
        this.field["r"] = new FGNumber(this.r);
    }
    static with_bend(x, y, bend) {
        let c = new Circle(x, y, Math.abs(1 / bend));
        c.bend = bend;
        return c;
    }
    to_str() {
        return `C ${this.x} ${this.y} ${this.r}`;
    }
    typeof() {
        return new FGType(circleT);
    }
    dist(other) {
        return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
    }
    draw() {
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
    intersect(other) {
        let x1 = this.x;
        let y1 = this.y;
        let r1 = this.r;
        let x2 = other.x;
        let y2 = other.y;
        let r2 = other.r;
        let dx = x1 - x2;
        let dy = y1 - y2;
        let R = Math.sqrt(dx * dx + dy * dy);
        if (!(Math.abs(r1 - r2) <= R && R <= r1 + r2))
            return [];
        let R2 = R * R;
        let R4 = R2 * R2;
        let a = (r1 * r1 - r2 * r2) / (2 * R2);
        let r2r2 = (r1 * r1 - r2 * r2);
        let c = Math.sqrt(2 * (r1 * r1 + r2 * r2) / R2 - (r2r2 * r2r2) / R4 - 1);
        let fx = (x1 + x2) / 2 + a * (x2 - x1);
        let gx = c * (y2 - y1) / 2;
        let ix1 = fx + gx;
        let ix2 = fx - gx;
        let fy = (y1 + y2) / 2 + a * (y2 - y1);
        let gy = c * (x1 - x2) / 2;
        let iy1 = fy + gy;
        let iy2 = fy - gy;
        return [new Point(ix1, iy1), new Point(ix2, iy2)];
    }
    static descartes(c1, c2, c3) {
        let k1 = c1.bend;
        let k2 = c2.bend;
        let k3 = c3.bend;
        let sum = k1 + k2 + k3;
        let root = 2 * Math.sqrt(k1 * k2 + k2 * k3 + k1 * k3);
        return [new FGNumber(sum + root), new FGNumber(sum - root)];
    }
    static complex_descartes(c1, c2, c3, k4) {
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
        let center1 = sum.add(root).scale(1 / k4.value);
        let center2 = sum.sub(root).scale(1 / k4.value);
        let ca = Circle.with_bend(center1.re, center1.im, k4.value);
        let cb = Circle.with_bend(center2.re, center2.im, k4.value);
        let got = [];
        if (is_tangent(c1, c2, c3, ca))
            got.push(ca);
        if (is_tangent(c1, c2, c3, cb))
            got.push(cb);
        return got;
    }
}
let epsilon = 0.0000001;
function isTangent(c1, c2) {
    let d = c1.dist(c2);
    let r1 = c1.r;
    let r2 = c2.r;
    let a = Math.abs(d - (r1 + r2)) < epsilon;
    let b = Math.abs(d - Math.abs(r2 - r1)) < epsilon;
    return a || b;
}
function is_tangent(c1, c2, c3, ca) {
    return isTangent(ca, c1) && isTangent(ca, c2) && isTangent(ca, c3);
}
