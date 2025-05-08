import { Print, Type } from "./vmfunction.js";
export let userNames = {};
export let nativeNames = {
    "Print": { kind: 400, value: Print },
    "Type": { kind: 400, value: Type },
};
