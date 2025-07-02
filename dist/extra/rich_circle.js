import { defaultCanvas as canvas } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { RichPoint } from "./rich_point.js";
const c = canvas.ctx;
let cos_ = Math.cos(Math.PI * 5 / 4);
let sin_ = Math.sin(Math.PI * 5 / 4);
export class RichCircle {
    p;
    q;
    label;
    strokeStyle;
    fillStyle;
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
    radius() {
        return Math.sqrt((this.p.x - this.q.x) ** 2 + (this.p.y - this.q.y) ** 2);
    }
    to_str() {
        return `C ${this.p.to_str()} ${this.q.to_str()}`;
    }
    draw() {
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
    draw_label() {
        this.p.draw_label();
        this.q.draw_label();
        c.fillStyle = this.strokeStyle;
        c.textBaseline = "top";
        c.font = "16px monospace";
        let x = this.p.x + this.r * cos_;
        let y = this.p.y + this.r * sin_;
        c.fillText(this.label, x + 0, y + 0);
    }
    intersect(other) {
        let x1 = this.p.x;
        let y1 = this.p.y;
        let r1 = this.radius();
        let x2 = other.p.x;
        let y2 = other.p.y;
        let r2 = other.radius();
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
        return [new RichPoint(ix1, iy1), new RichPoint(ix2, iy2)];
    }
}
