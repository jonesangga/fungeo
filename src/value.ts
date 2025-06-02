// @jonesangga, 12-04-2025, MIT License.
//
// TODO: Think again about FG interface.

import { Chunk } from "./chunk.js"
import { Type, CallNativeT, CallUserT, ListT, booleanT, numberT, stringT, complexT, StructT } from "./type.js"
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
    Complex  = 460,
    Curry    = 465,
    List     = 470,
    Number   = 500,
    String   = 600,
    Struct   = 610,
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
    [Kind.Complex]: "Complex",
    [Kind.Curry]: "Curry",
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
    [Kind.Struct]: "Struct",
    [Kind.Type]: "Type",
};

export type Canvas = {
    kind:   Kind.Canvas,
    to_str: () => string,
    resize: (w: number, h: number) => void,
    place:  (x: number, y: number) => void,
    clear:  () => void,
    typeof: () => FGType;
};

export type Repl = {
    kind:   Kind.Repl,
    to_str: () => string,
    place:  (x: number, y: number) => void,
    [name: string]: any,
};

export interface FG {
    kind:     Kind;
    to_str(): string;
    typeof:   () => FGType;
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

export const enum CallT {
    Function,
    Procedure,
};

export class FGCallNative implements FG {
    kind: Kind.CallNative = Kind.CallNative;

    constructor(
        public name:     string,
        public callType: CallT,
        public value:    () => void,
        public input:    Type[],
        public output:   Type
    ) {}

    to_str(): string {
        if (this.callType === CallT.Function)
            return `{fn ${ this.name }}`;
        else
            return `{proc ${ this.name }}`;
    }

    typeof(): FGType {
        return new FGType(new CallNativeT(this.input, this.output));
    }

    equal(other: FG) {
        return false;
    }
}

export class FGCallUser implements FG {
    kind: Kind.CallUser = Kind.CallUser;

    constructor(
        public name:     string,
        public callType: CallT,
        public input:    Type[],
        public output:   Type,
        public chunk:    Chunk,
    ) {}

    to_str(): string {
        if (this.callType === CallT.Function)
            return `{fn ${ this.name }}`;
        else
            return `{proc ${ this.name }}`;
    }

    typeof(): FGType {
        return new FGType(new CallUserT(this.input, this.output));
    }

    equal(other: FG) {
        return false;
    }
}

export class FGCurry implements FG {
    kind: Kind.Curry = Kind.Curry;

    constructor(
        public name: string,
        public fn: FGCallNative,
        public args: Value[]
    ) {}

    to_str(): string {
        return `{curry ${ this.name }}`;
    }

    typeof(): FGType {
        return new FGType(new CallUserT(this.fn.input.slice(this.args.length), this.fn.output));
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

export class FGComplex implements FG {
    kind: Kind.Complex = Kind.Complex;

    constructor(
        public a: number,
        public b: number
    ) {}

    to_str(): string {
        return `${ this.a }+${ this.b }i`;
    }

    typeof(): FGType {
        return new FGType(complexT);
    }

    add(other: FGComplex): FGComplex {
        return new FGComplex(this.a + other.a, this.b + other.b);
    }
    sub(other: FGComplex): FGComplex {
        return new FGComplex(this.a - other.a, this.b - other.b);
    }
    scale(value: number): FGComplex {
        return new FGComplex(this.a * value, this.b * value);
    }
    mul(other: FGComplex): FGComplex {
        let a = this.a * other.a - this.b * other.b;
        let b = this.a * other.b + other.a * this.b;
        return new FGComplex(a, b);
    }
    sqrt() {
        // Convert to polar form
        let m = Math.sqrt(this.a * this.a + this.b * this.b);
        let angle = Math.atan2(this.b, this.a);
        // Calculate square root of magnitude and use half the angle for square root
        m = Math.sqrt(m);
        angle = angle / 2;
        // Back to rectangular form
        return new FGComplex(m * Math.cos(angle), m * Math.sin(angle));
    }
    equal(other: FG): boolean {
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

export class FGType implements FG {
    kind: Kind.Type = Kind.Type;

    constructor(
        public value: Type
    ) {}

    to_str(): string {
        return this.value.to_str();
    }

    typeof(): FGType {
        return this;
    }

    equal(other: FG): boolean {
        return false;
    }
}

// TODO: move AddList implementation here.
export class FGList implements FG {
    kind: Kind.List = Kind.List;
    length: number;

    constructor(
        public value: Value[],
        public type: Type,
    ) {
        this.length = value.length;
    }

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

// export class FGStruct implements FG {
    // kind: Kind.Struct = Kind.Struct;

    // constructor(
        // public members: { [key: string]: Value },
    // ) {}

    // to_str(): string {
        // return "struct";
    // }

    // // TODO: implement this.
    // typeof(): FGType {
        // return new FGType(new StructT(Object.values(this.members).map(m => m.typeof())));
    // }

    // // TODO: implement this.
    // equal(other: FG): boolean {
        // return false;
    // }
// }

type LitObj = FGBoolean | FGCallNative | FGCallUser | FGCurry | FGNumber | FGString | FGType | FGList;
type UIObj = Canvas | Repl;
export type GeoObj = Circle | Ellipse | Picture | Point | Rect | Segment;
export type Fillable = Circle | Ellipse | Rect;
export type Value  = GeoObj | LitObj | UIObj;
export type Comparable = FGNumber | FGString;
