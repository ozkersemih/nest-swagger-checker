"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMethodApiParamDecoratorForApiParam = exports.hasMethodApiOperationDecorator = exports.checkApiParamParameterOfMethod = exports.checkMethodParam = void 0;
const propertyOperations_1 = require("./propertyOperations");
const typeOperations_1 = require("./typeOperations");
const decoratorOperations_1 = require("./decoratorOperations");
const logOperations_1 = require("./logOperations");
const configOperations_1 = require("./configOperations");
function checkMethodParam(methodParam) {
    const propertiesOfMethodParam = (0, typeOperations_1.getPropertiesOfType)(methodParam.getType());
    propertiesOfMethodParam?.map((property) => {
        (0, propertyOperations_1.checkProperty)(property);
    });
}
exports.checkMethodParam = checkMethodParam;
function checkApiParamParameterOfMethod(apiParamOfMethod, method) {
    if (!hasMethodApiParamDecorator(method)) {
        const errorText = `'${method.getName()}' method does not have ApiParam decorator but it has parameter with @Param decorator`;
        (0, logOperations_1.collectError)(method, errorText);
        return;
    }
    if (!hasMethodApiParamDecoratorForApiParam(method, apiParamOfMethod)) {
        const errorText = `'${method.getName()}' method does not have ApiParam decorator that matched with '${apiParamOfMethod.getName()}' param`;
        (0, logOperations_1.collectError)(method, errorText);
        return;
    }
    const matchedApiParamDecorator = getMatchedApiParamDecorator(method.getDecorators().filter(decorator => decorator.getName() === 'ApiParam'), apiParamOfMethod);
    const shouldCheckParamDescription = (0, configOperations_1.getConfigField)("scopes.endpoint.params.description.check");
    if (shouldCheckParamDescription && (0, decoratorOperations_1.isFieldOfDecoratorNull)('description', matchedApiParamDecorator)) {
        const errorText = `ApiParam decorator of '${apiParamOfMethod.getName()}' parameter does not have 'description'`;
        (0, logOperations_1.collectError)(matchedApiParamDecorator, errorText);
    }
    const paramDescriptionPattern = (0, configOperations_1.getConfigField)("scopes.endpoint.params.description.pattern");
    if (paramDescriptionPattern && !(0, decoratorOperations_1.isFieldOfDecoratorMatch)('description', matchedApiParamDecorator, paramDescriptionPattern)) {
        const errorText = `'description' in ApiParam decorator of '${apiParamOfMethod.getName()}' parameter did not match with given pattern`;
        (0, logOperations_1.collectError)(matchedApiParamDecorator, errorText);
    }
    const shouldCheckParamExample = (0, configOperations_1.getConfigField)("scopes.endpoint.params.example.check");
    if (shouldCheckParamExample && (0, decoratorOperations_1.isFieldOfDecoratorNull)('example', matchedApiParamDecorator)) {
        const errorText = `'example' in ApiParam decorator of '${apiParamOfMethod.getName()}' parameter did not match with given pattern`;
        (0, logOperations_1.collectError)(matchedApiParamDecorator, errorText);
    }
}
exports.checkApiParamParameterOfMethod = checkApiParamParameterOfMethod;
function hasMethodApiOperationDecorator(method, decorators) {
    if (decorators.some((decorator) => decorator.getName() === 'ApiOperation')) {
        return true;
    }
    return false;
}
exports.hasMethodApiOperationDecorator = hasMethodApiOperationDecorator;
function hasMethodApiParamDecorator(method) {
    if (method.getDecorators().some((decorator) => decorator.getName() === 'ApiParam')) {
        return true;
    }
    return false;
}
function hasMethodApiParamDecoratorForApiParam(method, apiParamParameter) {
    const apiParamDecorators = method.getDecorators().filter(decorator => decorator.getName() === 'ApiParam');
    if (!apiParamDecorators) {
        return false;
    }
    const matched = getMatchedApiParamDecorator(apiParamDecorators, apiParamParameter);
    if (matched)
        return true;
    return false;
}
exports.hasMethodApiParamDecoratorForApiParam = hasMethodApiParamDecoratorForApiParam;
function getMatchedApiParamDecorator(apiParamDecorators, apiParamParameter) {
    const matched = apiParamDecorators.filter((apiParamDecorator => {
        const decoratorProperties = (0, decoratorOperations_1.getPropertiesOfDecorator)(apiParamDecorator);
        const argumentValueOfApiParam = apiParamParameter.getDecorator('Param').getArguments()[0].getLiteralValue();
        if (decoratorProperties['name'] === (argumentValueOfApiParam)) {
            return apiParamDecorator;
        }
    }));
    return matched[0] ?? undefined;
}
