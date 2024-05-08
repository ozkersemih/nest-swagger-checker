"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasClassType = exports.isComplexParam = exports.hasParamDecorator = exports.hasBodyOrQueryDecorator = void 0;
const ts_morph_1 = require("ts-morph");
function hasBodyOrQueryDecorator(param) {
    if (ts_morph_1.Node.isDecorator(param.getDecorator('Body')) ||
        ts_morph_1.Node.isDecorator(param.getDecorator('Query'))) {
        return true;
    }
    return false;
}
exports.hasBodyOrQueryDecorator = hasBodyOrQueryDecorator;
function hasParamDecorator(param) {
    if (ts_morph_1.Node.isDecorator(param.getDecorator('Param'))) {
        return true;
    }
    return false;
}
exports.hasParamDecorator = hasParamDecorator;
function isComplexParam(param) {
    if (param.getType().getSymbol()) {
        return true;
    }
    return false;
}
exports.isComplexParam = isComplexParam;
function hasClassType(param) {
    if (param.getType().isClass())
        return true;
    return false;
}
exports.hasClassType = hasClassType;
