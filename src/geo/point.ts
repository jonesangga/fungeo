// @jonesangga, 2025, MIT License.
//
// A Point is a filled circle.

import { c } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { Value, Kind, FGNumber, FGString } from "../value.js"
import { FGType, StructT, pointT, numberT, stringT } from "../literal/type.js"

export class Point {
    kind: Kind.Point = Kind.Point;

    constructor( 
        public x: number,
        public y: number,
        public lineWidth: number = 8,
        public strokeStyle: string = color.black
    ) {}

    to_str(): string {
        return `Pt ${this.x} ${this.y}`;
    }

    typeof(): FGType {
        return new FGType(pointT);
    }

    draw(): void {
        c.beginPath();
        c.arc(this.x, this.y, this.lineWidth/2, 0, TAU);
        c.fillStyle = this.strokeStyle;
        c.fill();
    }

    member(key: keyof typeof s): Value {
        switch (key) {
            case "x": return new FGNumber(this.x);
            case "y": return new FGNumber(this.y);
            default:
                unreachable(key);
        }
    }
}

export class RichPoint {
    kind: Kind.RichPoint = Kind.RichPoint;

    constructor(
        public x: number,
        public y: number,
        public lineWidth: number = 8,
        public strokeStyle: string = color.blue,
        public label: string = ""
    ) {}

    to_str(): string {
        return `RPt ${this.x} ${this.y}`;
    }

    typeof(): FGType {
        return new FGType(pointT);
    }

    draw(): void {
        c.beginPath();
        c.arc(this.x, this.y, this.lineWidth/2, 0, TAU);
        c.fillStyle = this.strokeStyle;
        c.fill();
    }

    draw_label(): void {
        c.textBaseline = "bottom";
        c.font = "16px monospace"
        c.fillText(this.label, this.x + 5, this.y - 5);
    }

    member(key: keyof typeof rs): Value {
        switch (key) {
            case "x": return new FGNumber(this.x);
            case "y": return new FGNumber(this.y);
            case "label": return new FGString(this.label);
            default:
                unreachable(key);
        }
    }
}

function unreachable(key: never): never {
    throw new Error();
}

let s = {
    x: numberT,
    y: numberT,
};
export const pointStruct = new FGType(new StructT(s));

let rs = {
    x: numberT,
    y: numberT,
    label: stringT,
};
export const richPointStruct = new FGType(new StructT(rs));
