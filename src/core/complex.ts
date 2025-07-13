// TODO: Clean up.

import { type FG } from "../value.js";
import { FGType, complexT } from "../literal/type.js"

export class Complex {
    constructor(public re: number,
                public im: number) {}

    to_str(): string {
        return `${ this.re }+${ this.im }i`;
    }

    typeof(): FGType {
        return new FGType(complexT);
    }

    add(other: Complex): Complex {
        return new Complex(this.re + other.re, this.im + other.im);
    }

    sub(other: Complex): Complex {
        return new Complex(this.re - other.re, this.im - other.im);
    }

    scale(value: number): Complex {
        return new Complex(this.re * value, this.im * value);
    }

    mul(other: Complex): Complex {
        const re = this.re * other.re - this.im * other.im;
        const im = this.re * other.im + other.re * this.im;
        return new Complex(re, im);
    }

    sqrt() {
        // Convert to polar form
        let m = Math.sqrt(this.re * this.re + this.im * this.im);
        let angle = Math.atan2(this.im, this.re);
        // Calculate square root of magnitude and use half the angle for square root
        m = Math.sqrt(m);
        angle = angle / 2;
        // Back to rectangular form
        return new Complex(m * Math.cos(angle), m * Math.sin(angle));
    }

    equal(other: FG): boolean {
        return this instanceof Complex;
    }
}
