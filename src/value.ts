// @jonesangga, 12-04-2025, MIT License.

import { Chunk } from "./chunk.js"
import { Session } from "./vm.js"
import { FGType, Type, OverloadT, CallUserT, ListT, booleanT, numberT, stringT } from "./literal/type.js"

export interface Value {
    to_str(): string;
    typeof(): FGType;
}

export interface GeoObj extends Value {
    draw(): void;
}

export class FGBoolean implements Value {
    constructor(public value: boolean) {}

    to_str(): string {
        return this.value.toString();
    }

    typeof(): FGType {
        return new FGType(booleanT);
    }

    equal(other: Value): boolean {
        return (other instanceof FGBoolean) &&
               (this.value === other.value);
    }
}

export class FGMethod implements Value {
    constructor(readonly method: FGCallNative,
                readonly obj?:   Value) {}

    to_str(): string {
        return `Method ${ this.method.name }`;
    }

    typeof(): FGType {
        return new FGType(booleanT);
    }
}

export class FGCallNative implements Value {
    constructor(readonly name:  string,
                readonly value: (session: Session, ver: number) => void,
                readonly sig:   OverloadT) {}

    to_str(): string {
        return `{fn ${ this.name }}`;
    }

    help(): string {
        return this.sig.help();
    }

    typeof(): FGType {
        return new FGType(this.sig);
    }
}

export class FGCallUser implements Value {
    constructor(readonly name:   string,
                readonly input:  Type[],
                readonly output: Type,
                readonly chunk:  Chunk) {}

    to_str(): string {
        return `{fn ${ this.name }}`;
    }

    typeof(): FGType {
        return new FGType(new CallUserT(this.input, this.output));
    }
}

export class FGNumber implements Value {
    constructor(public value: number) {}

    to_str(): string {
        return this.value + "";
    }

    typeof(): FGType {
        return new FGType(numberT);
    }

    add(other: FGNumber): FGNumber {
        return new FGNumber(this.value + other.value);
    }
    div(other: FGNumber): FGNumber {
        return new FGNumber(this.value / other.value);
    }
    mul(other: FGNumber): FGNumber {
        return new FGNumber(this.value * other.value);
    }
    sub(other: FGNumber): FGNumber {
        return new FGNumber(this.value - other.value);
    }
    equal(other: Value): boolean {
        return (other instanceof FGNumber) &&
               (this.value === other.value);
    }
}

export class FGString implements Value {
    constructor(readonly value: string) {}

    to_str(): string {
        return this.value;
    }

    typeof(): FGType {
        return new FGType(stringT);
    }

    add(other: FGString): FGString {
        return new FGString(this.value + other.value);
    }
    equal(other: Value): boolean {
        return (other instanceof FGString) &&
               (this.value === other.value);
    }
}

// TODO: move AddList implementation here.
export class FGList implements Value {
    constructor(readonly value: Value[],
                readonly type:  Type) {}

    to_str(): string {
        let str = "[";
        str += this.value.map(el => el.to_str()).join(",");
        return str + "]";
    }

    typeof(): FGType {
        return new FGType(new ListT(this.type));
    }

    // TODO: implement this.
    equal(other: Value): boolean {
        return false;
    }
}

export class FGStruct implements Value {
    constructor(readonly members: Record<string, Value>) {}

    to_str(): string {
        return "{" + Object.entries(this.members).map(([k, v]) => k + ":" + v.to_str()).join(", ") + "}";
    }

    // TODO: implement this.
    typeof(): FGType {
        return new FGType(booleanT);
    }

    // TODO: implement this.
    equal(other: Value): boolean {
        return false;
    }
}

export type Comparable = FGNumber | FGString;
