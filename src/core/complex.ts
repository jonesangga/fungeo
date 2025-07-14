import { type FG, FGCallNative } from "../value.js";
import { type Type, FGType, Class } from "../literal/type.js"

export class ComplexT extends Class implements Type {
    fields:  Record<string, Type> = {};
    methods: Record<string, { type: Type, value: FGCallNative }> = {};
    statics: Record<string, { type: Type, value: FGCallNative }> = {};

    to_str(): string {
        return "Type Complex";
    }

    equal(other: Type): boolean {
        return other instanceof ComplexT;
    }
}

export const complexT = new ComplexT();
const complexTValue = new FGType(complexT);

export class Complex {
    constructor(readonly re: number,
                readonly im: number = 0) {}

    to_str(): string {
        if (this.re !== 0) {
            if (this.im > 0)
                return `${ this.re } + ${ this.im }i`;
            if (this.im < 0)
                return `${ this.re } - ${ -this.im }i`;
            return this.re + "";
        }
        else {
            if (this.im > 0)
                return this.im + "i";
            return "0";
        }
    }

    typeof(): FGType {
        return complexTValue;
    }

    add(other: Complex): Complex {
        return new Complex(this.re + other.re,
                           this.im + other.im);
    }

    sub(other: Complex): Complex {
        return new Complex(this.re - other.re,
                           this.im - other.im);
    }

    scale(value: number): Complex {
        return new Complex(this.re * value,
                           this.im * value);
    }

    mul(other: Complex): Complex {
        const re = this.re * other.re - this.im * other.im;
        const im = this.re * other.im + this.im * other.re;
        return new Complex(re, im);
    }

    sqrt() {
        // Convert to polar form
        let m = Math.sqrt(this.re * this.re + this.im * this.im);
        let arg = Math.atan2(this.im, this.re);
        // Calculate square root of magnitude and use half the arg for square root
        m = Math.sqrt(m);
        arg = arg / 2;
        // Back to rectangular form
        return new Complex(m * Math.cos(arg), m * Math.sin(arg));
    }

    equal(other: FG): boolean {
        return other instanceof Complex &&
               this.re === other.re &&
               this.im === other.im;
    }
}
