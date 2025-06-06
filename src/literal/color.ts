// @jonesangga, 2025, MIT License.
//
// TODO: Implement the equal() method.
//       Test it.

import { type FG, Kind } from "../value.js";
import { colorT } from "../type.js";
import { FGType } from "./type.js"

const colorTVal = new FGType(colorT);

export class FGColor implements FG {
    kind: Kind.Color = Kind.Color;

    constructor(
        public r: number,
        public g: number,
        public b: number,
        public a: number = 255,
    ) {}

    to_str(): string {
        return `Color ${this.r},${this.g},${this.b},${this.a}`;
    }

    to_hex(): string {
        return '#' + [this.r, this.g, this.b].map(x => {
            const hex = x.toString(16)
            return hex.length === 1 ? '0' + hex : hex
        }).join('');
    }

    typeof(): FGType {
        return colorTVal;
    }

    equal(other: FG): boolean {
        console.log("FGType.equal() is not implemented yet");
        return false;
    }
}
