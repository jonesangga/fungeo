// @jonesangga, 12-04-2025, MIT License.

import { AST, AssignNode, BinaryNode, binaryTable, BooleanNode, CallNode, CallVoidNode, ExprStmtNode, FileNode, GetPropNode, IdentNode,
         IndexNode, ListNode, NegativeNode, NumberNode, SetPropNode, StringNode, UseNode, VarDeclNode, Visitor } from "./ast.js";
import { names } from "./vm.js"
import { type Type, FunctionT, OverloadT, numberT, PointT, ListT, stringT, booleanT, nothingT, GeoT } from "./literal/type.js"

function error(line: number, message: string): never {
    let result = "type: " + line + ": " + message;
    throw new Error(result);
}

function assertType(expected: Type, got: Type, line: number): void {
    if (!expected.equal(got))
        error(line, `expected ${ expected.to_str() }, got ${ got.to_str() }`);
}

function resolveVar(name: string, line: number): Type {
    if (Object.hasOwn(names, name))
        return names[name].type;
    else if (Object.hasOwn(tempNames, name))
        return tempNames[name].type;
    else
        error(line, `undefined name ${ name }`);
}

class TypeChecker implements Visitor<Type> {
    visitNumber(node: NumberNode): Type {
        return numberT;
    }

    visitNegative(node: NegativeNode): Type {
        let type = node.right.visit(this);
        assertType(type, numberT, node.line);
        return numberT;
    }

    // For now assuming the list is not empty.
    visitList(node: ListNode): Type {
        let elType = node.items[0].visit(this);
        for (let i = 1; i < node.items.length; i++) {
            assertType(elType, node.items[i].visit(this), node.line);
        }
        node.elType = elType;
        return new ListT(elType);
    }

    visitIndex(node: IndexNode): Type {
        let listType = node.list.visit(this);
        if (!(listType instanceof ListT))
            error(node.line, "attempt to index non-list");
        let index = node.index.visit(this);
        assertType(index, numberT, node.line);
        return listType.elType;
    }

    visitString(node: StringNode): Type {
        return stringT;
    }

    visitBoolean(node: BooleanNode): Type {
        return booleanT;
    }

    visitBinary(node: BinaryNode): Type {
        let type = binaryTable[node.op].result;
        assertType(type, node.left.visit(this), node.left.line);
        assertType(type, node.right.visit(this), node.right.line);
        return type;
    }

    visitIdent(node: IdentNode): Type {
        return resolveVar(node.name, node.line);
    }

    visitAssign(node: AssignNode): Type {
        let varType = node.left.visit(this);
        let valueType = node.right.visit(this);
        assertType(varType, valueType, node.right.line);
        return nothingT;
    }

    visitUse(node: UseNode): Type {
        return nothingT;
    }

    visitVarDecl(node: VarDeclNode): Type {
        if (Object.hasOwn(tempNames, node.name) ||
                Object.hasOwn(names, node.name)) {
            error(node.line, `${node.name} already defined`);
        }
        let type = node.init.visit(this);
        if (type.equal(nothingT))
            error(node.init.line, `cannot assign to nothingT`);
        tempNames[node.name] = { type };
        return nothingT;
    }

    visitExprStmt(node: ExprStmtNode): Type {
        return node.expr.visit(this);
    }

    visitGetProp(node: GetPropNode): Type {
        let objType = node.obj.visit(this);
        if (!("field" in objType))
            error(node.line, "no obj");
        let field = (objType as GeoT).field;
        if (!Object.hasOwn(field, node.prop))
            error(node.line, `no prop ${ node.prop } in obj`);
        return field[node.prop];
    }

    visitSetProp(node: SetPropNode): Type {
        let objType = node.obj.visit(this);
        if (!("field" in objType))
            error(node.line, "no obj");
        let field = (objType as GeoT).field;
        if (!Object.hasOwn(field, node.prop))
            error(node.line, `no prop ${ node.prop } in obj`);
        let fieldType = field[node.prop];
        let valueType = node.value.visit(this);
        assertType(fieldType, valueType, node.value.line);
        return nothingT;
    }

    visitFile(node: FileNode): Type {
        node.stmts.forEach(stmt => stmt.visit(this));
        return nothingT;
    }

    visitCall(node: CallNode): Type {
        let fnType = node.name.visit(this);
        console.log(fnType);
        if (!(fnType instanceof OverloadT))
            error(node.name.line, `${node.name} is not a function`);
        let input: Type[] = [];
        node.args.forEach(arg => input.push(arg.visit(this)));
        let [ver, type] = overload(input, fnType, node.line);
        node.ver = ver;
        return type;
    }

    visitCallVoid(node: CallVoidNode): Type {
        let returnT = node.node.visit(this);
        if (!nothingT.equal(returnT))
            error(node.line, "unused return value");
        return nothingT;
    }
}

function overload(input: Type[], fn: OverloadT, line: number): [number, Type] {
    for (let i = 0; i < fn.sigs.length; i++) {
        let sig = fn.sigs[i];
        let output = sig.output;
        let got = new FunctionT(input, output);
        if (sig.equal(got))
            return [i, output];
    }
    error(line, "no matching fn sig");
}

// TODO: Change this later.
let tempNames: Record<string, { type: Type, mut?: boolean }> = {};

type Result<T> =
    | { ok: true, value: T }
    | { ok: false, error: Error };

export function typecheck(ast: FileNode): Result<typeof tempNames> {
    tempNames = {};         // Reset temporary name table.

    let typeChecker = new TypeChecker();
    try {
        ast.visit(typeChecker);
        return {
            ok: true,
            value: tempNames,
        };
    }
    catch(error: unknown) {
        return {
            ok: false,
            error: (error instanceof Error) ? error : new Error("unknown error"),
        };
    }
}
