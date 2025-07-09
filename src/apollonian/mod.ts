import { type Names, Session } from "../vm.js"
import { FGCallNative, FGNumber } from "../value.js"
import { Apollonian, apollonianT } from "./apollonian.js"
import { FunctionT, OverloadT,
         nothingT, numberT } from "../literal/type.js"

function _Apol(session: Session): void {
    session.pop(); // The function.
    session.push(new Apollonian());
}
const Apol = new FGCallNative("Apol", _Apol,
    new OverloadT([
        new FunctionT([], apollonianT, []),
    ])
);

function _Apol_draw(session: Session): void {
    const apol = session.pop() as Apollonian;
    session.pop(); // The function.
    session.oncanvas.push(apol);
    session.render();
    apol.currentlyDrawn = true;
}
const Apol_draw = new FGCallNative("Apol_draw", _Apol_draw,
    new OverloadT([
        new FunctionT([], nothingT, []),
    ])
);

function _Apol_enclosing(session: Session): void {
    const r = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(Apollonian.enclosing(r));
}
const Apol_enclosing = new FGCallNative("Apol_enclosing", _Apol_enclosing,
    new OverloadT([
        new FunctionT([numberT], apollonianT, ["r"]),
    ])
);

apollonianT.methods["enclosing"] = { type: Apol_enclosing.sig, value: Apol_enclosing };
apollonianT.methods["draw"] = { type: Apol_draw.sig, value: Apol_draw };

export const apolNames: Names = {
    Apol: { type: Apol.sig, value: Apol },
};
