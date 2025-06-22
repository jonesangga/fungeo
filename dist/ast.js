import { numberT, anyT } from "./literal/type.js";
export class AssignNode {
    line;
    left;
    right;
    constructor(line, left, right) {
        this.line = line;
        this.left = left;
        this.right = right;
    }
    to_str(level) {
        return indent(level) + "Assign(\n"
            + this.left.to_str(level + 2)
            + "\n"
            + this.right.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }
    visit(v) {
        return v.visitAssign(this);
    }
}
export var BinaryOp;
(function (BinaryOp) {
    BinaryOp[BinaryOp["Add"] = 0] = "Add";
    BinaryOp[BinaryOp["Divide"] = 1] = "Divide";
    BinaryOp[BinaryOp["Multiply"] = 2] = "Multiply";
    BinaryOp[BinaryOp["Subtract"] = 3] = "Subtract";
})(BinaryOp || (BinaryOp = {}));
export const binaryTable = {
    [0]: { name: "Add", op: 100, result: numberT },
    [1]: { name: "Divide", op: 300, result: numberT },
    [2]: { name: "Multiply", op: 900, result: numberT },
    [3]: { name: "Subtract", op: 1500, result: numberT },
};
export class BinaryNode {
    line;
    left;
    op;
    right;
    constructor(line, left, op, right) {
        this.line = line;
        this.left = left;
        this.op = op;
        this.right = right;
    }
    to_str(level) {
        return indent(level) + binaryTable[this.op].name + "(\n"
            + this.left.to_str(level + 2)
            + "\n"
            + this.right.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }
    visit(v) {
        return v.visitBinary(this);
    }
}
export class BooleanNode {
    line;
    value;
    constructor(line, value) {
        this.line = line;
        this.value = value;
    }
    to_str(level) {
        return indent(level) + "Boolean(" + this.value + ")";
    }
    visit(v) {
        return v.visitBoolean(this);
    }
}
export class CallNode {
    line;
    name;
    args;
    ver;
    constructor(line, name, args, ver) {
        this.line = line;
        this.name = name;
        this.args = args;
        this.ver = ver;
    }
    to_str(level) {
        return indent(level) + "Call(\n"
            + this.name.to_str(level + 2)
            + "\n"
            + indent(level + 2) + "[\n"
            + this.args.map(arg => arg.to_str(level + 4)).join("\n")
            + "\n"
            + indent(level + 2) + "]\n"
            + indent(level + 2) + this.ver
            + "\n"
            + indent(level) + ")";
    }
    visit(v) {
        return v.visitCall(this);
    }
}
export class CallVoidNode {
    line;
    node;
    constructor(line, node) {
        this.line = line;
        this.node = node;
    }
    to_str(level) {
        return indent(level) + "CallVoid(\n"
            + this.node.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }
    visit(v) {
        return v.visitCallVoid(this);
    }
}
export class ExprStmtNode {
    line;
    expr;
    constructor(line, expr) {
        this.line = line;
        this.expr = expr;
    }
    to_str(level) {
        return indent(level) + "ExprStmt(\n"
            + this.expr.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }
    visit(v) {
        return v.visitExprStmt(this);
    }
}
export class FileNode {
    line;
    stmts;
    constructor(line, stmts) {
        this.line = line;
        this.stmts = stmts;
    }
    to_str(level) {
        return indent(level) + "File(\n"
            + this.stmts.map(stmt => stmt.to_str(level + 2)).join("\n")
            + indent(level) + "\n)";
    }
    visit(v) {
        return v.visitFile(this);
    }
}
export class GetPropNode {
    line;
    obj;
    prop;
    constructor(line, obj, prop) {
        this.line = line;
        this.obj = obj;
        this.prop = prop;
    }
    to_str(level) {
        return indent(level) + "GetProp(\n"
            + this.obj.to_str(level + 2)
            + "\n"
            + indent(level + 2) + this.prop
            + "\n"
            + indent(level) + ")";
    }
    visit(v) {
        return v.visitGetProp(this);
    }
}
export class IdentNode {
    line;
    name;
    constructor(line, name) {
        this.line = line;
        this.name = name;
    }
    to_str(level) {
        return indent(level) + "Ident(" + this.name + ")";
    }
    visit(v) {
        return v.visitIdent(this);
    }
}
export class IndexNode {
    line;
    list;
    index;
    constructor(line, list, index) {
        this.line = line;
        this.list = list;
        this.index = index;
    }
    to_str(level) {
        return indent(level) + "Index(\n"
            + this.list.to_str(level + 2)
            + "\n"
            + this.index.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }
    visit(v) {
        return v.visitIndex(this);
    }
}
export class ListNode {
    line;
    items;
    elType;
    constructor(line, items, elType = anyT) {
        this.line = line;
        this.items = items;
        this.elType = elType;
    }
    to_str(level) {
        return indent(level) + "List(" + this.items.map(item => item.to_str(0)).join(", ") + ")";
    }
    visit(v) {
        return v.visitList(this);
    }
}
export class NumberNode {
    line;
    value;
    constructor(line, value) {
        this.line = line;
        this.value = value;
    }
    to_str(level) {
        return indent(level) + "Number(" + this.value + ")";
    }
    visit(v) {
        return v.visitNumber(this);
    }
}
export class SetPropNode {
    line;
    obj;
    prop;
    value;
    constructor(line, obj, prop, value) {
        this.line = line;
        this.obj = obj;
        this.prop = prop;
        this.value = value;
    }
    to_str(level) {
        return indent(level) + "SetProp(\n"
            + this.obj.to_str(level + 2)
            + "\n"
            + indent(level + 2) + this.prop
            + "\n"
            + this.value.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }
    visit(v) {
        return v.visitSetProp(this);
    }
}
export class StringNode {
    line;
    value;
    constructor(line, value) {
        this.line = line;
        this.value = value;
    }
    to_str(level) {
        return indent(level) + "String(" + this.value + ")";
    }
    visit(v) {
        return v.visitString(this);
    }
}
export class VarDeclNode {
    line;
    name;
    init;
    constructor(line, name, init) {
        this.line = line;
        this.name = name;
        this.init = init;
    }
    to_str(level) {
        return indent(level) + "VarDecl(\n"
            + indent(level + 2) + this.name
            + "\n"
            + this.init.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }
    visit(v) {
        return v.visitVarDecl(this);
    }
}
function indent(level) {
    return " ".repeat(level);
}
