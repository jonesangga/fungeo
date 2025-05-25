// @jonesangga, 2025, MIT License.

import { c } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { Kind, FGNumber } from "../value.js"

export default class Circle {
    kind: Kind.Circle = Kind.Circle;
    bend?: number;

    constructor( 
        public x: number,
        public y: number,
        public r: number,
        public strokeStyle: string = color.black,
        public fillStyle: string = color.nocolor
    ) {}

    static with_bend(x: number, y: number, bend: number): Circle {
        let c = new Circle(x, y, Math.abs(1/bend));
        c.bend = bend;
        return c;
    }

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

    static descartes(c1: Circle, c2: Circle, c3: Circle): FGNumber[] {
        let k1 = c1.bend as number;
        let k2 = c2.bend as number;
        let k3 = c3.bend as number;

        let sum = k1 + k2 + k3;
        let root = 2 * Math.sqrt(k1*k2 + k2*k3 + k1*k3);

        return [new FGNumber(sum + root), new FGNumber(sum - root)];
    }
}
