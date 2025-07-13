import { type Names, Session } from "../../vm.js"
import { FGCallNative, FGNumber } from "../../value.js"
import { Sierpinski, sierpinskiT } from "./sierpinski.js"
import { FunctionT, OverloadT,
         nothingT, numberT } from "../../literal/type.js"

function _Sierp(session: Session): void {
    const y3 = (session.pop() as FGNumber).value;
    const x3 = (session.pop() as FGNumber).value;
    const y2 = (session.pop() as FGNumber).value;
    const x2 = (session.pop() as FGNumber).value;
    const y1 = (session.pop() as FGNumber).value;
    const x1 = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(new Sierpinski(x1, y1, x2, y2, x3, y3));
}
const Sierp = new FGCallNative("Sierp", _Sierp,
    new OverloadT([
        new FunctionT([numberT, numberT, numberT, numberT, numberT, numberT], sierpinskiT, ["x1", "y1", "x2", "y2", "x3", "y3"]),
    ])
);

function _Sierp_draw(session: Session): void {
    const sierp = session.pop() as Sierpinski;;
    session.pop(); // The function.
    session.oncanvas.push(sierp);
    session.render();
    sierp.currentlyDrawn = true;
}
const Sierp_draw = new FGCallNative("Sierp_draw", _Sierp_draw,
    new OverloadT([
        new FunctionT([], nothingT, []),
    ])
);

function _Sierp_next(session: Session): void {
    const apol = session.pop() as Sierpinski;
    session.pop(); // The function.
    session.push(apol.next());

    if (apol.currentlyDrawn) {
        session.render();
    }
}
const Sierp_next = new FGCallNative("Sierp_next", _Sierp_next,
    new OverloadT([
        new FunctionT([], sierpinskiT, []),
    ])
);

sierpinskiT.methods["draw"] = { type: Sierp_draw.sig, value: Sierp_draw };
sierpinskiT.methods["next"] = { type: Sierp_next.sig, value: Sierp_next };

export const sierpNames: Names = {
    Sierp: { type: Sierp.sig, value: Sierp },
};
