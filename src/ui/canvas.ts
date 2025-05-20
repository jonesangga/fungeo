// @jonesangga, 12-04-2025, MIT License.

import { Kind, Canvas, type FG } from "../value.js"

let w = 300;    // Canvas width.
let h = 300;    // Canvas height.

const canvasElem = document.createElement("canvas");
export const c = canvasElem.getContext("2d") as CanvasRenderingContext2D;
const pixelRatio = window.devicePixelRatio || 1;

document.body.appendChild(canvasElem);
canvasElem.style.width  = w + "px";
canvasElem.style.height = h + "px";
canvasElem.width  = w * pixelRatio;
canvasElem.height = h * pixelRatio;
c.scale(pixelRatio, pixelRatio);

canvasElem.style.position   = "absolute";
canvasElem.style.top        = "0px";
canvasElem.style.left       = "0px";
canvasElem.style.border     = "1px solid black";

export const canvas: Canvas = {
    kind: Kind.Canvas,

    // clear(): void {
        // c.fillStyle = "#fff";
        // c.fillRect(0, 0, w, h);
    // },

    to_str(): string { return "canvas"; },
    equal(other: FG) { return false; },

    resize(w_: number, h_: number): void {
        w = w_;
        h = h_;
        canvasElem.width  = w * pixelRatio;
        canvasElem.height = h * pixelRatio;
        canvasElem.style.width  = w + "px";
        canvasElem.style.height = h + "px";
        c.scale(pixelRatio, pixelRatio);
    },

    place(x: number, y: number): void {
        if (x < 0 || y < 0 || x > 1000 || y > 1000) {
            console.log("invalid place");
            return;
        }
        canvasElem.style.left = x + "px";
        canvasElem.style.top  = y + "px";
    }
};
