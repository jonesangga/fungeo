import { Chunk } from "./chunk.js";
import { binaryTable } from "./ast.js";
import { FGBoolean, FGNumber, FGString, FGCallUser } from "./value.js";
import { FGType, nothingT } from "./literal/type.js";
class CodeGen {
    visitNumber(node) {
        emitConstant(new FGNumber(node.value), node.line);
    }
    visitNegative(node) {
        node.right.visit(this);
        emitByte(1000, node.line);
    }
    visitString(node) {
        emitConstant(new FGString(node.value), node.line);
    }
    visitBoolean(node) {
        emitConstant(new FGBoolean(node.value), node.line);
    }
    visitList(node) {
        for (let item of node.items) {
            item.visit(this);
        }
        emitConstant(new FGType(node.elType), node.line);
        emitBytes(700, node.items.length, node.line);
    }
    visitIndex(node) {
        node.list.visit(this);
        node.index.visit(this);
        emitByte(600, node.line);
    }
    visitBinary(node) {
        node.left.visit(this);
        node.right.visit(this);
        emitByte(binaryTable[node.op].op, node.line);
    }
    visitIdent(node) {
        let index = makeConstant(new FGString(node.name));
        emitBytes(500, index, node.line);
    }
    visitAssign(node) {
        let index = makeConstant(new FGString(node.left.name));
        node.right.visit(this);
        emitBytes(1400, index, node.line);
    }
    visitGetProp(node) {
        node.obj.visit(this);
        let index = makeConstant(new FGString(node.prop));
        if (node.kind === "field")
            emitBytes(520, index, node.line);
        else if (node.kind === "method")
            emitBytes(510, index, node.line);
        else
            emitBytes(525, index, node.line);
    }
    visitSetProp(node) {
        node.obj.visit(this);
        let index = makeConstant(new FGString(node.prop));
        node.value.visit(this);
        emitBytes(1430, index, node.line);
    }
    visitVarDecl(node) {
        let index = makeConstant(new FGString(node.name));
        node.init.visit(this);
        let type = tempNames[node.name].type;
        emitConstant(new FGType(type), node.line);
        emitBytes(1020, index, node.line);
    }
    visitEmptyStmt(node) {
    }
    visitExprStmt(node) {
        node.expr.visit(this);
        emitByte(1200, node.line);
    }
    visitFile(node) {
        node.stmts.forEach(stmt => stmt.visit(this));
    }
    visitCall(node) {
        node.name.visit(this);
        node.args.forEach(arg => arg.visit(this));
        let arity = node.args.length;
        emitBytes(200, arity, node.line);
        emitByte(node.ver, node.line);
    }
    visitCallVoid(node) {
        node.node.visit(this);
    }
}
function emitByte(byte, line) {
    curr_chunk().write(byte, line);
}
function emitBytes(byte1, byte2, line) {
    emitByte(byte1, line);
    emitByte(byte2, line);
}
function emitConstant(value, line) {
    emitBytes(800, makeConstant(value), line);
}
function emitReturn() {
    emitByte(1150, -1);
}
function makeConstant(value) {
    return curr_chunk().add_value(value);
}
let current;
function curr_chunk() {
    return current.fn.chunk;
}
function begin_compiler(name) {
    let compiler = {
        enclosing: current,
        fn: new FGCallUser(name, [], nothingT, new Chunk(name)),
        scopeDepth: 0,
    };
    current = compiler;
}
function end_compiler() {
    emitReturn();
    let fn = current.fn;
    current = current.enclosing;
    return fn;
}
let tempNames = {};
export function compile(ast, name) {
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
    catch (error) {
        return {
            ok: false,
            error: (error instanceof Error) ? error : new Error("unknown error"),
        };
    }
}
