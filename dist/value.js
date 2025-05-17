export var Kind;
(function (Kind) {
    Kind[Kind["Nothing"] = 100] = "Nothing";
    Kind[Kind["Any"] = 200] = "Any";
    Kind[Kind["Boolean"] = 300] = "Boolean";
    Kind[Kind["Callable"] = 400] = "Callable";
    Kind[Kind["Function"] = 450] = "Function";
    Kind[Kind["Number"] = 500] = "Number";
    Kind[Kind["String"] = 600] = "String";
    Kind[Kind["Type"] = 650] = "Type";
    Kind[Kind["Point"] = 700] = "Point";
})(Kind || (Kind = {}));
;
export const KindName = {
    [200]: "Any",
    [300]: "Boolean",
    [400]: "Callable",
    [450]: "Function",
    [100]: "Nothing",
    [500]: "Number",
    [700]: "Point",
    [600]: "String",
    [650]: "Type",
};
export class FGBoolean {
    value;
    kind = 300;
    constructor(value) {
        this.value = value;
    }
    to_str() { return this.value.toString(); }
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
    to_str() { return "fn(n: number): void"; }
    equal(other) { return false; }
}
export class FGFunction {
    name;
    version;
    chunk;
    kind = 450;
    constructor(name, version, chunk) {
        this.name = name;
        this.version = version;
        this.chunk = chunk;
    }
    to_str() {
        return `fn ${this.name}`;
    }
    equal(other) { return false; }
}
export class FGNumber {
    value;
    kind = 500;
    constructor(value) {
        this.value = value;
    }
    to_str() { return this.value + ""; }
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
    to_str() { return this.value; }
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
    to_str() { return KindName[this.base]; }
    equal(other) {
        if (this.kind !== other.kind)
            return false;
        if ("base" in other)
            return this.base === other.base;
        return false;
    }
}
