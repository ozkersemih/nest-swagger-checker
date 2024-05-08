"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkApiPropertyDecoratorOfProperty = exports.checkProperty = exports.getDecoratorOfProperty = exports.getPropertyDeclarationOfProperty = void 0;
const ts_morph_1 = require("ts-morph");
const logOperations_1 = require("./logOperations");
const configOperations_1 = require("./configOperations");
const decoratorOperations_1 = require("./decoratorOperations");
const typeOperations_1 = require("./typeOperations");
function getPropertyDeclarationOfProperty(property) {
    return property
        .getDeclarations()
        .filter((declaration) => ts_morph_1.Node.isPropertyDeclaration(declaration))[0];
}
exports.getPropertyDeclarationOfProperty = getPropertyDeclarationOfProperty;
function getDecoratorOfProperty(propertyField, decName) {
    let decorator;
    propertyField.getDeclarations().map((declaration) => {
        if (ts_morph_1.Node.isPropertyDeclaration(declaration)) {
            if (declaration.getDecorator(decName)) {
                decorator = declaration.getDecorator(decName);
            }
        }
    });
    return decorator;
}
exports.getDecoratorOfProperty = getDecoratorOfProperty;
function checkProperty(property) {
    const propertyDeclaration = getPropertyDeclarationOfProperty(property);
    const doesFieldIsClassProperty = propertyDeclaration !== undefined;
    if (!doesFieldIsClassProperty) {
        return;
    }
    if ((0, typeOperations_1.isComplexType)(propertyDeclaration.getType()) &&
        !(0, typeOperations_1.isEnumType)(propertyDeclaration.getType())) {
        const propertiesOfProperty = (0, typeOperations_1.getPropertiesOfType)(propertyDeclaration.getType());
        propertiesOfProperty?.map((property) => checkProperty(property));
    }
    checkApiPropertyDecoratorOfProperty(property);
}
exports.checkProperty = checkProperty;
function checkApiPropertyDecoratorOfProperty(property) {
    const propertyDeclaration = getPropertyDeclarationOfProperty(property);
    const apiPropertyDecorator = getDecoratorOfProperty(property, 'ApiProperty');
    if (!apiPropertyDecorator) {
        (0, logOperations_1.collectError)(propertyDeclaration, `The '${propertyDeclaration.getName()}' field does not have ApiProperty tag to describe information's`);
        return;
    }
    checkApiPropertyDecoratorValuesOfProperty(property, apiPropertyDecorator);
}
exports.checkApiPropertyDecoratorOfProperty = checkApiPropertyDecoratorOfProperty;
function checkApiPropertyDecoratorValuesOfProperty(property, apiPropertyDecorator) {
    const checkDesc = (0, configOperations_1.getConfigField)('scopes.endpoint.payload.description.check');
    const checkExample = (0, configOperations_1.getConfigField)('scopes.endpoint.payload.example.check');
    const checkType = (0, configOperations_1.getConfigField)('scopes.endpoint.payload.type.check');
    const decoratorProperties = (0, decoratorOperations_1.getPropertiesOfDecorator)(apiPropertyDecorator);
    if (checkDesc) {
        checkDescriptionOfProperty(decoratorProperties['description'], property, apiPropertyDecorator);
    }
    if (checkExample) {
        checkExampleOfProperty(decoratorProperties['example'], property, apiPropertyDecorator);
    }
    if (checkType) {
        checkTypeOfProperty(decoratorProperties['type'], property, apiPropertyDecorator);
    }
}
function checkDescriptionOfProperty(description, field, decorator) {
    if ((0, decoratorOperations_1.isFieldOfDecoratorNull)('description', decorator)) {
        const errorText = `The '${field.getName()}' field does not have 'description'`;
        (0, logOperations_1.collectError)(decorator, errorText);
        return;
    }
    const pattern = (0, configOperations_1.getConfigField)('scopes.endpoint.payload.description.pattern');
    if (pattern && !(0, decoratorOperations_1.isFieldOfDecoratorMatch)('description', decorator, pattern)) {
        const errorText = `'description' value of '${field.getName()}' field did not match given pattern`;
        (0, logOperations_1.collectError)(decorator, errorText);
    }
}
function checkExampleOfProperty(example, field, decorator) {
    if ((0, decoratorOperations_1.isFieldOfDecoratorNull)('example', decorator)) {
        const errorText = `The '${field.getName()}' field does not have 'example'`;
        (0, logOperations_1.collectError)(decorator, errorText);
    }
}
function checkTypeOfProperty(_type, field, decorator) {
    if ((0, decoratorOperations_1.isFieldOfDecoratorNull)('type', decorator)) {
        const errorText = `The '${field.getName()}' field does not have 'type'`;
        (0, logOperations_1.collectError)(decorator, errorText);
    }
}
