import { FGType, CallUserT, ListT, booleanT, numberT, stringT, complexT } from "./literal/type.js";
export var Kind;
(function (Kind) {
    Kind[Kind["Nothing"] = 100] = "Nothing";
    Kind[Kind["Any"] = 200] = "Any";
    Kind[Kind["Boolean"] = 300] = "Boolean";
    Kind[Kind["CallNative"] = 400] = "CallNative";
    Kind[Kind["CallUser"] = 450] = "CallUser";
    Kind[Kind["Color"] = 455] = "Color";
    Kind[Kind["Complex"] = 460] = "Complex";
    Kind[Kind["List"] = 470] = "List";
    Kind[Kind["Number"] = 500] = "Number";
    Kind[Kind["String"] = 600] = "String";
    Kind[Kind["Struct"] = 610] = "Struct";
    Kind[Kind["Type"] = 650] = "Type";
    Kind[Kind["Circle"] = 700] = "Circle";
    Kind[Kind["Ellipse"] = 750] = "Ellipse";
    Kind[Kind["Picture"] = 840] = "Picture";
    Kind[Kind["Point"] = 850] = "Point";
    Kind[Kind["Rect"] = 900] = "Rect";
    Kind[Kind["RichCircle"] = 905] = "RichCircle";
    Kind[Kind["RichPoint"] = 910] = "RichPoint";
    Kind[Kind["RichSegment"] = 920] = "RichSegment";
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
    [455]: "Color",
    [460]: "Complex",
    [750]: "Ellipse",
    [470]: "List",
    [100]: "Nothing",
    [500]: "Number",
    [840]: "Picture",
    [850]: "Point",
    [900]: "Rect",
    [2500]: "Repl",
    [905]: "RichCircle",
    [910]: "RichPoint",
    [920]: "RichSegment",
    [1000]: "Segment",
    [600]: "String",
    [610]: "Struct",
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
    typeof() {
        return new FGType(booleanT);
    }
    equal(other) {
        if (this.kind !== other.kind)
            return false;
        if ("value" in other)
            return this.value === other.value;
        return false;
    }
}
export class FGCallNative {
    name;
    value;
    sig;
    kind = 400;
    constructor(name, value, sig) {
        this.name = name;
        this.value = value;
        this.sig = sig;
    }
    to_str() {
        return `{fn ${this.name}}`;
    }
    typeof() {
        return new FGType(this.sig);
    }
}
export class FGCallUser {
    name;
    input;
    output;
    chunk;
    kind = 450;
    constructor(name, input, output, chunk) {
        this.name = name;
        this.input = input;
        this.output = output;
        this.chunk = chunk;
    }
    to_str() {
        return `{fn ${this.name}}`;
    }
    typeof() {
        return new FGType(new CallUserT(this.input, this.output));
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
    typeof() {
        return new FGType(numberT);
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
    typeof() {
        return new FGType(complexT);
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
    typeof() {
        return new FGType(stringT);
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
export class FGList {
    value;
    type;
    kind = 470;
    constructor(value, type) {
        this.value = value;
        this.type = type;
    }
    to_str() {
        let str = "[";
        str += this.value.map(el => el.to_str()).join(",");
        return str + "]";
    }
    typeof() {
        return new FGType(new ListT(this.type));
    }
    equal(other) {
        return false;
    }
}
export class FGStruct {
    members;
    kind = 610;
    constructor(members) {
        this.members = members;
    }
    to_str() {
        return "{" + Object.entries(this.members).map(([k, v]) => k + ":" + v.to_str()).join(", ") + "}";
    }
    typeof() {
        return new FGType(booleanT);
    }
    equal(other) {
        return false;
    }
}
