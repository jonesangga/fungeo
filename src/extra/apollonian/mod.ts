import { type ClassNames, type Names, Session } from "../../vm.js"
import { FGCallNative, FGNumber } from "../../value.js"
import { Apollonian, apollonianT } from "./apollonian.js"
import { FunctionT, OverloadT,
         nothingT, numberT } from "../../literal/type.js"

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

function _Apol_next(session: Session): void {
    const apol = session.pop() as Apollonian;
    session.pop(); // The function.
    session.push(apol.next());

    if (apol.currentlyDrawn) {
        session.render();
    }
}
const Apol_next = new FGCallNative("Apol_next", _Apol_next,
    new OverloadT([
        new FunctionT([], apollonianT, []),
    ])
);

apollonianT.statics["enclosing"] = { type: Apol_enclosing.sig, value: Apol_enclosing };

apollonianT.methods["draw"] = { type: Apol_draw.sig, value: Apol_draw };
apollonianT.methods["next"] = { type: Apol_next.sig, value: Apol_next };

export const apolClassNames: ClassNames = {
    Apol: { value: apollonianT },
};

export const apolNames: Names = {
};
