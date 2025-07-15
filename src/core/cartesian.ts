// TODO: Refactor

import { defaultCanvas as canvas } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { Complex } from "./complex.js"
import { type Value, FGCallNative } from "../value.js"
import { type Type, FGType, ClassT } from "../literal/type.js"

const c = canvas.ctx;

export class CartesianT extends ClassT {
    fields:  Record<string, Type> = {};
    methods: Record<string, { type: Type, value: FGCallNative }> = {};
    statics: Record<string, { type: Type, value: FGCallNative }> = {};

    to_str(): string {
        return "Type Cartesian";
    }

    equal(other: Type): boolean {
        return other instanceof CartesianT;
    }
}

export const cartesianT = new CartesianT();
const cartesianTValue = new FGType(cartesianT);

type point = {
    x: number,
    y: number,
};

export class Cartesian implements Value {
    pts: point[] = [];
    #rangeX: number;
    #rangeY: number;
    #stepX: number;
    #stepY: number;
    #showGrid: boolean = false;
    #showAxis: boolean = true;
    currentlyDrawn = false;

    constructor(readonly xl: number = -5,
                readonly xr: number = 5,
                readonly yl: number = -5,
                readonly yr: number = 5,
                readonly strokeStyle: string = color.black)
    {
        this.#rangeX = xr - xl;
        this.#rangeY = yr - yl;
        this.#stepX = canvas.w / this.#rangeX;
        this.#stepY = canvas.h / this.#rangeY;
    }

    to_str(): string {
        return `Cartesian [${this.xl}, ${this.xr}] [${this.yl}, ${this.yr}]`;
    }

    typeof(): FGType {
        return cartesianTValue;
    }

    apply(T: Complex): void {
        let res = [];
        for (let pt of this.pts) {
            let a = new Complex(pt.x, pt.y);
            let r = T.mul(a);
            res.push({x: r.re, y: r.im});
        }
        this.pts.push(...res);
    }

    add_pt(x: number, y: number): Cartesian {
        this.pts.push({x, y});
        return this;
    }

    hide_grid(): Cartesian {
        this.#showGrid = false;
        return this;
    }

    viewport(x: number, y: number): [number, number] {
        x = (x - this.xl) / this.#rangeX * canvas.w;
        y = (y - this.yl) / this.#rangeY * canvas.h;
        return [x, canvas.h-y];
    }

    draw(): void {
        let x = 0;
        let y = 0;
        c.strokeStyle = "#222222";

        if (this.#showAxis) {
            let [x, y] = this.viewport(0, 0);
            c.beginPath();
            if (x) {
                c.moveTo(x, 0);
                c.lineTo(x, canvas.h);
            }
            if (y) {
                c.moveTo(0, y);
                c.lineTo(canvas.w, y);
            }
            c.stroke();
        }

        // Draw grid.
        if (this.#showGrid) {
            c.beginPath();
            for (let i = 0; i < (this.xr - this.xl + 1); i++) {
                c.moveTo(x, 0);
                c.lineTo(x, canvas.h);
                x += this.#stepX;
            }
            for (let i = 0; i < (this.yr - this.yl + 1); i++) {
                c.moveTo(0, y);
                c.lineTo(canvas.w, y);
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
        let [x, y] = this.viewport(pt.x, pt.y);
        c.beginPath();
        c.arc(x, y, 5, 0, TAU);
        c.fillStyle = color.black;
        c.fill();
    }
}
