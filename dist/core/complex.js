import { FGType, ClassT } from "../literal/type.js";
export class ComplexT extends ClassT {
    fields = {};
    methods = {};
    statics = {};
    to_str() {
        return "Type Complex";
    }
    equal(other) {
        return other instanceof ComplexT;
    }
}
export const complexT = new ComplexT();
const complexTValue = new FGType(complexT);
export class Complex {
    re;
    im;
    constructor(re, im = 0) {
        this.re = re;
        this.im = im;
    }
    static polar(abs, arg) {
        return new Complex(abs * Math.cos(arg), abs * Math.sin(arg));
    }
    to_str() {
        if (this.re !== 0) {
            if (this.im > 0)
                return `${this.re} + ${this.im}i`;
            if (this.im < 0)
                return `${this.re} - ${-this.im}i`;
            return this.re + "";
        }
        else {
            if (this.im > 0)
                return this.im + "i";
            return "0";
        }
    }
    typeof() {
        return complexTValue;
    }
    add(other) {
        return new Complex(this.re + other.re, this.im + other.im);
    }
    sub(other) {
        return new Complex(this.re - other.re, this.im - other.im);
    }
    scale(value) {
        return new Complex(this.re * value, this.im * value);
    }
    mul(other) {
        const re = this.re * other.re - this.im * other.im;
        const im = this.re * other.im + this.im * other.re;
        return new Complex(re, im);
    }
    div(other) {
        const denom = other.re * other.re + other.im * other.im;
        if (denom < 10e-10)
            throw new Error("division by zero");
        return new Complex((this.re * other.re + this.im * other.im) / denom, (this.im * other.re - this.re * other.im) / denom);
    }
    abs() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }
    arg() {
        return Math.atan2(this.im, this.re);
    }
    conj() {
        return new Complex(this.re, -this.im);
    }
    sqrt() {
        let m = Math.sqrt(this.re * this.re + this.im * this.im);
        let arg = Math.atan2(this.im, this.re);
        m = Math.sqrt(m);
        arg = arg / 2;
        return new Complex(m * Math.cos(arg), m * Math.sin(arg));
    }
    equal(other) {
        return other instanceof Complex &&
            this.re === other.re &&
            this.im === other.im;
    }
}
