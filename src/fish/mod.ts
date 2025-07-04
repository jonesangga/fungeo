import { Session } from "../vm.js"
import { FGCallNative, FGNumber } from "../value.js"
import { pictureT, Picture } from "./picture.js"
import { type Names } from "../vmfunction.js"
import { FunctionT, OverloadT,
         numberT } from "../literal/type.js"

function _Pic(session: Session): void {
    let w = (session.pop() as FGNumber).value;
    let h = (session.pop() as FGNumber).value;
    session.pop();              // The function.
    let pic = new Picture(w, h);
    session.push(pic);
}
let Pic = new FGCallNative("Pic", _Pic,
    new OverloadT([
        new FunctionT([numberT, numberT], pictureT, ["w", "h"]),
    ])
);

export let modNames: Names = {
    Pic: { type: Pic.sig, value: Pic },
};
