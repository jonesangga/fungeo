// @jonesangga, 2025, MIT License.

import { defaultCanvas as canvas } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { type Value, FGNumber } from "../value.js"
import { FGType, coordT } from "../literal/type.js"

const c = canvas.ctx;
const w = canvas.w;
const h = canvas.h;

type point = {
    x: number,
    y: number,
    label?: string,
};

export class Coord {
    pts: point[] = [];
    field: Record<string, Value> = {};
    #rangeX: number;
    #rangeY: number;
    #stepX: number;
    #stepY: number;
    #showGrid: boolean = true;

    constructor( 
        readonly xl: number = -5,
        readonly xr: number = 5,
        readonly yl: number = -5,
        readonly yr: number = 5,
        readonly strokeStyle: string = color.black,
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

    add_pt(x: number, y: number, label?: string): Coord {
        if (typeof label === "string")
            this.pts.push({x, y, label});
        else
            this.pts.push({x, y});
        return this;
    }

    hide_grid(): Coord {
        this.#showGrid = false;
        return this;
    }

    draw(): void {
        let x = 0;
        let y = 0;
        c.strokeStyle = "#222222";

        // Draw grid.
        if (this.#showGrid) {
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
            c.stroke();
        }

        // Place point according to coordinate view.
        c.strokeStyle = this.strokeStyle;
        for (let pt of this.pts)
            if (this.#in_view(pt))
                this.#draw_point(pt);
    }

    #in_view(pt: point): boolean {
        return pt.x >= this.xl &&
               pt.x <= this.xr &&
               pt.y >= this.yl &&
               pt.y <= this.yr;
    }

    #draw_point(pt: point): void {
        let dx = pt.x - this.xl;
        let dy = -(pt.y - this.yr);
        let x = dx * this.#stepX;
        let y = dy * this.#stepY;

        c.beginPath();
        c.arc(x, y, 5, 0, TAU);
        c.fillStyle = color.black;
        c.fill();

        if (pt.label) {
            c.textBaseline = "bottom";
            c.font = "16px monospace"
            c.fillText(pt.label, x + 5, y - 5);
        }
    }
}
