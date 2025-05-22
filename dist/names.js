import { Print, Printf, Show, Padl, Type, Draw, Paint, C, E, P, Pic, R, Seg, Midpoint, Cw, Ccw, FlipH, FlipV, Beside, Above, Quartet, Cycle } from "./vmfunction.js";
import canvas from "./ui/canvas.js";
import repl from "./ui/repl.js";
import fish from "./data/fish.js";
export let nativeNames = {
    "canvas": { kind: 2000, value: canvas },
    "repl": { kind: 2500, value: repl },
    "fishp": { kind: 840, value: fish.p },
    "fishq": { kind: 840, value: fish.q },
    "fishr": { kind: 840, value: fish.r },
    "fishs": { kind: 840, value: fish.s },
    "Print": { kind: 400, value: Print },
    "Printf": { kind: 400, value: Printf },
    "Show": { kind: 400, value: Show },
    "Padl": { kind: 400, value: Padl },
    "Type": { kind: 400, value: Type },
    "Draw": { kind: 400, value: Draw },
    "Paint": { kind: 400, value: Paint },
    "C": { kind: 400, value: C },
    "E": { kind: 400, value: E },
    "P": { kind: 400, value: P },
    "Pic": { kind: 400, value: Pic },
    "Cw": { kind: 400, value: Cw },
    "Ccw": { kind: 400, value: Ccw },
    "FlipH": { kind: 400, value: FlipH },
    "FlipV": { kind: 400, value: FlipV },
    "Above": { kind: 400, value: Above },
    "Beside": { kind: 400, value: Beside },
    "Quartet": { kind: 400, value: Quartet },
    "Cycle": { kind: 400, value: Cycle },
    "R": { kind: 400, value: R },
    "Seg": { kind: 400, value: Seg },
    "Midpoint": { kind: 400, value: Midpoint },
};
