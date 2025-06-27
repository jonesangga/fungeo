// @jonesangga, 2025, MIT License.

import { c, w, h } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { Value, Kind, FGNumber } from "../value.js"
import { FGType, coordT } from "../literal/type.js"

type point = {
    x: number,
    y: number,
};

export class Coord {
    kind: Kind.Coord = Kind.Coord;
    pts: point[] = [];
    field: Record<string, Value> = {};
    #rangeX: number;
    #rangeY: number;
    #stepX: number;
    #stepY: number;

    constructor( 
        public xl: number = -5,
        public xr: number = 5,
        public yl: number = -5,
        public yr: number = 5,
        public strokeStyle: string = color.black,
    ) {
        this.#rangeX = xr - xl;
        this.#rangeY = yr - yl;
        this.#stepX = w / this.#rangeX;
        this.#stepY = h / this.#rangeY;
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

    add_pt(x: number, y: number): Coord {
        this.pts.push({x, y});
        return this;
    }

    draw(): void {
        let x = 0;
        let y = 0;

        c.beginPath();
        for (let i = 0; i < (this.xr - this.xl + 1); i++) {
            c.moveTo(x, 0);
            c.lineTo(x, h);
            x += this.#stepX;
        }
        for (let i = 0; i < (this.yr - this.yl + 1); i++) {
            c.moveTo(0, y);
            c.lineTo(w, y);
            y += this.#stepY;
        }
        c.strokeStyle = this.strokeStyle;
        c.stroke();

        // Place point according to coordinate view.
        for (let pt of this.pts)
            if (this.#in_view(pt))
                this.#draw_pt(pt);
    }

    #in_view(pt: point): boolean {
        return pt.x >= this.xl &&
               pt.x <= this.xr &&
               pt.y >= this.yl &&
               pt.y <= this.yr;
    }

    #draw_pt(pt: point): void {
        let dx = pt.x - this.xl;
        let dy = -(pt.y - this.yr);
        let x = dx * this.#stepX;
        let y = dy * this.#stepY;
        c.beginPath();
        c.arc(x, y, 5, 0, TAU);
        c.fillStyle = color.black;
        c.fill();
    }
}
