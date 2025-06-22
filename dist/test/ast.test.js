import { describe, it } from "node:test";
import { equal } from "node:assert/strict";
import { AssignNode, BinaryNode, BooleanNode, CallNode, CallVoidNode, ExprStmtNode, FileNode, IdentNode, NumberNode, StringNode, VarDeclNode } from "../ast.js";
function populateTemplate(strings, ...subs) {
    let raw = strings.raw;
    let result = "";
    for (let i = 0; i < subs.length; i++)
        result += raw[i] + subs[i];
    result += raw[raw.length - 1];
    return result;
}
function undent(strings, ...subs) {
    let result = populateTemplate(strings, ...subs);
    result = result.replace(/^[\r\n]+/, '').replace(/\s+$/, '');
    const dents = result.match(/^([ \t])*/gm);
    if (!dents || dents.length === 0)
        return result;
    dents.sort((dent1, dent2) => dent1.length - dent2.length);
    const minDent = dents[0];
    if (minDent.length === 0)
        return result;
    return result.replace(new RegExp(`^${minDent}`, 'gm'), '');
}
describe("ast node's to_str() method", () => {
    it("AssignNode", () => {
        let node = new AssignNode(1000, new IdentNode(2000, "a"), new NumberNode(3000, 2));
        let str = node.to_str(0);
        equal(str, undent `
            Assign(
              Ident(a)
              Number(2)
            )`);
    });
    const binaryTests = {
        [0]: { name: "Add", op: 0 },
        [1]: { name: "Divide", op: 1 },
        [2]: { name: "Multiply", op: 2 },
        [3]: { name: "Subtract", op: 3 },
    };
    for (let test of Object.values(binaryTests)) {
        it("BinaryNode " + test.name, () => {
            let node = new BinaryNode(1000, new NumberNode(2000, 4), test.op, new NumberNode(3000, 5));
            let str = node.to_str(0);
            equal(str, undent `
                ${test.name}(
                  Number(4)
                  Number(5)
                )`);
        });
    }
    it("BooleanNode", () => {
        let node = new BooleanNode(1000, false);
        let str = node.to_str(0);
        equal(str, "Boolean(false)");
    });
    it("CallNode", () => {
        let node = new CallNode(1000, new IdentNode(1000, "pt"), [new NumberNode(1000, 100), new NumberNode(1000, 200)], 2);
        let str = node.to_str(0);
        equal(str, undent `
            Call(
              Ident(pt)
              [
                Number(100)
                Number(200)
              ]
              2
            )`);
    });
    it("CallVoidNode", () => {
        let node = new CallVoidNode(1000, new CallNode(1000, new IdentNode(1000, "print"), [new NumberNode(1000, 100)], 2));
        let str = node.to_str(0);
        equal(str, undent `
            CallVoid(
              Call(
                Ident(print)
                [
                  Number(100)
                ]
                2
              )
            )`);
    });
    it("ExprStmtNode", () => {
        let node = new ExprStmtNode(1000, new BinaryNode(1000, new NumberNode(1000, 2), 0, new NumberNode(1000, 5)));
        let str = node.to_str(0);
        equal(str, undent `
            ExprStmt(
              Add(
                Number(2)
                Number(5)
              )
            )`);
    });
    it("FileNode", () => {
        let node = new FileNode(1000, [
            new VarDeclNode(2000, "a", new NumberNode(2000, 2)),
            new CallVoidNode(3000, new CallNode(3000, new IdentNode(3000, "print"), [new IdentNode(3000, "a")], 0)),
        ]);
        let str = node.to_str(0);
        equal(str, undent `
            File(
              VarDecl(
                a
                Number(2)
              )
              CallVoid(
                Call(
                  Ident(print)
                  [
                    Ident(a)
                  ]
                  0
                )
              )
            )`);
    });
    it("IdentNode", () => {
        let node = new IdentNode(1000, "a");
        let str = node.to_str(0);
        equal(str, "Ident(a)");
    });
    it("NumberNode", () => {
        let node = new NumberNode(1000, 10);
        let str = node.to_str(0);
        equal(str, "Number(10)");
    });
    it("StringNode", () => {
        let node = new StringNode(1000, "real");
        let str = node.to_str(0);
        equal(str, "String(real)");
    });
    it("VarDeclNode", () => {
        let node = new VarDeclNode(1000, "a", new NumberNode(1000, 2));
        let str = node.to_str(0);
        equal(str, undent `
            VarDecl(
              a
              Number(2)
            )`);
    });
});
