// @jonesangga, 2025, MIT License.
//
// TODO: Implement the equal() method.
//       Test it.
//       Add AliasT for type alias.

import { type Value } from "../value.js";
import { FGCallNative } from "../value.js";

export class FGType implements Value {
    constructor(readonly value: Type) {}

    to_str(): string {
        return this.value.to_str();
    }

    typeof(): FGType {
        return this;
    }

    equal(other: Value): boolean {
        return false;
    }
}

export interface Type {
    equal:  (other: Type) => boolean;
    to_str: () => string;
}

export abstract class ClassT implements Type {
    abstract fields:  Record<string, Type>;
    abstract methods: Record<string, { type: Type, value: FGCallNative }>;
    abstract statics: Record<string, { type: Type, value: FGCallNative }>;
    abstract equal(other: Type): boolean;
    abstract to_str(): string;
}

export class NeverT implements Type {
    to_str(): string {
        return "Never";
    }
    equal(other: Type): boolean {
        return false;
    }
}

export class NothingT implements Type {
    to_str(): string {
        return "Nothing";
    }
    equal(other: Type): boolean {
        return other instanceof NothingT;
    }
}

export class AnyT implements Type {
    to_str(): string {
        return "Any";
    }
    equal(other: Type): boolean {
        return !(other instanceof NeverT) &&
            !(other instanceof NothingT);
    }
}

export class BooleanT implements Type {
    to_str(): string {
        return "Bool";
    }
    equal(other: Type): boolean {
        return other instanceof BooleanT;
    }
}

export class ColorT implements Type {
    to_str(): string {
        return "Color";
    }
    equal(other: Type): boolean {
        return other instanceof ColorT;
    }
}

export class ListT implements Type {
    constructor(readonly elType: Type) {}
    to_str(): string {
        return this.elType.to_str() + "[]";
    }
    equal(other: Type): boolean {
        return other instanceof ListT
            && this.elType.equal(other.elType);
    }
}

// export class StructT implements Type {
    // constructor(
        // // readonly memberT: Type[]
        // readonly members: { [key: string]: Type },
    // ) {}
    // to_str(): string {
        // return "{" + Object.entries(this.members).map(([k, v]) => k + ":" + v.to_str()).join(", ") + "}";
    // }
    // equal(other: Type): boolean {
        // if (!(other instanceof StructT))
            // return false;
        // let membersA = Object.keys(this.members);
        // let membersB = Object.keys(other.members);
        // if (membersA.length !== membersB.length)
            // return false;
        // for (let i = 0; i < membersA.length; i++) {
            // if (!this.members[membersA[i]].equal(other.members[membersB[i]]))
                // return false;
        // }
        // return true;
    // }
// }

// TODO: update to_str()
export class TupleT implements Type {
    constructor(readonly values: Type[]) {}
    to_str(): string {
        return "[" + this.values.map(v => v.to_str()).join(", ") + "]";
    }
    equal(other: Type): boolean {
        return other instanceof ListT;
    }
}

// TODO: update to_str()
export class UnionT implements Type {
    constructor(readonly value: Type[]) {}
    to_str(): string {
        if (this.value.length === 1) // No need parens.
            return this.value[0].to_str();
        else
            return "(" + this.value.map(v => v.to_str()).join(" | ") + ")";
    }
    equal(other: Type): boolean {
        return this.value.some(val => val.equal(other));
    }
}

export class FunctionT implements Type {
    constructor(readonly input:  Type[],
                readonly output: Type,
                readonly names:  string[])
    {
        // if (input.length !== names.length) {
            // throw new Error("input.length !== names.length");
        // }
    }

    to_str(): string {
        let input = this.input.map(v => v.to_str()).join(" -> ");
        return input + " -> " + this.output.to_str();
    }

    help(): string {
        let str = this.names.map((name, i) => name + ": " + this.input[i].to_str()).join(", ");
        str = "(" + str + "): "
        str = str + this.output.to_str() + "\n";
        return str;
    }

    equal(other: Type): boolean {
        return other instanceof FunctionT
            && this.input.length === other.input.length
            && this.input.every((param, i) => param.equal(other.input[i]))
            && this.output.equal(other.output);
    }
}

export class OverloadT implements Type {
    constructor(readonly sigs: FunctionT[]) {}

    // TODO: fix this.
    to_str(): string {
        // let input = this.input.map(v => v.to_str()).join(" -> ");
        // return input + " -> " + this.output.to_str();
        return "OverloadT, not implemented";
    }

    help(): string {
        return this.sigs.reduce((acc, curr, i) => acc + i + "> " + curr.help(), "");
    }

    // TODO: fix this.
    equal(other: Type): boolean {
        return false;
        // return other instanceof FunctionT
            // && this.input.every((inp, i) => inp.equal(other.input[i]))
            // && this.output.equal(other.output);
    }
}

export class CallUserT implements Type {
    constructor(readonly input:  Type[],
                readonly output: Type) {}

    to_str(): string {
        let input = this.input.map(v => {
            if (v instanceof CallUserT)
                return "(" + v.to_str() + ")";
            return v.to_str();
        }).join(" -> ");
        return input + " -> " + this.output.to_str();
    }
    equal(other: Type): boolean {
        if (!(other instanceof CallUserT))
            return false;
        if (this.input.length !== other.input.length)
            return false;
        for (let i = 0; i < this.input.length; i++)
            if (!this.input[i].equal(other.input[i]))
                return false;
        return this.output.equal(other.output);
    }
}

export class NumberT implements Type {
    to_str(): string {
        return "Num";
    }
    equal(other: Type): boolean {
        return other instanceof NumberT;
    }
}

export class StringT implements Type {
    to_str(): string {
        return "Str";
    }
    equal(other: Type): boolean {
        return other instanceof StringT;
    }
}

export class CircleT extends ClassT {
    fields: Record<string, Type> = {
        x: numberT,
        y: numberT,
        r: numberT,
    };
    methods: Record<string, { type: Type, value: FGCallNative }> = {};
    statics: Record<string, { type: Type, value: FGCallNative }> = {};
    to_str(): string {
        return "Circle";
    }
    equal(other: Type): boolean {
        return other instanceof CircleT;
    }
}

export class RichCircleT extends ClassT {
    fields: Record<string, Type> = {
        p: richPointT,
        q: richPointT,
    };
    methods: Record<string, { type: Type, value: FGCallNative }> = {};
    statics: Record<string, { type: Type, value: FGCallNative }> = {};
    to_str(): string {
        return "RichCircle";
    }
    equal(other: Type): boolean {
        return other instanceof RichCircleT;
    }
}

export class EllipseT implements Type {
    to_str(): string {
        return "Ellipse";
    }
    equal(other: Type): boolean {
        return other instanceof EllipseT;
    }
}

// export class PictureT implements Type {
    // to_str(): string {
        // return "Picture";
    // }
    // equal(other: Type): boolean {
        // return other instanceof PictureT;
    // }
// }

export class PointT extends ClassT {
    fields: Record<string, Type> = {
        x: numberT,
        y: numberT,
    };
    methods: Record<string, { type: Type, value: FGCallNative }> = {};
    statics: Record<string, { type: Type, value: FGCallNative }> = {};
    to_str(): string {
        return "Point";
    }
    equal(other: Type): boolean {
        return other instanceof PointT;
    }
}

export class RichPointT extends ClassT {
    fields: Record<string, Type> = {
        x: numberT,
        y: numberT,
    };
    methods: Record<string, { type: Type, value: FGCallNative }> = {};
    statics: Record<string, { type: Type, value: FGCallNative }> = {};
    to_str(): string {
        return "RichPoint";
    }
    equal(other: Type): boolean {
        return other instanceof RichPointT;
    }
}

export class RectT implements Type {
    to_str(): string {
        return "Rect";
    }
    equal(other: Type): boolean {
        return other instanceof RectT;
    }
}

export class SegmentT extends ClassT {
    fields: Record<string, Type> = {
        x1: numberT,
        y1: numberT,
        x2: numberT,
        y2: numberT,
    };
    methods: Record<string, { type: Type, value: FGCallNative }> = {};
    statics: Record<string, { type: Type, value: FGCallNative }> = {};
    to_str(): string {
        return "Segment";
    }
    equal(other: Type): boolean {
        return other instanceof SegmentT;
    }
}

export class RichSegmentT extends ClassT {
    fields: Record<string, Type> = {
        p: richPointT,
        q: richPointT,
    };
    methods: Record<string, { type: Type, value: FGCallNative }> = {};
    statics: Record<string, { type: Type, value: FGCallNative }> = {};
    to_str(): string {
        return "RichSegment";
    }
    equal(other: Type): boolean {
        return other instanceof RichSegmentT;
    }
}

export class CanvasT extends ClassT {
    fields: Record<string, Type> = {};
    methods: Record<string, { type: Type, value: FGCallNative }> = {};
    statics: Record<string, { type: Type, value: FGCallNative }> = {};
    to_str(): string {
        return "Canvas";
    }
    equal(other: Type): boolean {
        return other instanceof CanvasT;
    }
}

export class ReplT implements Type {
    to_str(): string {
        return "Repl";
    }
    equal(other: Type): boolean {
        return other instanceof ReplT;
    }
}

export const neverT = new NeverT();
export const nothingT = new NothingT();
export const anyT = new AnyT();
export const booleanT = new BooleanT();
export const colorT = new ColorT();
export const colorTVal = new FGType(colorT);
export const callUserT = new CallUserT([new AnyT()], new AnyT());
export const numberT = new NumberT();
export const stringT = new StringT();
export const circleT = new CircleT();
export const ellipseT = new EllipseT();
// export const pictureT = new PictureT();
export const pointT = new PointT();
export const richPointT = new RichPointT();
export const richCircleT = new RichCircleT();
export const rectT = new RectT();
export const segmentT = new SegmentT();
export const richSegmentT = new RichSegmentT();
export const canvasT = new CanvasT();
export const replT = new ReplT();

export const geoT = new UnionT([circleT, ellipseT, pointT, segmentT]);
