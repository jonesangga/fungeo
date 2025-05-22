import { Print, Printf, Show, Padl, Type, Draw, C, E, P, R, Seg, Midpoint } from "./vmfunction.js";
import canvas from "./ui/canvas.js";
import repl from "./ui/repl.js";
export let nativeNames = {
    "canvas": { kind: 2000, value: canvas },
    "repl": { kind: 2500, value: repl },
    "Print": { kind: 400, value: Print },
    "Printf": { kind: 400, value: Printf },
    "Show": { kind: 400, value: Show },
    "Padl": { kind: 400, value: Padl },
    "Type": { kind: 400, value: Type },
    "Draw": { kind: 400, value: Draw },
    "C": { kind: 400, value: C },
    "E": { kind: 400, value: E },
    "P": { kind: 400, value: P },
    "R": { kind: 400, value: R },
    "Seg": { kind: 400, value: Seg },
    "Midpoint": { kind: 400, value: Midpoint },
};
