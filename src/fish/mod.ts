import { Session } from "../vm.js"
import { FGCallNative, FGNumber } from "../value.js"
import { pictureT, Picture } from "./picture.js"
import { type Names } from "../vmfunction.js"
import { FunctionT, OverloadT,
         nothingT, numberT } from "../literal/type.js"

function _Pic(session: Session): void {
    let w = (session.pop() as FGNumber).value;
    let h = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(new Picture(w, h));
}
let Pic = new FGCallNative("Pic", _Pic,
    new OverloadT([
        new FunctionT([numberT, numberT], pictureT, ["w", "h"]),
    ])
);

function _Pic_segment(session: Session): void {
    let pic = session.pop() as Picture;
    let y2 = (session.pop() as FGNumber).value;
    let x2 = (session.pop() as FGNumber).value;
    let y1 = (session.pop() as FGNumber).value;
    let x1 = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(pic.segment(x1, y1, x2, y2));

    if (pic.drawn) {
        session.render();
    }
}
let Pic_segment = new FGCallNative("Pic_segment", _Pic_segment,
    new OverloadT([
        new FunctionT([numberT, numberT, numberT, numberT], pictureT, ["x1", "y1", "x2", "y2"]),
    ])
);

function _Pic_draw(session: Session): void {
    let pic = session.pop() as Picture;
    session.pop(); // The function.
    session.oncanvas.push(pic);
    session.render();
    pic.drawn = true;
}
let Pic_draw = new FGCallNative("Pic_draw", _Pic_draw,
    new OverloadT([
        new FunctionT([], nothingT, []),
    ])
);

pictureT.methods["segment"] = { type: Pic_segment.sig, value: Pic_segment };
pictureT.methods["draw"] = { type: Pic_draw.sig, value: Pic_draw };

export let modNames: Names = {
    Pic: { type: Pic.sig, value: Pic },
};
