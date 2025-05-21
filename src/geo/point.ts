// @jonesangga, 2025, MIT License.
//
// A Point is a filled circle.

import { c } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { Kind } from "../value.js"

export default class Point {
    kind: Kind.Point = Kind.Point;

    constructor( 
        public x: number,
        public y: number,
        public lineWidth: number = 5,
        public strokeStyle: string = color.black
    ) {}

    to_str(): string {
        return `P ${this.x} ${this.y}`;
    }

    draw(): void {
        c.beginPath();
        c.arc(this.x, this.y, this.lineWidth/2, 0, TAU);
        c.fillStyle = this.strokeStyle;
        c.fill();
    }
}
