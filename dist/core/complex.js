import { FGType, complexT } from "../literal/type.js";
export class Complex {
    re;
    im;
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }
    to_str() {
        return `${this.re}+${this.im}i`;
    }
    typeof() {
        return new FGType(complexT);
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
        const im = this.re * other.im + other.re * this.im;
        return new Complex(re, im);
    }
    sqrt() {
        let m = Math.sqrt(this.re * this.re + this.im * this.im);
        let angle = Math.atan2(this.im, this.re);
        m = Math.sqrt(m);
        angle = angle / 2;
        return new Complex(m * Math.cos(angle), m * Math.sin(angle));
    }
    equal(other) {
        return this instanceof Complex;
    }
}
