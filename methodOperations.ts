import {
  Decorator,
  MethodDeclaration,
  ParameterDeclaration, StringLiteral,
} from 'ts-morph';
import {
  checkProperty,
} from "./propertyOperations";
import {getPropertiesOfType} from "./typeOperations";
import {getPropertiesOfDecorator} from "./decoratorOperations";
import {logNoApiParamDecorator, logNoMatchedApiParamDecorator} from "./logOperations";

export function checkMethodParam(methodParam: ParameterDeclaration) {
  const propertiesOfMethodParam = getPropertiesOfType(methodParam.getType());
  propertiesOfMethodParam?.map((property) => {
    checkProperty(property);
  });
}

export function checkApiParamParameterOfMethod(apiParamOfMethod: ParameterDeclaration, method: MethodDeclaration){
  if (!hasMethodApiParamDecorator(method)){
    logNoApiParamDecorator(method);
  }

  if (!hasMethodApiParamDecoratorForApiParam(method,apiParamOfMethod)){
    logNoMatchedApiParamDecorator(method,apiParamOfMethod);
  }
}

export function hasMethodApiOperationDecorator(
    method: MethodDeclaration,
    decorators: Decorator[],
): boolean {
  if (decorators.some((decorator) => decorator.getName() === 'ApiOperation')) {
    return true;
  }
  return false;
}

function hasMethodApiParamDecorator(
    method: MethodDeclaration,
): boolean {
  if (method.getDecorators().some((decorator) => decorator.getName() === 'ApiParam')) {
    return true;
  }
  return false;
}

export function hasMethodApiParamDecoratorForApiParam(
    method: MethodDeclaration,
    apiParamParameter: ParameterDeclaration
): boolean {
  const apiParamDecorators = method.getDecorators().filter(decorator => decorator.getName() === 'ApiParam');
  if (!apiParamDecorators) {
    return false;
  }

  const matched = apiParamDecorators.filter((apiParamDecorator => {
    const decoratorProperties = getPropertiesOfDecorator(apiParamDecorator);
    const argumentValueOfApiParam = (apiParamParameter.getDecorator('Param').getArguments()[0] as StringLiteral).getLiteralValue();
    if (decoratorProperties['name'] === (argumentValueOfApiParam)){
      return apiParamDecorator;
    }
  }))

  if (matched.length === 1) return true;
  return false;
}

