import { Decorator, MethodDeclaration } from 'ts-morph';
import {
  isFieldOfDecoratorEmpty,
  isFieldOfDecoratorMatch,
} from './decoratorOperations';
import {
  collectError,
} from './logOperations';
import {getConfigField} from './configOperations';
import {checkApiParamParameterOfMethod, checkMethodParam, hasMethodApiOperationDecorator} from "./methodOperations";
import {hasBodyOrQueryDecorator, hasClassType, hasParamDecorator, isComplexParam} from "./parameterOperations";

export function checkEndpointInformations(method: MethodDeclaration) {
  const decorators = method.getDecorators();

  if (!hasMethodApiOperationDecorator(method, decorators)) {
    const errorText:string = "The endpoint method has no ApiOperation tag to describe endpoint informations";
    collectError(method, errorText);
  }

  if (hasMethodApiOperationDecorator(method, decorators)) {
    checkInformationProps(method);
  }
}


export function checkEndpointPayload(endpointMethod: MethodDeclaration){
  const payloadParametersOfMethod = endpointMethod.getParameters().filter(parameter => {
    if (hasBodyOrQueryDecorator(parameter) && isComplexParam(parameter) && hasClassType(parameter)){
      return parameter;
    }
  })
  payloadParametersOfMethod.map(payloadParam => checkMethodParam(payloadParam));
}

export function checkEndpointParam(endpointMethod: MethodDeclaration){
  const apiParamParametersOfMethod = endpointMethod.getParameters().filter(methodParameter => {
    if (hasParamDecorator(methodParameter)){
      return methodParameter;
    }
  })
  apiParamParametersOfMethod.map(apiParamParameter => checkApiParamParameterOfMethod(apiParamParameter,endpointMethod))
}

function checkInformationProps(method: MethodDeclaration) {
  const apiOperationDec = method.getDecorator('ApiOperation');

  checkSummary(apiOperationDec);
  checkDescription(apiOperationDec);
}

function checkSummary(apiOperationDec: Decorator) {
  const shouldCheckSummaryEmptiness =  getConfigField('scopes.endpoint.summary.checkEmpty');
  const shouldCheckSummaryPattern = getConfigField('scopes.endpoint.summary.pattern')
    ? true
    : false;

  if (
    shouldCheckSummaryEmptiness &&
    isFieldOfDecoratorEmpty('summary', apiOperationDec)
  ) {
    const errorText = 'Summary of endpoint is empty';
    collectError(apiOperationDec, errorText);
  }

  if (shouldCheckSummaryPattern) {
    const patternRegex = new RegExp(
      `${getConfigField('scopes.endpoint.summary.pattern')}`,
    );
    if (!isFieldOfDecoratorMatch('summary', apiOperationDec, patternRegex)) {
      const errorText: string = 'Summary of endpoint did not match given pattern'
      collectError(apiOperationDec, errorText);
    }
  }
}

function checkDescription(apiOperationDec: Decorator) {
  const shouldCheckDescriptionEmptiness = getConfigField('scopes.endpoint.description.checkEmpty');
  const shouldCheckDescPattern = getConfigField('scopes.endpoint.description.pattern')
    ? true
    : false;

  if (
    shouldCheckDescriptionEmptiness &&
    isFieldOfDecoratorEmpty('description', apiOperationDec)
  ) {
    const errorText:string = 'Description of endpoint is empty';
    collectError(apiOperationDec, errorText);
  }

  if (shouldCheckDescPattern) {
    const patternRegex = new RegExp(
      `${getConfigField('scopes.endpoint.description.pattern')}`,
    );
    if (
      !isFieldOfDecoratorMatch('description', apiOperationDec, patternRegex)
    ) {
      const errorText:string = 'Description of endpoint did not match given pattern';
      collectError(apiOperationDec, errorText);
    }
  }
}
