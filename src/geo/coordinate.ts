// @jonesangga, 2025, MIT License.

import { c, w, h } from "../ui/canvas.js"
import { color } from "../data/constant.js"
import { Value, Kind, FGNumber } from "../value.js"
import { FGType, coordT } from "../literal/type.js"

export class Coord {
    kind: Kind.Coord = Kind.Coord;
    field: Record<string, Value> = {};

    constructor( 
        public xl: number = -5,
        public xr: number = 5,
        public yl: number = -5,
        public yr: number = 5,
        public strokeStyle: string = color.black,
    ) {
        this.field["xl"] = new FGNumber(this.xl);
        this.field["xr"] = new FGNumber(this.xr);
        this.field["yl"] = new FGNumber(this.yl);
        this.field["yr"] = new FGNumber(this.yr);
    }

    to_str(): string {
        return `Coord [${this.xl}, ${this.xr}] [${this.yl}, ${this.yr}]`;
    }

    typeof(): FGType {
        return new FGType(coordT);
    }

    draw(): void {
        let stepX = w / (this.xr - this.xl);
        let stepY = h / (this.yr - this.yl);
        let x = 0;
        let y = 0;

        c.beginPath();
        for (let i = 0; i < (this.xr - this.xl + 1); i++) {
            c.moveTo(x, 0);
            c.lineTo(x, h);
            x += stepX;
        }
        for (let i = 0; i < (this.yr - this.yl + 1); i++) {
            c.moveTo(0, y);
            c.lineTo(w, y);
            y += stepY;
        }
        c.strokeStyle = this.strokeStyle;
        c.stroke();
    }
}
