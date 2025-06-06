import { colorT } from "../type.js";
export class FGType {
    value;
    kind = 650;
    constructor(value) {
        this.value = value;
    }
    to_str() {
        return this.value.to_str();
    }
    typeof() {
        return this;
    }
    equal(other) {
        return false;
    }
}
const colorTVal = new FGType(colorT);
