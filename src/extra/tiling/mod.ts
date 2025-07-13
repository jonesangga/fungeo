import { type Names, Session } from "../../vm.js"
import { FGCallNative } from "../../value.js"
import { Hexagonal, hexagonalT } from "./hexagonal.js"
import { FunctionT, OverloadT,
         nothingT } from "../../literal/type.js"

function _Hexa(session: Session): void {
    session.pop(); // The function.
    session.push(new Hexagonal());
}
const Hexa = new FGCallNative("Hexa", _Hexa,
    new OverloadT([
        new FunctionT([], hexagonalT, []),
    ])
);

function _Hexa_draw(session: Session): void {
    const hexa = session.pop() as Hexagonal;;
    session.pop(); // The function.
    session.oncanvas.push(hexa);
    session.render();
    hexa.currentlyDrawn = true;
}
const Hexa_draw = new FGCallNative("Hexa_draw", _Hexa_draw,
    new OverloadT([
        new FunctionT([], nothingT, []),
    ])
);

hexagonalT.methods["draw"] = { type: Hexa_draw.sig, value: Hexa_draw };

export const tilingNames: Names = {
    Hexa: { type: Hexa.sig, value: Hexa },
};
