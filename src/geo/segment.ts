import { c } from "../ui/canvas.js"
import { Color } from "../data/constant.js"
import { Kind, type FG } from "../value.js"

export class Segment {
    kind: Kind.Segment = Kind.Segment;

    constructor( 
        public x1: number,
        public y1: number,
        public x2: number,
        public y2: number,
        public strokeStyle: string = Color.BLACK
    ) {}

    equal(other: FG) { return false; }

    to_str(): string {
        return `Seg ${this.x1} ${this.y1} ${this.x2} ${this.y2}`;
    }

    draw(): void {
        c.beginPath();
        c.moveTo(this.x1, this.y1);
        c.lineTo(this.x2, this.y2);
        c.strokeStyle = this.strokeStyle;
        c.stroke();
    }

    // midpoint(): Point {
        // return new Point( (this.x1 + this.x2)/2, (this.y1 + this.y2)/2 );
    // }
}
