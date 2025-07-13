// This file is just for easy selecting what module I want to use.
// I cannot implement synchronous dynamic import in semantic phase.
// So just manually comment/uncomment the import lines below.

import { apolNames } from "./apollonian/mod.js";
import { fishNames } from "./fish/mod.js";
import { sierpNames } from "./sierpinski/mod.js";
import { tilingNames } from "./tiling/mod.js";

export const extraNames = Object.assign(
    {},
    apolNames,
    fishNames,
    sierpNames,
    tilingNames,
);
