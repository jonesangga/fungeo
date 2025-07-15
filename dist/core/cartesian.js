import { defaultCanvas as canvas } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { Complex } from "./complex.js";
import { FGType, ClassT } from "../literal/type.js";
const c = canvas.ctx;
const w = canvas.w;
const h = canvas.h;
export class CartesianT extends ClassT {
    fields = {};
    methods = {};
    statics = {};
    to_str() {
        return "Type Cartesian";
    }
    equal(other) {
        return other instanceof CartesianT;
    }
}
export const cartesianT = new CartesianT();
const cartesianTValue = new FGType(cartesianT);
export class Cartesian {
    xl;
    xr;
    yl;
    yr;
    strokeStyle;
    pts = [];
    #rangeX;
    #rangeY;
    #stepX;
    #stepY;
    #showGrid = false;
    #showAxis = true;
    currentlyDrawn = false;
    constructor(xl = -5, xr = 5, yl = -5, yr = 5, strokeStyle = color.black) {
        this.xl = xl;
        this.xr = xr;
        this.yl = yl;
        this.yr = yr;
        this.strokeStyle = strokeStyle;
        this.#rangeX = xr - xl;
        this.#rangeY = yr - yl;
        this.#stepX = w / this.#rangeX;
        this.#stepY = h / this.#rangeY;
    }
    to_str() {
        return `Cartesian [${this.xl}, ${this.xr}] [${this.yl}, ${this.yr}]`;
    }
    typeof() {
        return cartesianTValue;
    }
    apply(T) {
        let res = [];
        for (let pt of this.pts) {
            let a = new Complex(pt.x, pt.y);
            let r = T.mul(a);
            res.push({ x: r.re, y: r.im });
        }
        this.pts.push(...res);
    }
    add_pt(x, y) {
        this.pts.push({ x, y });
        return this;
    }
    hide_grid() {
        this.#showGrid = false;
        return this;
    }
    viewport(x, y) {
        x = (x - this.xl) / this.#rangeX * w;
        y = (y - this.yl) / this.#rangeY * h;
        return [x, h - y];
    }
    draw() {
        let x = 0;
        let y = 0;
        c.strokeStyle = "#222222";
        if (this.#showAxis) {
            let [x, y] = this.viewport(0, 0);
            c.beginPath();
            if (x) {
                c.moveTo(x, 0);
                c.lineTo(x, h);
            }
            if (y) {
                c.moveTo(0, y);
                c.lineTo(w, y);
            }
            c.stroke();
        }
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
        c.strokeStyle = this.strokeStyle;
        for (let pt of this.pts)
            if (this.#in_view(pt))
                this.#draw_point(pt);
    }
    #in_view(pt) {
        return pt.x >= this.xl &&
            pt.x <= this.xr &&
            pt.y >= this.yl &&
            pt.y <= this.yr;
    }
    #draw_point(pt) {
        let [x, y] = this.viewport(pt.x, pt.y);
        c.beginPath();
        c.arc(x, y, 5, 0, TAU);
        c.fillStyle = color.black;
        c.fill();
    }
}
