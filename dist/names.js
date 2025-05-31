import { canvasT, replT, pictureT, callNativeT } from "./type.js";
import { Print, Printf, Show, Padl, Type as TypeFn, Draw, Paint, C, E, P, Pic, R, Seg, Midpoint, Cw, Ccw, FlipH, FlipV, Beside, Above, Quartet, Cycle, MapPic, Help, Clear, Ccurv, Descart, ComplexDescart, PrintT, Seg_FromPoint } from "./vmfunction.js";
import canvas from "./ui/canvas.js";
import repl from "./ui/repl.js";
import fish from "./data/fish.js";
export let nativeNames = {
    "canvas": { type: canvasT, value: canvas },
    "repl": { type: replT, value: repl },
    "fishp": { type: pictureT, value: fish.p },
    "fishq": { type: pictureT, value: fish.q },
    "fishr": { type: pictureT, value: fish.r },
    "fishs": { type: pictureT, value: fish.s },
    "Help": { type: callNativeT, value: Help },
    "Print": { type: PrintT, value: Print },
    "Printf": { type: callNativeT, value: Printf },
    "Show": { type: callNativeT, value: Show },
    "Padl": { type: callNativeT, value: Padl },
    "Type": { type: callNativeT, value: TypeFn },
    "Draw": { type: callNativeT, value: Draw },
    "Clear": { type: callNativeT, value: Clear },
    "Paint": { type: callNativeT, value: Paint },
    "C": { type: callNativeT, value: C },
    "Ccurv": { type: callNativeT, value: Ccurv },
    "Descart": { type: callNativeT, value: Descart },
    "ComplexDescart": { type: callNativeT, value: ComplexDescart },
    "E": { type: callNativeT, value: E },
    "P": { type: callNativeT, value: P },
    "Pic": { type: callNativeT, value: Pic },
    "Cw": { type: callNativeT, value: Cw },
    "Ccw": { type: callNativeT, value: Ccw },
    "FlipH": { type: callNativeT, value: FlipH },
    "FlipV": { type: callNativeT, value: FlipV },
    "Above": { type: callNativeT, value: Above },
    "Beside": { type: callNativeT, value: Beside },
    "Quartet": { type: callNativeT, value: Quartet },
    "Cycle": { type: callNativeT, value: Cycle },
    "MapPic": { type: callNativeT, value: MapPic },
    "R": { type: callNativeT, value: R },
    "Seg": { type: callNativeT, value: Seg, methods: {
            "FromPoint": { type: callNativeT, value: Seg_FromPoint },
        } },
    "Midpoint": { type: callNativeT, value: Midpoint },
};
