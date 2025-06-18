// @jonesangga, 08-06-2025, MIT License.
//
// TODO: Test this.

import { Op } from "./chunk.js"
import { type Type, numberT } from "./literal/type.js"

export interface Visitor<T> {
    visitAssign   (node: AssignNode):   T;
    visitBinary   (node: BinaryNode):   T;
    visitBoolean  (node: BooleanNode):  T;
    visitCall     (node: CallNode):     T;
    visitExprStmt (node: ExprStmtNode): T;
    visitFile     (node: FileNode):     T;
    visitIdent    (node: IdentNode):    T;
    visitNumber   (node: NumberNode):   T;
    visitString   (node: StringNode):   T;
    visitVarDecl  (node: VarDeclNode):  T;
}

export interface AST {
    line:   number;
    to_str  (level: number): string;
    visit<T>(v: Visitor<T>): T;
}

export class AssignNode implements AST {
    constructor(public line:  number,
                public left:  IdentNode,
                public right: AST) {}

    to_str(level: number): string {
        return indent(level) + "Assign(\n"
            + indent(level + 2) + this.left.to_str(level + 2)
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

export const BinaryTable: {
    [N in (keyof typeof BinaryOp) as (typeof BinaryOp)[N]]: { name: N, op: Op, type: Type }
} = {
    [BinaryOp.Add]:      { name: "Add",      op: Op.Add, type: numberT },
    [BinaryOp.Divide]:   { name: "Divide",   op: Op.Div, type: numberT },
    [BinaryOp.Multiply]: { name: "Multiply", op: Op.Mul, type: numberT },
    [BinaryOp.Subtract]: { name: "Subtract", op: Op.Sub, type: numberT },
};

export class BinaryNode implements AST {
    constructor(public line:  number,
                public left:  AST,
                public op:    BinaryOp,
                public right: AST) {}

    to_str(level: number): string {
        return indent(level) + BinaryTable[this.op].name + "(\n"
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

export class CallNode implements AST {
    constructor(public line:   number,
                public callee: AST,
                public args:   AST[]) {}

    to_str(level: number): string {
        return indent(level) + "Call(\n"
            + this.callee.to_str(level + 2)
            + "\n"
            + indent(level + 2) + "[\n"
            + this.args.map(arg => arg.to_str(level + 4)).join("\n")
            + "\n"
            + indent(level + 2) + "]\n"
            + indent(level) + ")";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitCall(this);
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
        return "File(\n"
            + this.stmts.reduce((acc, curr) => acc + curr.to_str(level + 2), "")
            + "\n)";
    }

    visit<T>(v: Visitor<T>): T {
        return v.visitFile(this);
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
