export var Kind;
(function (Kind) {
    Kind[Kind["Nothing"] = 0] = "Nothing";
    Kind[Kind["Any"] = 1] = "Any";
    Kind[Kind["Boolean"] = 2] = "Boolean";
    Kind[Kind["Callable"] = 3] = "Callable";
    Kind[Kind["Number"] = 4] = "Number";
    Kind[Kind["String"] = 5] = "String";
    Kind[Kind["Point"] = 6] = "Point";
})(Kind || (Kind = {}));
;
export const KindName = {
    [1]: "Any",
    [2]: "Boolean",
    [3]: "Callable",
    [0]: "Nothing",
    [4]: "Number",
    [6]: "Point",
    [5]: "String",
};
export class FGBoolean {
    value;
    kind = 2;
    constructor(value) {
        this.value = value;
    }
    to_str() { return this.value.toString(); }
}
export class FGCallable {
    value;
    kind = 3;
    constructor(value) {
        this.value = value;
    }
    to_str() { return "fn(n: number): void"; }
}
export class FGNumber {
    value;
    kind = 4;
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
}
export class FGString {
    value;
    kind = 5;
    constructor(value) {
        this.value = value;
    }
    to_str() { return this.value; }
}
