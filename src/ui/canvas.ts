import { FGType, canvasT } from "../literal/type.js"

export class Canvas {
    #canvas:      HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
    #pixelRatio:  number;
    x = 0;
    y = 0;

    constructor(public w: number = 100,
                public h: number = 100)
    {
        const canvas     = document.createElement("canvas");
        const ctx        = canvas.getContext("2d") as CanvasRenderingContext2D;
        const pixelRatio = window.devicePixelRatio || 1;

        document.body.appendChild(canvas);
        ctx.scale(pixelRatio, pixelRatio);

        canvas.style.width      = w + "px";
        canvas.style.height     = h + "px";
        canvas.width            = w * pixelRatio;
        canvas.height           = h * pixelRatio;

        canvas.style.position   = "absolute";
        canvas.style.top        = "0px";
        canvas.style.left       = "0px";
        canvas.style.border     = "1px solid black";
        canvas.style.background = "#fff";

        this.#canvas     = canvas;
        this.ctx         = ctx;
        this.#pixelRatio = pixelRatio;
    }

    typeof(): FGType {
        return new FGType(canvasT);
    }

    to_str(): string {
        return `Canvas(${this.w}, ${this.h})`;
    }

    // NOTE: Make sure there is no transformation.
    clear(): void {
        this.ctx.fillStyle = "#fff";
        this.ctx.clearRect(0, 0, this.w, this.h);
    }

    // TODO: Think how to return error message.
    place(x: number, y: number): Canvas {
        if (x < 0 || y < 0 || x > 1000 || y > 1000) {
            console.log("invalid place");
            return this;
        }
        this.#canvas.style.left = x + "px";
        this.#canvas.style.top  = y + "px";
        this.x = x;
        this.y = y;
        return this;
    }

    // TODO: Check that ctx.scale() compound?
    resize(w: number, h: number): Canvas {
        this.#canvas.width        = w * this.#pixelRatio;
        this.#canvas.height       = h * this.#pixelRatio;
        this.#canvas.style.width  = w + "px";
        this.#canvas.style.height = h + "px";
        this.w = w;
        this.h = h;
        this.ctx.scale(this.#pixelRatio, this.#pixelRatio);
        return this;
    }
}

export const defaultCanvas = new Canvas(300, 300);
