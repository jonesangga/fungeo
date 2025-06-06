// @jonesangga, 2025, MIT License.
//
// TODO: Implement the equal() method.
//       Test it.

import { type FG, Kind } from "../value.js";
import { Type, colorT } from "../type.js";


export class FGType implements FG {
    kind: Kind.Type = Kind.Type;

    constructor(
        public value: Type
    ) {}

    to_str(): string {
        return this.value.to_str();
    }

    typeof(): FGType {
        return this;
    }

    equal(other: FG): boolean {
        return false;
    }
}

const colorTVal = new FGType(colorT);
