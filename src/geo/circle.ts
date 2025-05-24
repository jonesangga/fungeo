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

    // static descartes(c1: Circle, c2: Circle, c3: Circle): [number, number] {
        // let k1 = 1 / c1.r;
        // let k2 = 1 / c2.r;
        // let k3 = 1 / c3.r;

        // let sum = k1 + k2 + k3;
        // let root = 2 * Math.sqrt(k1*k2 + k2*k3 + k1*k3);

        // return [sum + root, sum - root];
    // }
}
