import { BinaryTable } from "./ast.js";
import { names } from "./vm.js";
import { FunctionT, OverloadT, numberT, ListT, stringT, booleanT, nothingT } from "./literal/type.js";
function error(line, message) {
    let result = "type: " + line + ": " + message;
    throw new Error(result);
}
function assertType(expected, got, line) {
    if (!expected.equal(got))
        error(line, `expected ${expected.to_str()}, got ${got.to_str()}`);
}
function resolveVar(name, line) {
    if (Object.hasOwn(names, name))
        return names[name].type;
    else if (Object.hasOwn(tempNames, name))
        return tempNames[name].type;
    else
        error(line, `undefined name ${name}`);
}
class TypeChecker {
    visitNumber(node) {
        return numberT;
    }
    visitList(node) {
        let elType = node.items[0].visit(this);
        for (let i = 1; i < node.items.length; i++) {
            assertType(elType, node.items[i].visit(this), node.line);
        }
        node.elType = elType;
        return new ListT(elType);
    }
    visitIndex(node) {
        let listType = node.list.visit(this);
        if (!(listType instanceof ListT))
            error(node.line, "attempt to index non-list");
        let index = node.index.visit(this);
        assertType(index, numberT, node.line);
        return listType.elType;
    }
    visitString(node) {
        return stringT;
    }
    visitBoolean(node) {
        return booleanT;
    }
    visitBinary(node) {
        let type = BinaryTable[node.op].type;
        assertType(type, node.left.visit(this), node.left.line);
        assertType(type, node.right.visit(this), node.right.line);
        return type;
    }
    visitIdent(node) {
        return resolveVar(node.name, node.line);
    }
    visitAssign(node) {
        let varType = node.left.visit(this);
        let valueType = node.right.visit(this);
        assertType(varType, valueType, node.right.line);
        return nothingT;
    }
    visitVarDecl(node) {
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
    visitExprStmt(node) {
        return node.expr.visit(this);
    }
    visitGetProp(node) {
        let objType = node.obj.visit(this);
        if (!("field" in objType))
            error(node.line, "no obj");
        let field = objType.field;
        if (!Object.hasOwn(field, node.prop))
            error(node.line, `no prop ${node.prop} in obj`);
        return field[node.prop];
    }
    visitSetProp(node) {
        let objType = node.obj.visit(this);
        if (!("field" in objType))
            error(node.line, "no obj");
        let field = objType.field;
        if (!Object.hasOwn(field, node.prop))
            error(node.line, `no prop ${node.prop} in obj`);
        let fieldType = field[node.prop];
        let valueType = node.value.visit(this);
        assertType(fieldType, valueType, node.value.line);
        return nothingT;
    }
    visitFile(node) {
        node.stmts.forEach(stmt => stmt.visit(this));
        return nothingT;
    }
    visitCall(node) {
        let fnType = node.callee.visit(this);
        console.log(fnType);
        if (!(fnType instanceof OverloadT))
            error(node.callee.line, `${node.callee} is not a function`);
        let input = [];
        node.args.forEach(arg => input.push(arg.visit(this)));
        let [ver, type] = overload(input, fnType, node.line);
        node.ver = ver;
        return type;
    }
    visitCallVoid(node) {
        let returnT = node.node.visit(this);
        if (!nothingT.equal(returnT))
            error(node.line, "unused return value");
        return nothingT;
    }
}
function overload(input, fn, line) {
    for (let i = 0; i < fn.sigs.length; i++) {
        let sig = fn.sigs[i];
        let output = sig.output;
        let got = new FunctionT(input, output);
        if (sig.equal(got))
            return [i, output];
    }
    error(line, "no matching fn sig");
}
let tempNames = {};
export function typecheck(ast) {
    tempNames = {};
    let typeChecker = new TypeChecker();
    try {
        ast.visit(typeChecker);
        return {
            ok: true,
            value: tempNames,
        };
    }
    catch (error) {
        return {
            ok: false,
            error: (error instanceof Error) ? error : new Error("unknown error"),
        };
    }
}
