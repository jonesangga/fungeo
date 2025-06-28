// @jonesangga, 12-04-2025, MIT License.

import { Op, Chunk } from "./chunk.js"
import { AssignNode, BinaryNode, binaryTable, BooleanNode, CallNode, CallVoidNode, ExprStmtNode, FileNode, GetPropNode, IdentNode,
         IndexNode, ListNode, NegativeNode, NumberNode, SetPropNode, StringNode, UseNode, VarDeclNode, Visitor } from "./ast.js";
import { type Value, FGBoolean, FGNumber, FGString, FGCallUser } from "./value.js"
import { FGType, type Type, nothingT } from "./literal/type.js"

class CodeGen implements Visitor<void> {
    visitNumber(node: NumberNode): void {
        emitConstant(new FGNumber(node.value), node.line);
    }

    visitNegative(node: NegativeNode): void {
        node.right.visit(this);
        emitByte(Op.Neg, node.line);
    }

    visitString(node: StringNode): void {
        emitConstant(new FGString(node.value), node.line);
    }

    visitBoolean(node: BooleanNode): void {
        emitConstant(new FGBoolean(node.value), node.line);
    }

    visitList(node: ListNode): void {
        for (let item of node.items) {
            item.visit(this);
        }
        emitConstant(new FGType(node.elType), node.line);
        emitBytes(Op.List, node.items.length, node.line);
    }

    visitIndex(node: IndexNode): void {
        node.list.visit(this);
        node.index.visit(this);
        emitByte(Op.Index, node.line);
    }

    visitBinary(node: BinaryNode): void {
        node.left.visit(this);
        node.right.visit(this);
        emitByte(binaryTable[node.op].op, node.line);
    }

    visitIdent(node: IdentNode): void {
        let index = makeConstant(new FGString(node.name));
        emitBytes(Op.GetGlob, index, node.line);
    }

    visitUse(node: UseNode): void {
        let index = makeConstant(new FGString(node.name));
        emitBytes(Op.Use, index, node.line);
    }

    visitAssign(node: AssignNode): void {
        let index = makeConstant(new FGString(node.left.name));
        node.right.visit(this);
        emitBytes(Op.Set, index, node.line);
    }

    visitGetProp(node: GetPropNode): void {
        node.obj.visit(this);
        let index = makeConstant(new FGString(node.prop));
        if (node.isField)
            emitBytes(Op.GetProp, index, node.line);
        else
            emitBytes(Op.GetMeth, index, node.line);
    }

    visitSetProp(node: SetPropNode): void {
        node.obj.visit(this);
        let index = makeConstant(new FGString(node.prop));
        node.value.visit(this);
        emitBytes(Op.SetProp, index, node.line);
    }

    visitVarDecl(node: VarDeclNode): void {
        let index = makeConstant(new FGString(node.name));
        node.init.visit(this);
        let type = tempNames[node.name].type;
        emitConstant(new FGType(type), node.line);
        emitBytes(Op.New, index, node.line);
    }

    visitExprStmt(node: ExprStmtNode): void {
        node.expr.visit(this);
        emitByte(Op.Pop, node.line);
    }

    visitFile(node: FileNode): void {
        node.stmts.forEach(stmt => stmt.visit(this));
    }

    visitCall(node: CallNode): void {
        node.name.visit(this);
        node.args.forEach(arg => arg.visit(this));
        let arity = node.args.length;
        emitBytes(Op.Call, arity, node.line);
        emitByte(node.ver, node.line);
    }

    visitCallVoid(node: CallVoidNode): void {
        node.node.visit(this);
    }
}


function emitByte(byte: number, line: number): void {
    curr_chunk().write(byte, line);
}

function emitBytes(byte1: number, byte2: number, line: number): void {
    emitByte(byte1, line);
    emitByte(byte2, line);
}

function emitConstant(value: Value, line: number): void {
    emitBytes(Op.Load, makeConstant(value), line);
}

// TODO: fix the line number. Make ReturnNode
function emitReturn(): void {
    emitByte(Op.Ok, -1);
}

function makeConstant(value: Value) {
    return curr_chunk().add_value(value);
}

interface Compiler {
    enclosing:  Compiler | null;
    fn:         FGCallUser,
    scopeDepth: number;
}

let current: Compiler;

function curr_chunk(): Chunk {
    return current.fn.chunk;
}

function begin_compiler(name: string): void {
    let compiler: Compiler = {
        enclosing: current,
        fn: new FGCallUser(
            name,
            [],
            nothingT,
            new Chunk(name),
        ),
        scopeDepth: 0,
    };
    current = compiler;
}

function end_compiler(): FGCallUser {
    emitReturn();
    let fn = current.fn;
    // console.log( curr_chunk().disassemble() );
    current = current.enclosing as Compiler;
    return fn;
}

// TODO: Change this later.
let tempNames: Record<string, { type: Type, mut?: boolean }> = {};

type Result<T> =
    | { ok: true, value: T }
    | { ok: false, error: Error };

export function compile(ast: FileNode, name: typeof tempNames): Result<FGCallUser> {
    tempNames = name;
    begin_compiler("TOP");

    let codegen = new CodeGen();
    try {
        ast.visit(codegen);
        return {
            ok: true,
            value: end_compiler(),
        };
    }
    catch(error: unknown) {
        return {
            ok: false,
            error: (error instanceof Error) ? error : new Error("unknown error"),
        };
    }
}
