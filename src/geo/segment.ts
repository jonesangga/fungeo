// @jonesangga, 2025, MIT License.
//
// TODO: lineWidth?
//       Think about equal() implementation.
//       Test draw() visually.

import { c } from "../ui/canvas.js"
import { color } from "../data/constant.js"
import { Kind } from "../value.js"
import { Point, RichPoint } from "./point.js"
import { FGType, segmentT } from "../literal/type.js"

export class Segment {
    kind: Kind.Segment = Kind.Segment;

    constructor( 
        public x1: number,
        public y1: number,
        public x2: number,
        public y2: number,
        public strokeStyle: string = color.black
    ) {}

    to_str(): string {
        return `Seg ${this.x1} ${this.y1} ${this.x2} ${this.y2}`;
    }

    typeof(): FGType {
        return new FGType(segmentT);
    }

    draw(): void {
        c.beginPath();
        c.moveTo(this.x1, this.y1);
        c.lineTo(this.x2, this.y2);
        c.strokeStyle = this.strokeStyle;
        c.stroke();
    }

    midpoint(): Point {
        return new Point((this.x1 + this.x2)/2, (this.y1 + this.y2)/2);
    }
}

export class RichSegment {
    kind: Kind.RichSegment = Kind.RichSegment;

    constructor(
        public p: RichPoint,
        public q: RichPoint,
        public label: string = "",
        public strokeStyle: string = color.black
    ) {}

    to_str(): string {
        return `rseg ${this.p.x} ${this.p.y} ${this.q.x} ${this.q.y}`;
    }

    typeof(): FGType {
        return new FGType(segmentT);
    }

    draw(): void {
        c.beginPath();
        c.moveTo(this.p.x, this.p.y);
        c.lineTo(this.q.x, this.q.y);
        c.strokeStyle = this.strokeStyle;
        c.stroke();
        this.p.draw();
        this.q.draw();
    }

    draw_label(): void {
        this.p.draw_label();
        this.q.draw_label();
        c.fillStyle = this.strokeStyle;
        c.textBaseline = "bottom";
        c.font = "16px monospace"
        let mid = this.midpoint();
        c.fillText(this.label, mid.x + 5, mid.y - 5);
    }

    midpoint(): Point {
        return new Point((this.p.x + this.q.x)/2, (this.p.y + this.q.y)/2);
    }
}
