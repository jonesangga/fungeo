// @jonesangga, 08-06-2025, MIT License.
//
// TODO: Complete the test.

import { Op } from "./chunk.js"
import { type Type, numberT, anyT } from "./literal/type.js"

export interface Visitor<T> {
    visitAssign       (node: AssignNode):       T;
    visitBinary       (node: BinaryNode):       T;
    visitBoolean      (node: BooleanNode):      T;
    visitCall         (node: CallNode):         T;
    visitCallVoid     (node: CallVoidNode):     T;
    visitEmptyStmt    (node: EmptyStmtNode):    T;
    visitExprStmt     (node: ExprStmtNode):     T;
    visitFile         (node: FileNode):         T;
    visitGetProp      (node: GetPropNode):      T;
    visitIdent        (node: IdentNode):        T;
    visitIndex        (node: IndexNode):        T;
    visitList         (node: ListNode):         T;
    visitNegative     (node: NegativeNode):     T;
    visitNumber       (node: NumberNode):       T;
    visitSetProp      (node: SetPropNode):      T;
    visitStaticMethod (node: StaticMethodNode): T;
    visitString       (node: StringNode):       T;
    visitVarDecl      (node: VarDeclNode):      T;
}

export interface AST {
    line:   number;
    to_str  (level: number): string;
    visit<T>(v: Visitor<T>): T;
}

// This is for identifier (including function) assignment.
// For property assignment use SetPropNode.
// TODO: Think about array element assignment.

export class AssignNode implements AST {
    constructor(public line:  number,
                public left:  IdentNode,
                public right: AST) {}

    to_str(level: number): string {
        return indent(level) + "Assign(\n"
            + this.left.to_str(level + 2)
            + "\n"
            + this.right.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitAssign(this);
    }
}

export const enum BinaryOp {
    Add,
    Divide,
    Multiply,
    Subtract,
}

export const binaryTable: {
    [N in (keyof typeof BinaryOp) as (typeof BinaryOp)[N]]: { name: N, op: Op, result: Type }
} = {
    [BinaryOp.Add]:      { name: "Add",      op: Op.Add, result: numberT },
    [BinaryOp.Divide]:   { name: "Divide",   op: Op.Div, result: numberT },
    [BinaryOp.Multiply]: { name: "Multiply", op: Op.Mul, result: numberT },
    [BinaryOp.Subtract]: { name: "Subtract", op: Op.Sub, result: numberT },
};

// For now only arithmetic operations.
// TODO: Add comparison, logic, string concat.

export class BinaryNode implements AST {
    constructor(public line:  number,
                public left:  AST,
                public op:    BinaryOp,
                public right: AST) {}

    to_str(level: number): string {
        return indent(level) + binaryTable[this.op].name + "(\n"
            + this.left.to_str(level + 2)
            + "\n"
            + this.right.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitBinary(this);
    }
}

export class BooleanNode implements AST {
    constructor(public line:  number,
                public value: boolean) {}

    to_str(level: number): string {
        return indent(level) + "Boolean(" + this.value + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitBoolean(this);
    }
}

// Currently doesn't support lambda function,
// hence the `name` is always an IdentNode.

export class CallNode implements AST {
    constructor(public line: number,
                public name: IdentNode | GetPropNode | StaticMethodNode,
                public args: AST[],
                public ver:  number) {}

    to_str(level: number): string {
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

    visit<T>(v: Visitor<T>): T {
        return v.visitCall(this);
    }
}

// This is a wrapper for CallNode to make sure user handles the return value
// of function call in a statement that only has function call.
// Unless keyword :- is used for explicit expression statement.
//
// TODO: Should I remove the wrapper and duplicate the CallNode?

export class CallVoidNode implements AST {
    constructor(public line: number,
                public node: CallNode) {}

    to_str(level: number): string {
        return indent(level) + "CallVoid(\n"
            + this.node.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitCallVoid(this);
    }
}

// NOTE: This purpose is only to support optional ';' as statement delimiter.
export class EmptyStmtNode implements AST {
    constructor(public line: number) {}

    to_str(level: number): string {
        return indent(level) + "EmptyStmt()";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitEmptyStmt(this);
    }
}

export class ExprStmtNode implements AST {
    constructor(public line: number,
                public expr: AST) {}

    to_str(level: number): string {
        return indent(level) + "ExprStmt(\n"
            + this.expr.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitExprStmt(this);
    }
}

export class FileNode implements AST {
    constructor(public line:  number,
                public stmts: AST[]) {}

    to_str(level: number): string {
        return indent(level) + "File(\n"
            + this.stmts.map(stmt => stmt.to_str(level + 2)).join("\n")
            + indent(level) + "\n)";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitFile(this);
    }
}

// TODO: Think about `kind` later.
export class GetPropNode implements AST {
    constructor(public line: number,
                public obj:     AST,
                public prop:    string,
                public isField: boolean = true) {}

    to_str(level: number): string {
        return indent(level) + "GetProp(\n"
            + this.obj.to_str(level + 2)
            + "\n"
            + indent(level + 2) + this.prop
            + "\n"
            + indent(level) + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitGetProp(this);
    }
}

export class IdentNode implements AST {
    constructor(public line: number,
                public name: string) {}

    to_str(level: number): string {
        return indent(level) + "Ident(" + this.name + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitIdent(this);
    }
}

export class IndexNode implements AST {
    constructor(public line:  number,
                public list:  AST,
                public index: AST) {}

    to_str(level: number): string {
        return indent(level) + "Index(\n"
            + this.list.to_str(level + 2)
            + "\n"
            + this.index.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitIndex(this);
    }
}

// TODO: fix to_str() later.
export class ListNode implements AST {
    constructor(public line:   number,
                public items:  AST[],
                public elType: Type = anyT) {}

    to_str(level: number): string {
        return indent(level) + "List(" + this.items.map(item => item.to_str(0)).join(", ") + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitList(this);
    }
}

export class NegativeNode implements AST {
    constructor(public line:  number,
                public right: AST) {}

    to_str(level: number): string {
        return indent(level) + "Negative(\n"
            + this.right.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitNegative(this);
    }
}

export class NumberNode implements AST {
    constructor(public line:  number,
                public value: number) {}

    to_str(level: number): string {
        return indent(level) + "Number(" + this.value + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitNumber(this);
    }
}

export class SetPropNode implements AST {
    constructor(public line:  number,
                public obj:   AST,
                public prop:  string,
                public value: AST) {}

    to_str(level: number): string {
        return indent(level) + "SetProp(\n"
            + this.obj.to_str(level + 2)
            + "\n"
            + indent(level + 2) + this.prop
            + "\n"
            + this.value.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitSetProp(this);
    }
}

export class StaticMethodNode implements AST {
    constructor(public line:   number,
                public obj:    IdentNode,
                public method: string) {}

    to_str(level: number): string {
        return indent(level) + "StaticMethod(\n"
            + this.obj.to_str(level + 2)
            + "\n"
            + indent(level + 2) + this.method
            + "\n"
            + indent(level) + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitStaticMethod(this);
    }
}

export class StringNode implements AST {
    constructor(public line:  number,
                public value: string) {}

    to_str(level: number): string {
        return indent(level) + "String(" + this.value + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitString(this);
    }
}

export class VarDeclNode implements AST {
    constructor(public line: number,
                public name: string,
                public init: AST) {}

    to_str(level: number): string {
        return indent(level) + "VarDecl(\n"
            + indent(level + 2) + this.name
            + "\n"
            + this.init.to_str(level + 2)
            + "\n"
            + indent(level) + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitVarDecl(this);
    }
}

// Helper for printing.
function indent(level: number): string {
    return " ".repeat(level);
}
