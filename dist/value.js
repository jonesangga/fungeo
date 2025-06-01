import { CallNativeT, CallUserT } from "./type.js";
export var Kind;
(function (Kind) {
    Kind[Kind["Nothing"] = 100] = "Nothing";
    Kind[Kind["Any"] = 200] = "Any";
    Kind[Kind["Boolean"] = 300] = "Boolean";
    Kind[Kind["CallNative"] = 400] = "CallNative";
    Kind[Kind["CallUser"] = 450] = "CallUser";
    Kind[Kind["Complex"] = 460] = "Complex";
    Kind[Kind["Curry"] = 465] = "Curry";
    Kind[Kind["List"] = 470] = "List";
    Kind[Kind["Number"] = 500] = "Number";
    Kind[Kind["String"] = 600] = "String";
    Kind[Kind["Type"] = 650] = "Type";
    Kind[Kind["Circle"] = 700] = "Circle";
    Kind[Kind["Ellipse"] = 750] = "Ellipse";
    Kind[Kind["Picture"] = 840] = "Picture";
    Kind[Kind["Point"] = 850] = "Point";
    Kind[Kind["Rect"] = 900] = "Rect";
    Kind[Kind["Segment"] = 1000] = "Segment";
    Kind[Kind["Canvas"] = 2000] = "Canvas";
    Kind[Kind["Repl"] = 2500] = "Repl";
})(Kind || (Kind = {}));
;
export const KindName = {
    [200]: "Any",
    [300]: "Boolean",
    [400]: "CallNative",
    [450]: "CallUser",
    [2000]: "Canvas",
    [700]: "Circle",
    [460]: "Complex",
    [465]: "Curry",
    [750]: "Ellipse",
    [470]: "List",
    [100]: "Nothing",
    [500]: "Number",
    [840]: "Picture",
    [850]: "Point",
    [900]: "Rect",
    [2500]: "Repl",
    [1000]: "Segment",
    [600]: "String",
    [650]: "Type",
};
export class FGBoolean {
    value;
    kind = 300;
    constructor(value) {
        this.value = value;
    }
    to_str() {
        return this.value.toString();
    }
    equal(other) {
        if (this.kind !== other.kind)
            return false;
        if ("value" in other)
            return this.value === other.value;
        return false;
    }
}
export var CallT;
(function (CallT) {
    CallT[CallT["Function"] = 0] = "Function";
    CallT[CallT["Procedure"] = 1] = "Procedure";
})(CallT || (CallT = {}));
;
export class FGCallNative {
    name;
    callType;
    value;
    version;
    kind = 400;
    constructor(name, callType, value, version) {
        this.name = name;
        this.callType = callType;
        this.value = value;
        this.version = version;
    }
    to_str() {
        if (this.callType === 0)
            return `{fn ${this.name}}`;
        else
            return `{proc ${this.name}}`;
    }
    type() {
        return new FGType(new CallNativeT(this.version.input, this.version.output));
    }
    equal(other) {
        return false;
    }
}
export class FGCallUser {
    name;
    callType;
    version;
    chunk;
    kind = 450;
    constructor(name, callType, version, chunk) {
        this.name = name;
        this.callType = callType;
        this.version = version;
        this.chunk = chunk;
    }
    to_str() {
        if (this.callType === 0)
            return `{fn ${this.name}}`;
        else
            return `{proc ${this.name}}`;
    }
    type() {
        return new FGType(new CallUserT(this.version.input, this.version.output));
    }
    equal(other) {
        return false;
    }
}
export class FGCurry {
    name;
    fn;
    args;
    kind = 465;
    constructor(name, fn, args) {
        this.name = name;
        this.fn = fn;
        this.args = args;
    }
    to_str() {
        return `{curry ${this.name}}`;
    }
    type() {
        return new FGType(new CallUserT(this.fn.version.input.slice(this.args.length), this.fn.version.output));
    }
    equal(other) {
        return false;
    }
}
export class FGNumber {
    value;
    kind = 500;
    constructor(value) {
        this.value = value;
    }
    to_str() {
        return this.value + "";
    }
    add(other) {
        return new FGNumber(this.value + other.value);
    }
    div(other) {
        return new FGNumber(this.value / other.value);
    }
    mul(other) {
        return new FGNumber(this.value * other.value);
    }
    sub(other) {
        return new FGNumber(this.value - other.value);
    }
    equal(other) {
        if (this.kind !== other.kind)
            return false;
        if ("value" in other)
            return this.value === other.value;
        return false;
    }
}
export class FGComplex {
    a;
    b;
    kind = 460;
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    to_str() {
        return `${this.a}+${this.b}i`;
    }
    add(other) {
        return new FGComplex(this.a + other.a, this.b + other.b);
    }
    sub(other) {
        return new FGComplex(this.a - other.a, this.b - other.b);
    }
    scale(value) {
        return new FGComplex(this.a * value, this.b * value);
    }
    mul(other) {
        let a = this.a * other.a - this.b * other.b;
        let b = this.a * other.b + other.a * this.b;
        return new FGComplex(a, b);
    }
    sqrt() {
        let m = Math.sqrt(this.a * this.a + this.b * this.b);
        let angle = Math.atan2(this.b, this.a);
        m = Math.sqrt(m);
        angle = angle / 2;
        return new FGComplex(m * Math.cos(angle), m * Math.sin(angle));
    }
    equal(other) {
        return false;
    }
}
export class FGString {
    value;
    kind = 600;
    constructor(value) {
        this.value = value;
    }
    to_str() {
        return this.value;
    }
    add(other) {
        return new FGString(this.value + other.value);
    }
    equal(other) {
        if (this.kind !== other.kind)
            return false;
        if ("value" in other)
            return this.value === other.value;
        return false;
    }
}
export class FGType {
    value;
    kind = 650;
    constructor(value) {
        this.value = value;
    }
    to_str() {
        return this.value.to_str();
    }
    equal(other) {
        return false;
    }
}
export class FGList {
    value;
    type;
    kind = 470;
    length;
    constructor(value, type) {
        this.value = value;
        this.type = type;
        this.length = value.length;
    }
    to_str() {
        let str = "[";
        str += this.value.map(el => el.to_str()).join(",");
        return str + "]";
    }
    equal(other) {
        return false;
    }
}
export let geoKind = [700, 750, 840, 850, 900, 1000];
