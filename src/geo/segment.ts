// @jonesangga, 2025, MIT License.
//
// TODO: lineWidth?
//       Think about equal() implementation.
//       Test draw() visually.

import { c } from "../ui/canvas.js"
import { color } from "../data/constant.js"
import { Kind } from "../value.js"
import { segmentT } from "../type.js"
import Point from "./point.js"
import { FGType } from "../literal/type.js"

export default class Segment {
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
