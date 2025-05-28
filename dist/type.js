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
export class ListT {
    elType;
    constructor(elType) {
        this.elType = elType;
    }
    to_str() {
        return this.elType.to_str() + "[]";
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
        return "Union";
    }
    equal(other) {
        return this.value.some(val => val.equal(other));
    }
}
export class CallNativeT {
    to_str() {
        return "CallNative";
    }
    equal(other) {
        return other instanceof CallNativeT;
    }
}
export class CallUserT {
    to_str() {
        return "CallUser";
    }
    equal(other) {
        return other instanceof CallUserT;
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
export const callNativeT = new CallNativeT();
export const callUserT = new CallUserT();
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
