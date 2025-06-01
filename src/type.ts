// @jonesangga, 26-05-2025, MIT License.

export interface Type {
    equal:  (other: Type) => boolean;
    to_str: () => string;
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

// TODO: update to_str()
export class ListT implements Type {
    constructor(
        public elType: Type
    ) {}
    to_str(): string {
        return this.elType.to_str() + "[]";
    }
    equal(other: Type): boolean {
        return other instanceof ListT;
    }
}

// TODO: update to_str()
export class TupleT implements Type {
    constructor(
        public values: Type[]
    ) {}
    to_str(): string {
        return "[" + this.values.map(v => v.to_str()).join(", ") + "]";
    }
    equal(other: Type): boolean {
        return other instanceof ListT;
    }
}

// TODO: update to_str()
export class UnionT implements Type {
    constructor(
        public value: Type[]
    ) {}
    to_str(): string {
        // return "Union";
        return "(" + this.value.map(v => v.to_str()).join(" | ") + ")";
    }
    equal(other: Type): boolean {
        return this.value.some(val => val.equal(other));
    }
}

export class CallNativeT implements Type {
    constructor(
        public input: Type[],
        public output: Type
    ) {}
    to_str(): string {
        let input = this.input.map(v => v.to_str()).join(" -> ");
        return input + " -> " + this.output.to_str();
    }
    equal(other: Type): boolean {
        return other instanceof CallNativeT;
    }
}

export class CallUserT implements Type {
    constructor(
        public input: Type[],
        public output: Type
    ) {}
    to_str(): string {
        let input = this.input.map(v => v.to_str()).join(" -> ");
        return input + " -> " + this.output.to_str();
    }
    equal(other: Type): boolean {
        return other instanceof CallUserT;
    }
}

export class ComplexT implements Type {
    to_str(): string {
        return "Complex";
    }
    equal(other: Type): boolean {
        return other instanceof ComplexT;
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

export class CircleT implements Type {
    to_str(): string {
        return "Circle";
    }
    equal(other: Type): boolean {
        return other instanceof CircleT;
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

export class PictureT implements Type {
    to_str(): string {
        return "Picture";
    }
    equal(other: Type): boolean {
        return other instanceof PictureT;
    }
}

export class PointT implements Type {
    to_str(): string {
        return "Point";
    }
    equal(other: Type): boolean {
        return other instanceof PointT;
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

export class SegmentT implements Type {
    to_str(): string {
        return "Segment";
    }
    equal(other: Type): boolean {
        return other instanceof SegmentT;
    }
}

export class CanvasT implements Type {
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
export const callNativeT = new CallNativeT([new AnyT()], new AnyT());
export const callUserT = new CallUserT([new AnyT()], new AnyT());
export const numberT = new NumberT();
export const stringT = new StringT();
export const circleT = new CircleT();
export const ellipseT = new EllipseT();
export const pictureT = new PictureT();
export const pointT = new PointT();
export const rectT = new RectT();
export const segmentT = new SegmentT();
export const canvasT = new CanvasT();
export const replT = new ReplT();

export const geoT = new UnionT([circleT, ellipseT, pictureT, pointT, rectT, segmentT]);
export const fillableT = new UnionT([circleT, ellipseT, rectT]);
