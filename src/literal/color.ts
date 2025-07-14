// @jonesangga, 2025, MIT License.
//
// This is intended for color manipulation and processing.
// But currently this is used to set the strokeStyle and fillStyle fields of geometry objects
// after converted to hex string equivalent to save space.
//
// TODO: Create ColorLite type alias for string to be used.

import { type Value } from "../value.js";
import { FGType, colorTVal } from "./type.js"

export class FGColor implements Value {
    constructor(
        readonly r: number,
        readonly g: number,
        readonly b: number,
        readonly a: number = 255,
    ) {}

    to_str(): string {
        return `Color ${this.r},${this.g},${this.b},${this.a}`;
    }

    typeof(): FGType {
        return colorTVal;
    }

    to_hex(): string {
        return '#' + [this.r, this.g, this.b, this.a].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
}
