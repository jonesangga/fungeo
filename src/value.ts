// @jonesangga, 12-04-2025, MIT License.
//
// TODO: Think again about FG interface.

import { Chunk } from "./chunk.js"
import { Session } from "./vm.js"
import { FGType, Type, OverloadT, CallUserT, ListT, booleanT, numberT, stringT } from "./literal/type.js"
import Ellipse from "./geo/ellipse.js"
// import Picture from "./geo/picture.js"
import { Canvas } from "./ui/canvas.js"
import { Circle } from "./geo/circle.js"
import { Coord } from "./geo/coordinate.js"
import { Point } from "./geo/point.js"
import Rect from "./geo/rect.js"
import { FGColor } from "./literal/color.js"
import { Segment } from "./geo/segment.js"

export const enum Kind {
    Nothing    = 100,
    Any        = 200,
    Boolean    = 300,     // Literal.
    CallNative = 400,
    CallUser   = 450,
    Color      = 455,
    List       = 470,
    Method     = 480,
    Number     = 500,
    String     = 600,
    Struct     = 610,
    Type       = 650,
    Circle     = 700,     // Geometry.
    Coord      = 720,
    Ellipse    = 750,
    Picture    = 840,
    Point      = 850,
    Rect       = 900,
    Segment    = 1000,
    Canvas     = 2000,    // UI.
    Repl       = 2500,
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
    [Kind.Color]: "Color",
    [Kind.Coord]: "Coord",
    [Kind.Ellipse]: "Ellipse",
    [Kind.List]: "List",
    [Kind.Method]: "Method",
    [Kind.Nothing]: "Nothing",
    [Kind.Number]: "Number",
    [Kind.Picture]: "Picture",
    [Kind.Point]: "Point",
    [Kind.Rect]: "Rect",
    [Kind.Repl]: "Repl",
    [Kind.Segment]: "Segment",
    [Kind.String]: "String",
    [Kind.Struct]: "Struct",
    [Kind.Type]: "Type",
};

export type Repl = {
    kind:   Kind.Repl,
    to_str: () => string,
    place:  (x: number, y: number) => void,
    [name: string]: any,
};

// TODO: This is a hack to support Complex type. Clean up later.
export interface FGClass {
    to_str: () => string;
    typeof: () => FGType;
}

// TODO: This is a hack to support modules in extra/. Clean up later.
export interface GeoType {
    draw: () => void;
    to_str: () => string;
    typeof: () => FGType;
}

export interface FG {
    kind:   Kind;
    to_str: () => string;
    typeof: () => FGType;
}

export class FGBoolean implements FG {
    kind: Kind.Boolean = Kind.Boolean;

    constructor(
        public value: boolean
    ) {}

    to_str(): string {
        return this.value.toString();
    }

    typeof(): FGType {
        return new FGType(booleanT);
    }

    equal(other: FG): boolean {
        if (this.kind !== other.kind) return false;
        if ("value" in other) return this.value === other.value;
        return false;
    }
}

export class FGMethod implements FG {
    kind: Kind.Method = Kind.Method;

    constructor(public method: FGCallNative,
                public obj?:   Value) {}

    to_str(): string {
        return `Method ${ this.method.name }`;
    }

    typeof(): FGType {
        return new FGType(booleanT);
    }
}

export class FGCallNative implements FG {
    kind: Kind.CallNative = Kind.CallNative;

    constructor(public name:  string,
                public value: (session: Session, ver: number) => void,
                public sig:   OverloadT) {}

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

export class FGCallUser implements FG {
    kind: Kind.CallUser = Kind.CallUser;

    constructor(
        public name:   string,
        public input:  Type[],
        public output: Type,
        public chunk:  Chunk,
    ) {}

    to_str(): string {
        return `{fn ${ this.name }}`;
    }

    typeof(): FGType {
        return new FGType(new CallUserT(this.input, this.output));
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

    typeof(): FGType {
        return new FGType(stringT);
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

// TODO: move AddList implementation here.
export class FGList implements FG {
    kind: Kind.List = Kind.List;

    constructor(
        public value: Value[],
        public type: Type,
    ) {}

    to_str(): string {
        let str = "[";
        str += this.value.map(el => el.to_str()).join(",");
        return str + "]";
    }

    typeof(): FGType {
        return new FGType(new ListT(this.type));
    }

    // TODO: implement this.
    equal(other: FG): boolean {
        return false;
    }
}

export class FGStruct implements FG {
    kind: Kind.Struct = Kind.Struct;

    constructor(
        public members: { [key: string]: Value },
    ) {}

    to_str(): string {
        return "{" + Object.entries(this.members).map(([k, v]) => k + ":" + v.to_str()).join(", ") + "}";
    }

    // TODO: implement this.
    typeof(): FGType {
        return new FGType(booleanT);
    }

    // TODO: implement this.
    equal(other: FG): boolean {
        return false;
    }
}

type LitObj = FGBoolean | FGCallNative | FGCallUser | FGClass | FGMethod | FGNumber | FGString | FGType | FGList | FGStruct | FGColor;
type UIObj = Canvas | Repl;
export type GeoObj = Circle | Coord | Ellipse | Point | Rect | Segment | GeoType;
export type Value  = GeoObj | LitObj | UIObj;
export type Comparable = FGNumber | FGString;
