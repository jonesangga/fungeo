import { FGCallNative } from "../value.js";
import { fishp, fishq, fishr, fishs } from "./fish.js";
import { pictureT, Picture } from "./picture.js";
import { FunctionT, OverloadT, nothingT, numberT } from "../literal/type.js";
function _Pic(session) {
    const w = session.pop().value;
    const h = session.pop().value;
    session.pop();
    session.push(new Picture(w, h));
}
const Pic = new FGCallNative("Pic", _Pic, new OverloadT([
    new FunctionT([numberT, numberT], pictureT, ["w", "h"]),
]));
function _Pic_add_segment(session) {
    const pic = session.pop();
    const y2 = session.pop().value;
    const x2 = session.pop().value;
    const y1 = session.pop().value;
    const x1 = session.pop().value;
    session.pop();
    session.push(pic.add_segment(x1, y1, x2, y2));
    if (pic.currentlyDrawn) {
        session.render();
    }
}
const Pic_add_segment = new FGCallNative("Pic_add_segment", _Pic_add_segment, new OverloadT([
    new FunctionT([numberT, numberT, numberT, numberT], pictureT, ["x1", "y1", "x2", "y2"]),
]));
function _Pic_place(session) {
    const pic = session.pop();
    const y = session.pop().value;
    const x = session.pop().value;
    session.pop();
    session.push(pic.place(x, y));
    if (pic.currentlyDrawn) {
        session.render();
    }
}
const Pic_place = new FGCallNative("Pic_place", _Pic_place, new OverloadT([
    new FunctionT([numberT, numberT], pictureT, ["x", "y"]),
]));
function _Pic_with_frame(session) {
    const pic = session.pop();
    session.pop();
    session.push(pic.with_frame());
    if (pic.currentlyDrawn) {
        session.render();
    }
}
const Pic_with_frame = new FGCallNative("Pic_with_frame", _Pic_with_frame, new OverloadT([
    new FunctionT([], pictureT, []),
]));
function _Pic_no_frame(session) {
    const pic = session.pop();
    session.pop();
    session.push(pic.no_frame());
    if (pic.currentlyDrawn) {
        session.render();
    }
}
const Pic_no_frame = new FGCallNative("Pic_no_frame", _Pic_no_frame, new OverloadT([
    new FunctionT([], pictureT, []),
]));
function _Pic_draw(session) {
    const pic = session.pop();
    session.pop();
    session.oncanvas.push(pic);
    session.render();
    pic.currentlyDrawn = true;
}
const Pic_draw = new FGCallNative("Pic_draw", _Pic_draw, new OverloadT([
    new FunctionT([], nothingT, []),
]));
function _Pic_resize(session) {
    const h = session.pop().value;
    const w = session.pop().value;
    const pic = session.pop();
    session.pop();
    session.push(Picture.resize(pic, w, h));
}
const Pic_resize = new FGCallNative("Pic_resize", _Pic_resize, new OverloadT([
    new FunctionT([pictureT, numberT, numberT], pictureT, ["from", "w", "h"]),
]));
function _Pic_ccw(session) {
    const pic = session.pop();
    session.pop();
    session.push(Picture.ccw(pic));
}
const Pic_ccw = new FGCallNative("Pic_ccw", _Pic_ccw, new OverloadT([
    new FunctionT([pictureT], pictureT, ["pic"]),
]));
function _Pic_quartet(session) {
    const s = session.pop();
    const r = session.pop();
    const q = session.pop();
    const p = session.pop();
    session.pop();
    session.push(Picture.quartet(p, q, r, s));
}
const Pic_quartet = new FGCallNative("Pic_quartet", _Pic_quartet, new OverloadT([
    new FunctionT([pictureT, pictureT, pictureT, pictureT], pictureT, ["p", "q", "r", "s"]),
]));
function _Pic_cycle(session) {
    const p = session.pop();
    session.pop();
    session.push(Picture.cycle(p));
}
const Pic_cycle = new FGCallNative("Pic_cycle", _Pic_cycle, new OverloadT([
    new FunctionT([pictureT], pictureT, ["pic"]),
]));
pictureT.methods["place"] = { type: Pic_place.sig, value: Pic_place };
pictureT.methods["add_segment"] = { type: Pic_add_segment.sig, value: Pic_add_segment };
pictureT.methods["draw"] = { type: Pic_draw.sig, value: Pic_draw };
pictureT.methods["no_frame"] = { type: Pic_no_frame.sig, value: Pic_no_frame };
pictureT.methods["with_frame"] = { type: Pic_with_frame.sig, value: Pic_with_frame };
pictureT.methods["resize"] = { type: Pic_resize.sig, value: Pic_resize };
pictureT.methods["quartet"] = { type: Pic_quartet.sig, value: Pic_quartet };
pictureT.methods["cycle"] = { type: Pic_cycle.sig, value: Pic_cycle };
pictureT.methods["ccw"] = { type: Pic_ccw.sig, value: Pic_ccw };
export const fishNames = {
    fishp: { type: pictureT, value: fishp },
    fishq: { type: pictureT, value: fishq },
    fishr: { type: pictureT, value: fishr },
    fishs: { type: pictureT, value: fishs },
    Pic: { type: Pic.sig, value: Pic },
};
