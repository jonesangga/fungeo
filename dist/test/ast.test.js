import { describe, it } from "node:test";
import { equal } from "node:assert/strict";
import { NumberNode, StringNode, FileNode } from "../ast.js";
describe("ast to_str() method", () => {
    it("FileNode", () => {
        let node = new FileNode(123, [
            new NumberNode(20, 10)
        ]);
        let str = node.to_str(0);
        equal(str, "File(\n  Number(10)\n)");
    });
    it("NumberNode", () => {
        let node = new NumberNode(20, 10);
        let str = node.to_str(2);
        equal(str, "  Number(10)");
    });
    it("StringNode", () => {
        let node = new StringNode(20, "real");
        let str = node.to_str(2);
        equal(str, "  String(real)");
    });
});
