export class FGType {
    value;
    kind = 650;
    constructor(value) {
        this.value = value;
    }
    to_str() {
        return this.value.to_str();
    }
    typeof() {
        return this;
    }
    equal(other) {
        return false;
    }
}
export class NeverT {
    to_str() {
        return "Never";
    }
    equal(other) {
        return false;
    }
}
export class NothingT {
    to_str() {
        return "Nothing";
    }
    equal(other) {
        return other instanceof NothingT;
    }
}
export class AnyT {
    to_str() {
        return "Any";
    }
    equal(other) {
        return !(other instanceof NeverT) &&
            !(other instanceof NothingT);
    }
}
export class BooleanT {
    to_str() {
        return "Bool";
    }
    equal(other) {
        return other instanceof BooleanT;
    }
}
export class ColorT {
    to_str() {
        return "Color";
    }
    equal(other) {
        return other instanceof ColorT;
    }
}
export class ListT {
    elType;
    constructor(elType) {
        this.elType = elType;
    }
    to_str() {
        return this.elType.to_str() + "[]";
    }
    equal(other) {
        return other instanceof ListT
            && this.elType.equal(other.elType);
    }
}
export class StructT {
    members;
    constructor(members) {
        this.members = members;
    }
    to_str() {
        return "{" + Object.entries(this.members).map(([k, v]) => k + ":" + v.to_str()).join(", ") + "}";
    }
    equal(other) {
        if (!(other instanceof StructT))
            return false;
        let membersA = Object.keys(this.members);
        let membersB = Object.keys(other.members);
        if (membersA.length !== membersB.length)
            return false;
        for (let i = 0; i < membersA.length; i++) {
            if (!this.members[membersA[i]].equal(other.members[membersB[i]]))
                return false;
        }
        return true;
    }
}
export class TupleT {
    values;
    constructor(values) {
        this.values = values;
    }
    to_str() {
        return "[" + this.values.map(v => v.to_str()).join(", ") + "]";
    }
    equal(other) {
        return other instanceof ListT;
    }
}
export class UnionT {
    value;
    constructor(value) {
        this.value = value;
    }
    to_str() {
        return "(" + this.value.map(v => v.to_str()).join(" | ") + ")";
    }
    equal(other) {
        return this.value.some(val => val.equal(other));
    }
}
export class CallNativeT {
    input;
    output;
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }
    to_str() {
        let input = this.input.map(v => v.to_str()).join(" -> ");
        return input + " -> " + this.output.to_str();
    }
    equal(other) {
        return other instanceof CallNativeT;
    }
}
export class CallUserT {
    input;
    output;
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }
    to_str() {
        let input = this.input.map(v => {
            if (v instanceof CallUserT)
                return "(" + v.to_str() + ")";
            return v.to_str();
        }).join(" -> ");
        return input + " -> " + this.output.to_str();
    }
    equal(other) {
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
export class ComplexT {
    to_str() {
        return "Complex";
    }
    equal(other) {
        return other instanceof ComplexT;
    }
}
export class NumberT {
    to_str() {
        return "Num";
    }
    equal(other) {
        return other instanceof NumberT;
    }
}
export class StringT {
    to_str() {
        return "Str";
    }
    equal(other) {
        return other instanceof StringT;
    }
}
export class CircleT {
    to_str() {
        return "Circle";
    }
    equal(other) {
        return other instanceof CircleT;
    }
}
export class EllipseT {
    to_str() {
        return "Ellipse";
    }
    equal(other) {
        return other instanceof EllipseT;
    }
}
export class PictureT {
    to_str() {
        return "Picture";
    }
    equal(other) {
        return other instanceof PictureT;
    }
}
export class PointT {
    to_str() {
        return "Point";
    }
    equal(other) {
        return other instanceof PointT;
    }
}
export class RectT {
    to_str() {
        return "Rect";
    }
    equal(other) {
        return other instanceof RectT;
    }
}
export class SegmentT {
    to_str() {
        return "Segment";
    }
    equal(other) {
        return other instanceof SegmentT;
    }
}
export class CanvasT {
    to_str() {
        return "Canvas";
    }
    equal(other) {
        return other instanceof CanvasT;
    }
}
export class ReplT {
    to_str() {
        return "Repl";
    }
    equal(other) {
        return other instanceof ReplT;
    }
}
export const neverT = new NeverT();
export const nothingT = new NothingT();
export const anyT = new AnyT();
export const booleanT = new BooleanT();
export const colorT = new ColorT();
export const colorTVal = new FGType(colorT);
export const complexT = new ComplexT();
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
