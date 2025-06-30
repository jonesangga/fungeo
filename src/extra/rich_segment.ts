// @jonesangga, 2025, MIT License.
//
// TODO: lineWidth?
//       Think about equal() implementation.
//       Test draw() visually.
//
// TODO: This is broken.

import { c } from "../ui/canvas.js"
import { color } from "../data/constant.js"
import { RichPoint } from "./rich_point.js"
import { Point } from "../geo/point.js"

export class RichSegment {
    field: Record<string, any> = {};

    constructor(
        public p: RichPoint,
        public q: RichPoint,
        public label: string = "",
        public strokeStyle: string = color.black
    ) {
        this.field["p"] = this.p;
        this.field["q"] = this.q;
    }

    to_str(): string {
        return `rseg ${this.p.x} ${this.p.y} ${this.q.x} ${this.q.y}`;
    }

    // typeof(): FGType {
        // return new FGType(segmentT);
    // }

    length(): number {
        return Math.sqrt((this.q.x - this.p.x)**2 + (this.q.y - this.p.y)**2);
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
