"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFieldOfDecoratorMatch = exports.isFieldOfDecoratorEmpty = exports.isFieldOfDecoratorNull = exports.getPropertiesOfDecorator = void 0;
const ts_morph_1 = require("ts-morph");
function getPropertiesOfDecorator(decorator) {
    const properties = {};
    const argumentObject = decorator.getArguments()[0];
    if (ts_morph_1.Node.isObjectLiteralExpression(argumentObject)) {
        argumentObject.getProperties().map((property) => {
            if (ts_morph_1.Node.isPropertyAssignment(property)) {
                const propertyKey = property.getName();
                const propertyValue = property.getInitializer();
                if (ts_morph_1.Node.isStringLiteral(propertyValue)) {
                    properties[propertyKey] = propertyValue.getLiteralValue();
                }
                else {
                    properties[propertyKey] = 'NOT_EMPTY';
                }
            }
        });
    }
    return properties;
}
exports.getPropertiesOfDecorator = getPropertiesOfDecorator;
function isFieldOfDecoratorNull(fieldName, decorator) {
    const decoratorFields = getPropertiesOfDecorator(decorator);
    if (decoratorFields[fieldName]) {
        return false;
    }
    return true;
}
exports.isFieldOfDecoratorNull = isFieldOfDecoratorNull;
function isFieldOfDecoratorEmpty(fieldName, decorator) {
    const decoratorFields = getPropertiesOfDecorator(decorator);
    if (!isFieldOfDecoratorNull(fieldName, decorator) &&
        decoratorFields[fieldName] === '') {
        return true;
    }
    return false;
}
exports.isFieldOfDecoratorEmpty = isFieldOfDecoratorEmpty;
function isFieldOfDecoratorMatch(fieldName, decorator, pattern) {
    const decoratorFields = getPropertiesOfDecorator(decorator);
    const patternRegex = new RegExp(pattern);
    if (!isFieldOfDecoratorEmpty(fieldName, decorator) &&
        patternRegex.test(decoratorFields[fieldName])) {
        return true;
    }
    return false;
}
exports.isFieldOfDecoratorMatch = isFieldOfDecoratorMatch;
