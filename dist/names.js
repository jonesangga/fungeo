import { Print, Printf, Show, Type } from "./vmfunction.js";
export let userNames = {};
export let nativeNames = {
    "Print": { kind: 400, value: Print },
    "Printf": { kind: 400, value: Printf },
    "Show": { kind: 400, value: Show },
    "Type": { kind: 400, value: Type },
};
