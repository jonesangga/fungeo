// This file is just for easy selecting what module I want to use.
// I cannot implement synchronous dynamic import in semantic phase.
// So just manually comment/uncomment the import lines below.

import { fishNames } from "./fish/mod.js";

export const extraNames = Object.assign({}, fishNames);
