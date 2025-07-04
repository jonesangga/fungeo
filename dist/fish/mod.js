import { FGCallNative } from "../value.js";
import { fishp, fishq, fishr, fishs } from "./fish.js";
import { pictureT, Picture } from "./picture.js";
import { FunctionT, OverloadT, nothingT, numberT } from "../literal/type.js";
function _Pic(session) {
    let w = session.pop().value;
    let h = session.pop().value;
    session.pop();
    session.push(new Picture(w, h));
}
let Pic = new FGCallNative("Pic", _Pic, new OverloadT([
    new FunctionT([numberT, numberT], pictureT, ["w", "h"]),
]));
function _Pic_add_segment(session) {
    let pic = session.pop();
    let y2 = session.pop().value;
    let x2 = session.pop().value;
    let y1 = session.pop().value;
    let x1 = session.pop().value;
    session.pop();
    session.push(pic.add_segment(x1, y1, x2, y2));
    if (pic.drawn) {
        session.render();
    }
}
let Pic_add_segment = new FGCallNative("Pic_add_segment", _Pic_add_segment, new OverloadT([
    new FunctionT([numberT, numberT, numberT, numberT], pictureT, ["x1", "y1", "x2", "y2"]),
]));
function _Pic_place(session) {
    let pic = session.pop();
    let y = session.pop().value;
    let x = session.pop().value;
    session.pop();
    session.push(pic.place(x, y));
    if (pic.drawn) {
        session.render();
    }
}
let Pic_place = new FGCallNative("Pic_place", _Pic_place, new OverloadT([
    new FunctionT([numberT, numberT], pictureT, ["x", "y"]),
]));
function _Pic_draw(session) {
    let pic = session.pop();
    session.pop();
    session.oncanvas.push(pic);
    session.render();
    pic.drawn = true;
}
let Pic_draw = new FGCallNative("Pic_draw", _Pic_draw, new OverloadT([
    new FunctionT([], nothingT, []),
]));
function _Pic_resize(session) {
    let h = session.pop().value;
    let w = session.pop().value;
    let pic = session.pop();
    session.pop();
    session.push(Picture.resize(pic, w, h));
}
let Pic_resize = new FGCallNative("Pic_resize", _Pic_resize, new OverloadT([
    new FunctionT([pictureT, numberT, numberT], pictureT, ["from", "w", "h"]),
]));
function _Pic_rot(session) {
    let pic = session.pop();
    session.pop();
    session.push(pic.rot());
}
let Pic_rot = new FGCallNative("Pic_rot", _Pic_rot, new OverloadT([
    new FunctionT([pictureT], pictureT, ["pic"]),
]));
function _Pic_quartet(session) {
    let s = session.pop();
    let r = session.pop();
    let q = session.pop();
    let p = session.pop();
    session.pop();
    session.push(Picture.quartet(p, q, r, s));
}
let Pic_quartet = new FGCallNative("Pic_quartet", _Pic_quartet, new OverloadT([
    new FunctionT([pictureT, pictureT, pictureT, pictureT], pictureT, ["p", "q", "r", "s"]),
]));
function _Pic_cycle(session) {
    let p = session.pop();
    session.pop();
    session.push(Picture.cycle(p));
}
let Pic_cycle = new FGCallNative("Pic_cycle", _Pic_cycle, new OverloadT([
    new FunctionT([pictureT], pictureT, ["pic"]),
]));
pictureT.methods["place"] = { type: Pic_place.sig, value: Pic_place };
pictureT.methods["add_segment"] = { type: Pic_add_segment.sig, value: Pic_add_segment };
pictureT.methods["draw"] = { type: Pic_draw.sig, value: Pic_draw };
pictureT.methods["resize"] = { type: Pic_resize.sig, value: Pic_resize };
pictureT.methods["quartet"] = { type: Pic_quartet.sig, value: Pic_quartet };
pictureT.methods["cycle"] = { type: Pic_cycle.sig, value: Pic_cycle };
pictureT.methods["rot"] = { type: Pic_rot.sig, value: Pic_rot };
export let modNames = {
    fishp: { type: pictureT, value: fishp },
    fishq: { type: pictureT, value: fishq },
    fishr: { type: pictureT, value: fishr },
    fishs: { type: pictureT, value: fishs },
    Pic: { type: Pic.sig, value: Pic },
};
