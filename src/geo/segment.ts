// @jonesangga, 2025, MIT License.
//
// TODO: lineWidth?
//       Think about equal() implementation.
//       Test draw() visually.

import { defaultCanvas as canvas } from "../ui/canvas.js"
import { color } from "../data/constant.js"
import { Value, Kind, FGNumber } from "../value.js"
import { Point } from "./point.js"
import { FGType, segmentT } from "../literal/type.js"

const c = canvas.ctx;

export class Segment {
    kind: Kind.Segment = Kind.Segment;
    field: Record<string, Value> = {};

    constructor( 
        public x1: number,
        public y1: number,
        public x2: number,
        public y2: number,
        public strokeStyle: string = color.black
    ) {
        this.field["x1"] = new FGNumber(this.x1);
        this.field["y1"] = new FGNumber(this.y1);
        this.field["x2"] = new FGNumber(this.x2);
        this.field["y2"] = new FGNumber(this.y2);
    }

    to_str(): string {
        return `Seg ${this.x1} ${this.y1} ${this.x2} ${this.y2}`;
    }

    typeof(): FGType {
        return new FGType(segmentT);
    }

    length(): number {
        return Math.sqrt((this.x2 - this.x1)**2 + (this.y2 - this.y1)**2);
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
