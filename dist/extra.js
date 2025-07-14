import { apolClassNames, apolNames } from "./extra/apollonian/mod.js";
import { fishClassNames, fishNames } from "./extra/fish/mod.js";
import { sierpClassNames, sierpNames } from "./extra/sierpinski/mod.js";
import { tilingClassNames, tilingNames } from "./extra/tiling/mod.js";
export const extraClassNames = Object.assign({}, apolClassNames, fishClassNames, sierpClassNames, tilingClassNames);
export const extraNames = Object.assign({}, apolNames, fishNames, sierpNames, tilingNames);
