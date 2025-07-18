import { binaryTable } from "./ast.js";
import { classNames, names } from "./vm.js";
import { ClassT, FunctionT, OverloadT, numberT, ListT, stringT, booleanT, nothingT } from "./literal/type.js";
function error(line, message) {
    let result = `type: ${line}: ${message}\n`;
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
    visitNegative(node) {
        let type = node.right.visit(this);
        assertType(type, numberT, node.line);
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
        let type = binaryTable[node.op].result;
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
    visitEmptyStmt(node) {
        return nothingT;
    }
    visitExprStmt(node) {
        return node.expr.visit(this);
    }
    visitStaticMethod(node) {
        if (Object.hasOwn(classNames, node.obj.name)) {
            let type = classNames[node.obj.name].value;
            if (Object.hasOwn(type.statics, node.method)) {
                return type.statics[node.method].type;
            }
            error(node.line, `no static ${node.method} in ${node.obj.name} class`);
        }
        error(node.line, `no ${node.obj.name} class`);
    }
    visitGetProp(node) {
        let objType = node.obj.visit(this);
        if (!(objType instanceof ClassT))
            error(node.line, "cannot get property of non-class");
        if (Object.hasOwn(objType.fields, node.prop)) {
            node.isField = true;
            return objType.fields[node.prop];
        }
        if (Object.hasOwn(objType.methods, node.prop)) {
            node.isField = false;
            return objType.methods[node.prop].type;
        }
        error(node.line, `no property ${node.prop} in obj`);
    }
    visitSetProp(node) {
        let objType = node.obj.visit(this);
        if (!(objType instanceof ClassT))
            error(node.line, "cannot get property of non-class");
        let fields = objType.fields;
        if (!Object.hasOwn(fields, node.prop))
            error(node.line, `no property ${node.prop} in obj`);
        let fieldType = fields[node.prop];
        let valueType = node.value.visit(this);
        assertType(fieldType, valueType, node.value.line);
        return nothingT;
    }
    visitFile(node) {
        node.stmts.forEach(stmt => stmt.visit(this));
        return nothingT;
    }
    visitCall(node) {
        let fnType = node.name.visit(this);
        if (fnType instanceof OverloadT) {
            let input = [];
            node.args.forEach(arg => input.push(arg.visit(this)));
            let [ver, type] = overload(input, fnType, node.line);
            node.ver = ver;
            return type;
        }
        error(node.name.line, `${node.name} is not a function`);
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
        let got = new FunctionT(input, output, []);
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
