// @jonesangga, 12-04-2025, MIT License.

import { Chunk } from "./chunk.js"

export const enum Kind {
    Nothing = 100,
    Any = 200,
    Boolean = 300,    // Literal.
    Callable = 400,
    Function = 450,
    Number = 500,
    String = 600,
    Type = 650,
    Point = 700,      // Geometry.
};

export const KindName: { [key in Kind]: string } = {
    [Kind.Any]: "Any",
    [Kind.Boolean]: "Boolean",
    [Kind.Callable]: "Callable",
    [Kind.Function]: "Function",
    [Kind.Nothing]: "Nothing",
    [Kind.Number]: "Number",
    [Kind.Point]: "Point",
    [Kind.String]: "String",
    [Kind.Type]: "Type",
};

interface FG {
    kind: Kind;
    to_str(): string;
    equal(other: FG): boolean;
}

export class FGBoolean implements FG {
    kind: Kind.Boolean = Kind.Boolean;
    constructor(public value: boolean) {}
    to_str(): string { return this.value.toString(); }
    equal(other: FG): boolean {
        if (this.kind !== other.kind) return false;
        if ("value" in other)
            return this.value === other.value;
        return false;
    }
}

export interface Version {
    input:   (Set<number> | Kind)[];
    output:  Kind;
}

export class FGCallable implements FG {
    kind: Kind.Callable = Kind.Callable;
    constructor(
        public name: string,
        public value: (n: number) => void,
        public version: Version[]
    ) {}

    to_str(): string { return "fn(n: number): void"; }
    equal(other: FG) { return false; }
}

export class FGFunction implements FG {
    kind: Kind.Function = Kind.Function;
    constructor(
        public name: string,
        public version: Version[],
        public chunk: Chunk,
    ) {}

    to_str(): string {
        return `fn ${this.name}`;
    }
    equal(other: FG) { return false; }
}

export class FGNumber implements FG {
    kind: Kind.Number = Kind.Number;
    constructor(public value: number) {}
    to_str(): string { return this.value + ""; }

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
    equal(other: FG): boolean {
        if (this.kind !== other.kind) return false;
        if ("value" in other)
            return this.value === other.value;
        return false;
    }
}

export class FGString implements FG {
    kind: Kind.String = Kind.String;
    constructor(public value: string) {}
    to_str(): string { return this.value; }

    add(other: FGString): FGString {
        return new FGString(this.value + other.value);
    }
    equal(other: FG): boolean {
        if (this.kind !== other.kind) return false;
        if ("value" in other)
            return this.value === other.value;
        return false;
    }
}

export class FGType implements FG {
    kind: Kind.Type = Kind.Type;
    constructor(public base: Kind) {}
    to_str(): string { return KindName[this.base]; }
    equal(other: FG): boolean {
        if (this.kind !== other.kind) return false;
        if ("base" in other)
            return this.base === other.base;
        return false;
    }
}

type LitObj = FGBoolean | FGNumber | FGString | FGCallable | FGType | FGFunction;
export type Value  = LitObj;
export type Comparable = FGNumber | FGString;
