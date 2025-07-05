import { Session } from "../vm.js"
import { FGCallNative, FGNumber } from "../value.js"
import { fishp, fishq, fishr, fishs } from "./fish.js"
import { pictureT, Picture } from "./picture.js"
import { type Names } from "../vmfunction.js"
import { FunctionT, OverloadT,
         nothingT, numberT } from "../literal/type.js"

function _Pic(session: Session): void {
    const w = (session.pop() as FGNumber).value;
    const h = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(new Picture(w, h));
}
const Pic = new FGCallNative("Pic", _Pic,
    new OverloadT([
        new FunctionT([numberT, numberT], pictureT, ["w", "h"]),
    ])
);

function _Pic_add_segment(session: Session): void {
    const pic = session.pop() as Picture;
    const y2 = (session.pop() as FGNumber).value;
    const x2 = (session.pop() as FGNumber).value;
    const y1 = (session.pop() as FGNumber).value;
    const x1 = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(pic.add_segment(x1, y1, x2, y2));

    if (pic.currentlyDrawn) {
        session.render();
    }
}
const Pic_add_segment = new FGCallNative("Pic_add_segment", _Pic_add_segment,
    new OverloadT([
        new FunctionT([numberT, numberT, numberT, numberT], pictureT, ["x1", "y1", "x2", "y2"]),
    ])
);

function _Pic_place(session: Session): void {
    const pic = session.pop() as Picture;
    const y = (session.pop() as FGNumber).value;
    const x = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(pic.place(x, y));

    if (pic.currentlyDrawn) {
        session.render();
    }
}
const Pic_place = new FGCallNative("Pic_place", _Pic_place,
    new OverloadT([
        new FunctionT([numberT, numberT], pictureT, ["x", "y"]),
    ])
);

function _Pic_with_frame(session: Session): void {
    const pic = session.pop() as Picture;
    session.pop(); // The function.
    session.push(pic.with_frame());

    if (pic.currentlyDrawn) {
        session.render();
    }
}
const Pic_with_frame = new FGCallNative("Pic_with_frame", _Pic_with_frame,
    new OverloadT([
        new FunctionT([], pictureT, []),
    ])
);

function _Pic_no_frame(session: Session): void {
    const pic = session.pop() as Picture;
    session.pop(); // The function.
    session.push(pic.no_frame());

    if (pic.currentlyDrawn) {
        session.render();
    }
}
const Pic_no_frame = new FGCallNative("Pic_no_frame", _Pic_no_frame,
    new OverloadT([
        new FunctionT([], pictureT, []),
    ])
);

function _Pic_draw(session: Session): void {
    const pic = session.pop() as Picture;
    session.pop(); // The function.
    session.oncanvas.push(pic);
    session.render();
    pic.currentlyDrawn = true;
}
const Pic_draw = new FGCallNative("Pic_draw", _Pic_draw,
    new OverloadT([
        new FunctionT([], nothingT, []),
    ])
);

function _Pic_resize(session: Session): void {
    const h = (session.pop() as FGNumber).value;
    const w = (session.pop() as FGNumber).value;
    const pic = session.pop() as Picture;
    session.pop(); // The function.
    session.push(Picture.resize(pic, w, h));
}
const Pic_resize = new FGCallNative("Pic_resize", _Pic_resize,
    new OverloadT([
        new FunctionT([pictureT, numberT, numberT], pictureT, ["from", "w", "h"]),
    ])
);

// NOTE: This is called as static method but implemented as instance method.
function _Pic_rot(session: Session): void {
    const pic = session.pop() as Picture;
    session.pop(); // The function.
    session.push(pic.rot());
}
const Pic_rot = new FGCallNative("Pic_rot", _Pic_rot,
    new OverloadT([
        new FunctionT([pictureT], pictureT, ["pic"]),
    ])
);

function _Pic_quartet(session: Session): void {
    const s = session.pop() as Picture;
    const r = session.pop() as Picture;
    const q = session.pop() as Picture;
    const p = session.pop() as Picture;
    session.pop(); // The function.
    session.push(Picture.quartet(p, q, r, s));
}
const Pic_quartet = new FGCallNative("Pic_quartet", _Pic_quartet,
    new OverloadT([
        new FunctionT([pictureT, pictureT, pictureT, pictureT], pictureT, ["p", "q", "r", "s"]),
    ])
);

function _Pic_cycle(session: Session): void {
    const p = session.pop() as Picture;
    session.pop(); // The function.
    session.push(Picture.cycle(p));
}
const Pic_cycle = new FGCallNative("Pic_cycle", _Pic_cycle,
    new OverloadT([
        new FunctionT([pictureT], pictureT, ["pic"]),
    ])
);

pictureT.methods["place"] = { type: Pic_place.sig, value: Pic_place };
pictureT.methods["add_segment"] = { type: Pic_add_segment.sig, value: Pic_add_segment };
pictureT.methods["draw"] = { type: Pic_draw.sig, value: Pic_draw };
pictureT.methods["no_frame"] = { type: Pic_no_frame.sig, value: Pic_no_frame };
pictureT.methods["with_frame"] = { type: Pic_with_frame.sig, value: Pic_with_frame };

// TODO: This should be in static field.
pictureT.methods["resize"] = { type: Pic_resize.sig, value: Pic_resize };
pictureT.methods["quartet"] = { type: Pic_quartet.sig, value: Pic_quartet };
pictureT.methods["cycle"] = { type: Pic_cycle.sig, value: Pic_cycle };
pictureT.methods["rot"] = { type: Pic_rot.sig, value: Pic_rot };

export const fishNames: Names = {
    fishp: { type: pictureT, value: fishp },
    fishq: { type: pictureT, value: fishq },
    fishr: { type: pictureT, value: fishr },
    fishs: { type: pictureT, value: fishs },
    Pic:   { type: Pic.sig, value: Pic },
};
