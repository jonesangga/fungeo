// @jonesangga, 2025, MIT License.

import { c } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { Kind } from "../value.js"

export default class Circle {
    kind: Kind.Circle = Kind.Circle;

    constructor( 
        public x: number,
        public y: number,
        public r: number,
        public strokeStyle: string = color.black,
        public fillStyle: string = color.nocolor
    ) {}

    to_str(): string {
        return `C ${this.x} ${this.y} ${this.r}`;
    }

    draw(): void {
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
}
