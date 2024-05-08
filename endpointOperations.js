"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEndpointParam = exports.checkEndpointPayload = exports.checkEndpointInformations = void 0;
const decoratorOperations_1 = require("./decoratorOperations");
const logOperations_1 = require("./logOperations");
const configOperations_1 = require("./configOperations");
const methodOperations_1 = require("./methodOperations");
const parameterOperations_1 = require("./parameterOperations");
function checkEndpointInformations(method) {
    const decorators = method.getDecorators();
    if (!(0, methodOperations_1.hasMethodApiOperationDecorator)(method, decorators)) {
        const errorText = "The endpoint method has no ApiOperation tag to describe endpoint informations";
        (0, logOperations_1.collectError)(method, errorText);
    }
    if ((0, methodOperations_1.hasMethodApiOperationDecorator)(method, decorators)) {
        checkInformationProps(method);
    }
}
exports.checkEndpointInformations = checkEndpointInformations;
function checkEndpointPayload(endpointMethod) {
    const payloadParametersOfMethod = endpointMethod.getParameters().filter(parameter => {
        if ((0, parameterOperations_1.hasBodyOrQueryDecorator)(parameter) && (0, parameterOperations_1.isComplexParam)(parameter) && (0, parameterOperations_1.hasClassType)(parameter)) {
            return parameter;
        }
    });
    payloadParametersOfMethod.map(payloadParam => (0, methodOperations_1.checkMethodParam)(payloadParam));
}
exports.checkEndpointPayload = checkEndpointPayload;
function checkEndpointParam(endpointMethod) {
    const apiParamParametersOfMethod = endpointMethod.getParameters().filter(methodParameter => {
        if ((0, parameterOperations_1.hasParamDecorator)(methodParameter)) {
            return methodParameter;
        }
    });
    apiParamParametersOfMethod.map(apiParamParameter => (0, methodOperations_1.checkApiParamParameterOfMethod)(apiParamParameter, endpointMethod));
}
exports.checkEndpointParam = checkEndpointParam;
function checkInformationProps(method) {
    const apiOperationDec = method.getDecorator('ApiOperation');
    checkSummary(apiOperationDec);
    checkDescription(apiOperationDec);
}
function checkSummary(apiOperationDec) {
    const shouldCheckSummaryEmptiness = (0, configOperations_1.getConfigField)('scopes.endpoint.summary.checkEmpty');
    const shouldCheckSummaryPattern = (0, configOperations_1.getConfigField)('scopes.endpoint.summary.pattern')
        ? true
        : false;
    if (shouldCheckSummaryEmptiness &&
        (0, decoratorOperations_1.isFieldOfDecoratorEmpty)('summary', apiOperationDec)) {
        const errorText = 'Summary of endpoint is empty';
        (0, logOperations_1.collectError)(apiOperationDec, errorText);
    }
    if (shouldCheckSummaryPattern) {
        const patternRegex = new RegExp(`${(0, configOperations_1.getConfigField)('scopes.endpoint.summary.pattern')}`);
        if (!(0, decoratorOperations_1.isFieldOfDecoratorMatch)('summary', apiOperationDec, patternRegex)) {
            const errorText = 'Summary of endpoint did not match given pattern';
            (0, logOperations_1.collectError)(apiOperationDec, errorText);
        }
    }
}
function checkDescription(apiOperationDec) {
    const shouldCheckDescriptionEmptiness = (0, configOperations_1.getConfigField)('scopes.endpoint.description.checkEmpty');
    const shouldCheckDescPattern = (0, configOperations_1.getConfigField)('scopes.endpoint.description.pattern')
        ? true
        : false;
    if (shouldCheckDescriptionEmptiness &&
        (0, decoratorOperations_1.isFieldOfDecoratorEmpty)('description', apiOperationDec)) {
        const errorText = 'Description of endpoint is empty';
        (0, logOperations_1.collectError)(apiOperationDec, errorText);
    }
    if (shouldCheckDescPattern) {
        const patternRegex = new RegExp(`${(0, configOperations_1.getConfigField)('scopes.endpoint.description.pattern')}`);
        if (!(0, decoratorOperations_1.isFieldOfDecoratorMatch)('description', apiOperationDec, patternRegex)) {
            const errorText = 'Description of endpoint did not match given pattern';
            (0, logOperations_1.collectError)(apiOperationDec, errorText);
        }
    }
}
