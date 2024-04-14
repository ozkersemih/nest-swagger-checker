import {
  Decorator,
  MethodDeclaration,
  ParameterDeclaration, StringLiteral,
} from 'ts-morph';
import {
  checkProperty,
} from "./propertyOperations";
import {getPropertiesOfType} from "./typeOperations";
import {getPropertiesOfDecorator, isFieldOfDecoratorMatch, isFieldOfDecoratorNull} from "./decoratorOperations";
import {
  logApiParamDecoratorNotMatchedField,
  logApiParamDecoratorNullField,
  logNoApiParamDecorator,
  logNoMatchedApiParamDecorator
} from "./logOperations";
import {getConfigField} from "./configOperations";

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

  const matchedApiParamDecorator = getMatchedApiParamDecorator(method.getDecorators().filter(decorator => decorator.getName() === 'ApiParam'),apiParamOfMethod);

  const shouldCheckParamDescription = getConfigField("scopes.endpoint.params.description.check");
  if (shouldCheckParamDescription && isFieldOfDecoratorNull('description',matchedApiParamDecorator)){
    logApiParamDecoratorNullField(matchedApiParamDecorator,apiParamOfMethod,'description');
  }

  const paramDescriptionPattern = getConfigField("scopes.endpoint.params.description.pattern");
  if (paramDescriptionPattern && !isFieldOfDecoratorMatch('description',matchedApiParamDecorator,paramDescriptionPattern)){
    logApiParamDecoratorNotMatchedField(matchedApiParamDecorator,apiParamOfMethod,'description');
  }

  const shouldCheckParamExample = getConfigField("scopes.endpoint.params.example.check");
  if (shouldCheckParamExample && isFieldOfDecoratorNull('example',matchedApiParamDecorator)){
    logApiParamDecoratorNullField(matchedApiParamDecorator,apiParamOfMethod,'example');
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

  const matched = getMatchedApiParamDecorator(apiParamDecorators,apiParamParameter);

  if (matched) return true;
  return false;
}

function getMatchedApiParamDecorator(apiParamDecorators: Decorator[],apiParamParameter: ParameterDeclaration){
  const matched = apiParamDecorators.filter((apiParamDecorator => {
    const decoratorProperties = getPropertiesOfDecorator(apiParamDecorator);
    const argumentValueOfApiParam = (apiParamParameter.getDecorator('Param').getArguments()[0] as StringLiteral).getLiteralValue();
    if (decoratorProperties['name'] === (argumentValueOfApiParam)){
      return apiParamDecorator;
    }
  }))
  return matched[0] ?? undefined;
}

