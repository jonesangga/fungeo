import { FGCallNative } from "../../value.js";
import { Apollonian, apollonianT } from "./apollonian.js";
import { FunctionT, OverloadT, nothingT, numberT } from "../../literal/type.js";
function _Apol_enclosing(session) {
    const r = session.pop().value;
    session.pop();
    session.push(Apollonian.enclosing(r));
}
const Apol_enclosing = new FGCallNative("Apol_enclosing", _Apol_enclosing, new OverloadT([
    new FunctionT([numberT], apollonianT, ["r"]),
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
function _Apol_next(session) {
    const apol = session.pop();
    session.pop();
    session.push(apol.next());
    if (apol.currentlyDrawn) {
        session.render();
    }
}
const Apol_next = new FGCallNative("Apol_next", _Apol_next, new OverloadT([
    new FunctionT([], apollonianT, []),
]));
apollonianT.statics["enclosing"] = { type: Apol_enclosing.sig, value: Apol_enclosing };
apollonianT.methods["draw"] = { type: Apol_draw.sig, value: Apol_draw };
apollonianT.methods["next"] = { type: Apol_next.sig, value: Apol_next };
export const apolClassNames = {
    Apol: { value: apollonianT },
};
export const apolNames = {};
