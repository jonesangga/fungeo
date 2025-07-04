import { FGCallNative } from "../value.js";
import { pictureT, Picture } from "./picture.js";
import { FunctionT, OverloadT, numberT } from "../literal/type.js";
function _Pic(session) {
    let w = session.pop().value;
    let h = session.pop().value;
    session.pop();
    let pic = new Picture(w, h);
    session.push(pic);
}
let Pic = new FGCallNative("Pic", _Pic, new OverloadT([
    new FunctionT([numberT, numberT], pictureT, ["w", "h"]),
]));
export let modNames = {
    Pic: { type: Pic.sig, value: Pic },
};
