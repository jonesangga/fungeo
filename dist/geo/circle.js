import { c } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { FGNumber, FGComplex } from "../value.js";
import { FGType, circleT } from "../literal/type.js";
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
export class RichCircle {
    p;
    q;
    label;
    strokeStyle;
    fillStyle;
    kind = 905;
    r;
    field = {};
    constructor(p, q, label = "", strokeStyle = color.black, fillStyle = color.nocolor) {
        this.p = p;
        this.q = q;
        this.label = label;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
        this.r = Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
        this.field["p"] = this.p;
        this.field["q"] = this.q;
    }
    to_str() {
        return `C ${this.p.to_str()} ${this.q.to_str()}`;
    }
    typeof() {
        return new FGType(circleT);
    }
    draw() {
        c.beginPath();
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
    draw_label() {
        this.p.draw_label();
        this.q.draw_label();
        c.fillStyle = this.strokeStyle;
        c.textBaseline = "top";
        c.font = "16px monospace";
        let x = this.p.x + this.r * Math.cos(Math.PI * 5 / 4);
        let y = this.p.y + this.r * Math.sin(Math.PI * 5 / 4);
        c.fillText(this.label, x + 0, y + 0);
    }
}
