export var Kind;
(function (Kind) {
    Kind[Kind["Nothing"] = 100] = "Nothing";
    Kind[Kind["Any"] = 200] = "Any";
    Kind[Kind["Boolean"] = 300] = "Boolean";
    Kind[Kind["Callable"] = 400] = "Callable";
    Kind[Kind["CallUser"] = 450] = "CallUser";
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
    [400]: "Callable",
    [450]: "CallUser",
    [2000]: "Canvas",
    [700]: "Circle",
    [750]: "Ellipse",
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
export class FGCallable {
    name;
    value;
    version;
    kind = 400;
    constructor(name, value, version) {
        this.name = name;
        this.value = value;
        this.version = version;
    }
    to_str() {
        return `<fn ${this.name}>`;
    }
    equal(other) {
        return false;
    }
}
export var CallT;
(function (CallT) {
    CallT[CallT["Function"] = 0] = "Function";
    CallT[CallT["Procedure"] = 1] = "Procedure";
})(CallT || (CallT = {}));
;
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
            return `<fn ${this.name}>`;
        else
            return `<proc ${this.name}>`;
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
    base;
    kind = 650;
    constructor(base) {
        this.base = base;
    }
    to_str() {
        return KindName[this.base];
    }
    equal(other) {
        if (this.kind !== other.kind)
            return false;
        if ("base" in other)
            return this.base === other.base;
        return false;
    }
}
export let geoKind = [700, 750, 840, 850, 900, 1000];
