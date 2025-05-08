// @jonesangga, 12-04-2025, MIT License.

export const enum Kind {
    Nothing = 100,
    Any = 200,
    Boolean = 300,    // Literal.
    Callable = 400,
    Number = 500,
    String = 600,
    Point = 700,      // Geometry.
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
    to_str(): string { return "fn(n: number): void"; }
}

export class FGNumber {
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
}

export class FGString {
    kind: Kind.String = Kind.String;
    constructor(public value: string) {}
    to_str(): string { return this.value; }
}

type LitObj = FGBoolean | FGNumber | FGString | FGCallable;
export type Value  = LitObj;
