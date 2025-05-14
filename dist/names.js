import { Print, Printf, Show, Padl, Type } from "./vmfunction.js";
export let userNames = {};
export let nativeNames = {
    "Print": { kind: 400, value: Print },
    "Printf": { kind: 400, value: Printf },
    "Show": { kind: 400, value: Show },
    "Padl": { kind: 400, value: Padl },
    "Type": { kind: 400, value: Type },
};
