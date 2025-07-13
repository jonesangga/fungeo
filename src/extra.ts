// This file is just for easy selecting what module I want to use.
// I cannot implement synchronous dynamic import in semantic phase.
// So just manually comment/uncomment the import lines below.

import { apolNames } from "./extra/apollonian/mod.js";
import { fishNames } from "./extra/fish/mod.js";
import { sierpNames } from "./extra/sierpinski/mod.js";
import { tilingNames } from "./extra/tiling/mod.js";

export const extraNames = Object.assign(
    {},
    apolNames,
    fishNames,
    sierpNames,
    tilingNames,
);
