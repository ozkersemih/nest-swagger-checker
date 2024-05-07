import { Decorator, MethodDeclaration } from 'ts-morph';
import {
  isFieldOfDecoratorEmpty,
  isFieldOfDecoratorMatch,
} from './decoratorOperations';
import {
  logEndpointEmptyDescription,
  logEndpointEmptySummary,
  logInvalidEndpointDescription,
  logInvalidEndpointSummary,
  logNoApiOperation,
  collectError,
} from './logOperations';
import {getConfigField} from './configOperations';
import {checkApiParamParameterOfMethod, checkMethodParam, hasMethodApiOperationDecorator} from "./methodOperations";
import {hasBodyOrQueryDecorator, hasClassType, hasParamDecorator, isComplexParam} from "./parameterOperations";

export function checkEndpointInformations(method: MethodDeclaration) {
  const decorators = method.getDecorators();

  if (!hasMethodApiOperationDecorator(method, decorators)) {
    // TODO: Make message a constant
    collectError(method, "The endpoint method has no ApiOperation tag to describe endpoint informations");
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

  const sourceFile = apiOperationDec.getSourceFile();
  const lineInfo = sourceFile.getLineAndColumnAtPos(apiOperationDec.getStart());
  if (
    shouldCheckSummaryEmptiness &&
    isFieldOfDecoratorEmpty('summary', apiOperationDec)
  ) {
    logEndpointEmptySummary(lineInfo, sourceFile);
  }

  if (shouldCheckSummaryPattern) {
    const patternRegex = new RegExp(
      `${getConfigField('scopes.endpoint.summary.pattern')}`,
    );
    if (!isFieldOfDecoratorMatch('summary', apiOperationDec, patternRegex)) {
      logInvalidEndpointSummary(lineInfo, sourceFile);
    }
  }
}

function checkDescription(apiOperationDec: Decorator) {
  const shouldCheckDescriptionEmptiness = getConfigField('scopes.endpoint.description.checkEmpty');
  const shouldCheckDescPattern = getConfigField('scopes.endpoint.description.pattern')
    ? true
    : false;

  const sourceFile = apiOperationDec.getSourceFile();
  const lineInfo = sourceFile.getLineAndColumnAtPos(apiOperationDec.getStart());
  if (
    shouldCheckDescriptionEmptiness &&
    isFieldOfDecoratorEmpty('description', apiOperationDec)
  ) {
    logEndpointEmptyDescription(lineInfo, sourceFile);
  }

  if (shouldCheckDescPattern) {
    const patternRegex = new RegExp(
      `${getConfigField('scopes.endpoint.description.pattern')}`,
    );
    if (
      !isFieldOfDecoratorMatch('description', apiOperationDec, patternRegex)
    ) {
      logInvalidEndpointDescription(lineInfo, sourceFile);
    }
  }
}
