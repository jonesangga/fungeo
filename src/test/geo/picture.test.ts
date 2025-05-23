// @jonesangga, 05-05-2025, MIT License.

import 'global-jsdom/register'
import { describe, it } from "node:test";
import { equal, deepEqual } from "node:assert/strict";
import { Kind } from "../../value.js"
import { color } from "../../data/constant.js"
import Picture from "../../geo/picture.js"

describe("Picture", () => {
    it("create Picture", () => {
        let p = new Picture(10, 20);

        equal(p.kind, Kind.Picture);
        equal(p.x, 0);
        equal(p.y, 0);
        equal(p.w, 10);
        equal(p.h, 20);
        equal(p.strokeStyle, color.black);
        deepEqual(p.objs, []);
    });

    it("Picture to string", () => {
        let p = new Picture(10, 20);

        let result = p.to_str();

        equal(result, "Picture 10 20");
    });
});
