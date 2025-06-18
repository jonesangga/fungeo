import { c } from "../ui/canvas.js";
import { color } from "../data/constant.js";
import { Point } from "./point.js";
import { FGType, segmentT } from "../literal/type.js";
export class Segment {
    x1;
    y1;
    x2;
    y2;
    strokeStyle;
    kind = 1000;
    constructor(x1, y1, x2, y2, strokeStyle = color.black) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.strokeStyle = strokeStyle;
    }
    to_str() {
        return `Seg ${this.x1} ${this.y1} ${this.x2} ${this.y2}`;
    }
    typeof() {
        return new FGType(segmentT);
    }
    draw() {
        c.beginPath();
        c.moveTo(this.x1, this.y1);
        c.lineTo(this.x2, this.y2);
        c.strokeStyle = this.strokeStyle;
        c.stroke();
    }
    midpoint() {
        return new Point((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2);
    }
}
export class RichSegment {
    p;
    q;
    label;
    strokeStyle;
    kind = 920;
    constructor(p, q, label = "", strokeStyle = color.black) {
        this.p = p;
        this.q = q;
        this.label = label;
        this.strokeStyle = strokeStyle;
    }
    to_str() {
        return `rseg ${this.p.x} ${this.p.y} ${this.q.x} ${this.q.y}`;
    }
    typeof() {
        return new FGType(segmentT);
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
