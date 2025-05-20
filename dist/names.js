import { Print, Printf, Show, Padl, Type, Draw, Seg } from "./vmfunction.js";
import { canvas } from "./ui/canvas.js";
import { repl } from "./ui/repl.js";
export let userNames = {};
export let nativeNames = {
    "canvas": { kind: 2000, value: canvas },
    "repl": { kind: 2500, value: repl },
    "Print": { kind: 400, value: Print },
    "Printf": { kind: 400, value: Printf },
    "Show": { kind: 400, value: Show },
    "Padl": { kind: 400, value: Padl },
    "Type": { kind: 400, value: Type },
    "Draw": { kind: 400, value: Draw },
    "Seg": { kind: 400, value: Seg },
};
