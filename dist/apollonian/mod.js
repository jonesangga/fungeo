import { FGCallNative } from "../value.js";
import { Apollonian, apollonianT } from "./apollonian.js";
import { FunctionT, OverloadT, nothingT, numberT } from "../literal/type.js";
function _Apol(session) {
    session.pop();
    session.push(new Apollonian());
}
const Apol = new FGCallNative("Apol", _Apol, new OverloadT([
    new FunctionT([], apollonianT, []),
]));
function _Apol_draw(session) {
    const apol = session.pop();
    session.pop();
    session.oncanvas.push(apol);
    session.render();
    apol.currentlyDrawn = true;
}
const Apol_draw = new FGCallNative("Apol_draw", _Apol_draw, new OverloadT([
    new FunctionT([], nothingT, []),
]));
function _Apol_enclosing(session) {
    const r = session.pop().value;
    session.pop();
    session.push(Apollonian.enclosing(r));
}
const Apol_enclosing = new FGCallNative("Apol_enclosing", _Apol_enclosing, new OverloadT([
    new FunctionT([numberT], apollonianT, ["r"]),
]));
apollonianT.methods["enclosing"] = { type: Apol_enclosing.sig, value: Apol_enclosing };
apollonianT.methods["draw"] = { type: Apol_draw.sig, value: Apol_draw };
export const apolNames = {
    Apol: { type: Apol.sig, value: Apol },
};
