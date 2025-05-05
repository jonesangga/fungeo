// @jonesangga, 12-04-2025, MIT License.

export const enum Kind {
    Nothing,
    Any,
    Boolean,    // Literal.
    Callable,
    Number,
    String,
    Point,      // Geometry.
};

export const KindName: { [key in Kind]: string } = {
    [Kind.Any]: "Any",
    [Kind.Boolean]: "Boolean",
    [Kind.Callable]: "Callable",
    [Kind.Nothing]: "Nothing",
    [Kind.Number]: "Number",
    [Kind.Point]: "Point",
    [Kind.String]: "String",
};

export class FGBoolean {
    kind: Kind.Boolean = Kind.Boolean;
    constructor(public value: boolean) {}
    to_str(): string { return this.value.toString(); }
}

export class FGCallable {
    kind: Kind.Callable = Kind.Callable;
    constructor(public value: (n: number) => void) {}
    to_str(): string { return this.value.toString(); }
}

export class FGNumber {
    kind: Kind.Number = Kind.Number;
    constructor(public value: number) {}
    to_str(): string { return this.value + ""; }
}

export class FGString {
    kind: Kind.String = Kind.String;
    constructor(public value: string) {}
    to_str(): string { return this.value; }
}

type LitObj = FGBoolean | FGNumber | FGString | FGCallable;
export type Value  = LitObj;
