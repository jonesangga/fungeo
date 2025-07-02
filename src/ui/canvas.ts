// @jonesangga, 12-04-2025, MIT License.

import { Kind } from "../value.js"
import { FGType, canvasT } from "../literal/type.js"

export class Canvas {
    kind: Kind.Canvas = Kind.Canvas;
    x = 0;
    y = 0;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    pixelRatio: number;

    constructor(public w: number = 100,
                public h: number = 100)
    {
        let canvasElem = document.createElement("canvas");
        this.ctx = canvasElem.getContext("2d") as CanvasRenderingContext2D;
        let pixelRatio = window.devicePixelRatio || 1;

        document.body.appendChild(canvasElem);
        canvasElem.style.width  = w + "px";
        canvasElem.style.height = h + "px";
        canvasElem.width  = w * pixelRatio;
        canvasElem.height = h * pixelRatio;
        this.ctx.scale(pixelRatio, pixelRatio);

        canvasElem.style.position = "absolute";
        canvasElem.style.top      = "0px";
        canvasElem.style.left     = "0px";
        canvasElem.style.border   = "1px solid black";
        canvasElem.style.background = "#fff";
        this.canvas = canvasElem;
        this.pixelRatio = pixelRatio;
    }

    typeof(): FGType {
        return new FGType(canvasT);
    }

    to_str(): string {
        return "canvas";
    }

    // NOTE: Make sure there is no transformation.
    clear(): void {
        this.ctx.fillStyle = "#fff";
        this.ctx.clearRect(0, 0, this.w, this.h);
    }

    place(x: number, y: number): void {
        if (x < 0 || y < 0 || x > 1000 || y > 1000) {
            console.log("invalid place");
            return;
        }
        this.canvas.style.left = x + "px";
        this.canvas.style.top  = y + "px";
        this.x = x;
        this.y = y;
    }

    resize(w: number, h: number): void {
        this.w = w;
        this.h = h;
        this.canvas.width  = this.w * this.pixelRatio;
        this.canvas.height = this.h * this.pixelRatio;
        this.canvas.style.width  = this.w + "px";
        this.canvas.style.height = this.h + "px";
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }
}

export let defaultCanvas = new Canvas(300, 300);
