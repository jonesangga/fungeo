import { FGCallNative } from "../value.js";
import { Hexagonal, hexagonalT } from "./hexagonal.js";
import { FunctionT, OverloadT, nothingT } from "../literal/type.js";
function _Hexa(session) {
    session.pop();
    session.push(new Hexagonal());
}
const Hexa = new FGCallNative("Hexa", _Hexa, new OverloadT([
    new FunctionT([], hexagonalT, []),
]));
function _Hexa_draw(session) {
    const hexa = session.pop();
    ;
    session.pop();
    session.oncanvas.push(hexa);
    session.render();
    hexa.currentlyDrawn = true;
}
const Hexa_draw = new FGCallNative("Hexa_draw", _Hexa_draw, new OverloadT([
    new FunctionT([], nothingT, []),
]));
hexagonalT.methods["draw"] = { type: Hexa_draw.sig, value: Hexa_draw };
export const tilingNames = {
    Hexa: { type: Hexa.sig, value: Hexa },
};
