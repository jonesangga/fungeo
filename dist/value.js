import { FGType, CallUserT, ListT, booleanT, numberT, stringT } from "./literal/type.js";
export class FGBoolean {
    value;
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
        return (other instanceof FGBoolean) &&
            (this.value === other.value);
    }
}
export class FGMethod {
    method;
    obj;
    constructor(method, obj) {
        this.method = method;
        this.obj = obj;
    }
    to_str() {
        return `Method ${this.method.name}`;
    }
    typeof() {
        return new FGType(booleanT);
    }
}
export class FGCallNative {
    name;
    value;
    sig;
    constructor(name, value, sig) {
        this.name = name;
        this.value = value;
        this.sig = sig;
    }
    to_str() {
        return `{fn ${this.name}}`;
    }
    help() {
        return this.sig.help();
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
        return (other instanceof FGNumber) &&
            (this.value === other.value);
    }
}
export class FGString {
    value;
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
        return (other instanceof FGString) &&
            (this.value === other.value);
    }
}
export class FGList {
    value;
    type;
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
