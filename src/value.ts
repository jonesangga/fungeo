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
    CallNative = 400,
    CallUser = 450,
    List     = 470,
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
    [Kind.CallNative]: "CallNative",
    [Kind.CallUser]: "CallUser",
    [Kind.Canvas]: "Canvas",
    [Kind.Circle]: "Circle",
    [Kind.Ellipse]: "Ellipse",
    [Kind.List]: "List",
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

export const enum CallT {
    Function,
    Procedure,
};

export class FGCallNative implements FG {
    kind: Kind.CallNative = Kind.CallNative;

    constructor(
        public name: string,
        public callType: CallT,
        public value: (n: number) => void,
        public version: Version[]
    ) {}

    to_str(): string {
        if (this.callType === CallT.Function)
            return `{fn ${ this.name }}`;
        else
            return `{proc ${ this.name }}`;
    }

    equal(other: FG) {
        return false;
    }
}

export class FGCallUser implements FG {
    kind: Kind.CallUser = Kind.CallUser;

    constructor(
        public name: string,
        public callType: CallT,
        public version: Version[],
        public chunk: Chunk,
    ) {}

    to_str(): string {
        if (this.callType === CallT.Function)
            return `{fn ${ this.name }}`;
        else
            return `{proc ${ this.name }}`;
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

export class FGList<K extends Kind> implements FG {
    kind: Kind.List = Kind.List;
    length: number;

    constructor(
        public value: Extract<Value, {kind: K}>[],
        public elKind: K,
    ) {
        this.length = value.length;
    }

    to_str(): string {
        let str = "[";
        str += this.value.map(el => el.to_str()).join(",");
        return str + "]";
    }
    // add<S extends Kind>(other: FGList<S>): FGList<Kind.Number> {
        // // return new FGList<K>([...this.value, ...other.value], this.elKind);
        // return new FGList<Kind.Number>([], Kind.Number);
    // }

    // TODO: implement this.
    equal(other: FG): boolean {
        return false;
    }
}

export type List = FGList<Kind>;
type LitObj = FGBoolean | FGCallNative | FGCallUser | FGNumber | FGString | FGType | List;
type UIObj = Canvas | Repl;
export type GeoObj = Circle | Ellipse | Picture | Point | Rect | Segment;
export type Value  = GeoObj | LitObj | UIObj;
export type Comparable = FGNumber | FGString;

// This is used for Callable's input types. See Version type in value.ts.
export let geoKind = [Kind.Circle, Kind.Ellipse, Kind.Picture, Kind.Point, Kind.Rect, Kind.Segment];
