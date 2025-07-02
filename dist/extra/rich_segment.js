import { defaultCanvas as canvas } from "../ui/canvas.js";
import { color } from "../data/constant.js";
import { Point } from "../geo/point.js";
const c = canvas.ctx;
export class RichSegment {
    p;
    q;
    label;
    strokeStyle;
    field = {};
    constructor(p, q, label = "", strokeStyle = color.black) {
        this.p = p;
        this.q = q;
        this.label = label;
        this.strokeStyle = strokeStyle;
        this.field["p"] = this.p;
        this.field["q"] = this.q;
    }
    to_str() {
        return `rseg ${this.p.x} ${this.p.y} ${this.q.x} ${this.q.y}`;
    }
    length() {
        return Math.sqrt((this.q.x - this.p.x) ** 2 + (this.q.y - this.p.y) ** 2);
    }
    draw() {
        c.beginPath();
        c.moveTo(this.p.x, this.p.y);
        c.lineTo(this.q.x, this.q.y);
        c.strokeStyle = this.strokeStyle;
        c.stroke();
        this.p.draw();
        this.q.draw();
    }
    draw_label() {
        this.p.draw_label();
        this.q.draw_label();
        c.fillStyle = this.strokeStyle;
        c.textBaseline = "bottom";
        c.font = "16px monospace";
        let mid = this.midpoint();
        c.fillText(this.label, mid.x + 5, mid.y - 5);
    }
    midpoint() {
        return new Point((this.p.x + this.q.x) / 2, (this.p.y + this.q.y) / 2);
    }
}
