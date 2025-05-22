// @jonesangga, 12-04-2025, MIT License.
//
// TODO: Think again about FG interface.

import { Chunk } from "./chunk.js"
import Circle from "./geo/circle.js"
import Ellipse from "./geo/ellipse.js"
import Picture from "./geo/picture.js"
import Point from "./geo/point.js"
import Rect from "./geo/rect.js"
import Segment from "./geo/segment.js"

export const enum Kind {
    Nothing  = 100,
    Any      = 200,
    Boolean  = 300,     // Literal.
    Callable = 400,
    Function = 450,
    Number   = 500,
    String   = 600,
    Type     = 650,
    Circle   = 700,     // Geometry.
    Ellipse  = 750,
    Picture  = 840,
    Point    = 850,
    Rect     = 900,
    Segment  = 1000,
    Canvas   = 2000,    // UI.
    Repl     = 2500,
};

export const KindName: {
    [N in (keyof typeof Kind) as (typeof Kind)[N]]: N
} = {
    [Kind.Any]: "Any",
    [Kind.Boolean]: "Boolean",
    [Kind.Callable]: "Callable",
    [Kind.Canvas]: "Canvas",
    [Kind.Circle]: "Circle",
    [Kind.Ellipse]: "Ellipse",
    [Kind.Function]: "Function",
    [Kind.Nothing]: "Nothing",
    [Kind.Number]: "Number",
    [Kind.Picture]: "Picture",
    [Kind.Point]: "Point",
    [Kind.Rect]: "Rect",
    [Kind.Repl]: "Repl",
    [Kind.Segment]: "Segment",
    [Kind.String]: "String",
    [Kind.Type]: "Type",
};

export type Canvas = {
    kind:   Kind.Canvas,
    to_str: () => string,
    resize: (w: number, h: number) => void,
    place:  (x: number, y: number) => void,
    clear:  () => void,
};

export type Repl = {
    kind:   Kind.Repl,
    to_str: () => string,
    place:  (x: number, y: number) => void,
    [name: string]: any,
};

export interface FG {
    kind: Kind;
    to_str(): string;
}

export class FGBoolean implements FG {
    kind: Kind.Boolean = Kind.Boolean;

    constructor(
        public value: boolean
    ) {}

    to_str(): string {
        return this.value.toString();
    }

    equal(other: FG): boolean {
        if (this.kind !== other.kind) return false;
        if ("value" in other) return this.value === other.value;
        return false;
    }
}

export type Version = {
    input:  (Kind[] | Kind)[],
    output: Kind,
};

export class FGCallable implements FG {
    kind: Kind.Callable = Kind.Callable;

    constructor(
        public name: string,
        public value: (n: number) => void,
        public version: Version[]
    ) {}

    to_str(): string {
        return `<fn ${ this.name }>`;
    }

    equal(other: FG) {
        return false;
    }
}

export class FGFunction implements FG {
    kind: Kind.Function = Kind.Function;

    constructor(
        public name: string,
        public version: Version[],
        public chunk: Chunk,
    ) {}

    to_str(): string {
        return `<fn ${ this.name }>`;
    }

    equal(other: FG) {
        return false;
    }
}

export class FGNumber implements FG {
    kind: Kind.Number = Kind.Number;

    constructor(
        public value: number
    ) {}

    to_str(): string {
        return this.value + "";
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
    equal(other: FG): boolean {
        if (this.kind !== other.kind) return false;
        if ("value" in other) return this.value === other.value;
        return false;
    }
}

export class FGString implements FG {
    kind: Kind.String = Kind.String;

    constructor(
        public value: string
    ) {}

    to_str(): string {
        return this.value;
    }

    add(other: FGString): FGString {
        return new FGString(this.value + other.value);
    }
    equal(other: FG): boolean {
        if (this.kind !== other.kind) return false;
        if ("value" in other) return this.value === other.value;
        return false;
    }
}

export class FGType implements FG {
    kind: Kind.Type = Kind.Type;

    constructor(
        public base: Kind
    ) {}

    to_str(): string {
        return KindName[this.base];
    }

    equal(other: FG): boolean {
        if (this.kind !== other.kind) return false;
        if ("base" in other) return this.base === other.base;
        return false;
    }
}

type LitObj = FGBoolean | FGCallable | FGFunction | FGNumber | FGString | FGType;
type UIObj = Canvas | Repl;
export type GeoObj = Circle | Ellipse | Picture | Point | Rect | Segment;
export type Value  = GeoObj | LitObj | UIObj;
export type Comparable = FGNumber | FGString;

// This is used for Callable's input types. See Version type in value.ts.
export let geoKind = [Kind.Circle, Kind.Ellipse, Kind.Picture, Kind.Point, Kind.Rect, Kind.Segment];
