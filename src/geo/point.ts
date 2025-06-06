// @jonesangga, 2025, MIT License.
//
// A Point is a filled circle.

import { c } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { Value, Kind, FGNumber } from "../value.js"
import { FGType, StructT, pointT, numberT } from "../literal/type.js"

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

function unreachable(key: never): never {
    throw new Error();
}

let s = {
    x: numberT,
    y: numberT,
};
export const pointStruct = new FGType(new StructT(s));
