// @jonesangga, 12-04-2025, MIT License.

import { type Result } from "./common.js";
import { AssignNode, BinaryNode, binaryTable, BooleanNode, CallNode, CallVoidNode, EmptyStmtNode, ExprStmtNode, FileNode, GetPropNode, IdentNode,
         IndexNode, ListNode, NegativeNode, NumberNode, SetPropNode, StaticMethodNode, StringNode, VarDeclNode, Visitor } from "./ast.js";
import { classNames, names } from "./vm.js"
import { type Type, Class, FunctionT, OverloadT, numberT, ListT, stringT, booleanT, nothingT } from "./literal/type.js"

function error(line: number, message: string): never {
    let result = `type: ${ line }: ${ message }\n`;
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

    visitEmptyStmt(node: EmptyStmtNode): Type {
        return nothingT;
    }

    visitExprStmt(node: ExprStmtNode): Type {
        return node.expr.visit(this);
    }

    visitStaticMethod(node: StaticMethodNode): Type {
        if (Object.hasOwn(classNames, node.obj.name)) {
            let type = classNames[node.obj.name].value;
            if (Object.hasOwn(type.statics, node.method)) {
                return type.statics[node.method].type;
            }
            error(node.line, `no static ${ node.method } in ${ node.obj.name } class`);
        }
        error(node.line, `no ${ node.obj.name } class`);
    }

    visitGetProp(node: GetPropNode): Type {
        let objType = node.obj.visit(this);
        if (!(objType instanceof Class))
            error(node.line, "cannot get property of non-class");

        if (Object.hasOwn(objType.fields, node.prop)) {
            node.isField = true;
            return objType.fields[node.prop];
        }

        if (Object.hasOwn(objType.methods, node.prop)) {
            node.isField = false;
            return objType.methods[node.prop].type;
        }

        error(node.line, `no property ${ node.prop } in obj`);
    }

    visitSetProp(node: SetPropNode): Type {
        let objType = node.obj.visit(this);
        if (!(objType instanceof Class))
            error(node.line, "cannot get property of non-class");

        let fields = objType.fields;
        if (!Object.hasOwn(fields, node.prop))
            error(node.line, `no property ${ node.prop } in obj`);

        let fieldType = fields[node.prop];
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
        if (fnType instanceof OverloadT) {
            let input: Type[] = [];
            node.args.forEach(arg => input.push(arg.visit(this)));
            let [ver, type] = overload(input, fnType, node.line);
            node.ver = ver;
            return type;
        }
        error(node.name.line, `${node.name} is not a function`);
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
        let got = new FunctionT(input, output, []);
        if (sig.equal(got))
            return [i, output];
    }
    error(line, "no matching fn sig");
}

// TODO: Change this later.
let tempNames: Record<string, { type: Type, mut?: boolean }> = {};

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
