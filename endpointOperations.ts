import { Decorator, MethodDeclaration } from 'ts-morph';
import {
  getPropertiesOfDecorator,
  isFieldOfDecoratorEmpty,
  isFieldOfDecoratorMatch,
  methodHasInformationDecorator,
} from './decoratorOperations';
import {
  logEndpointEmptyDescription,
  logEndpointEmptySummary,
  logInvalidEndpointDescription,
  logInvalidEndpointSummary,
  logNoApiOperation,
} from './logOperations';
import { getConfig } from './configOperations';

export function checkEndpointInformations(method: MethodDeclaration) {
  const decorators = method.getDecorators();

  if (!methodHasInformationDecorator(method, decorators)) {
    logNoApiOperation(method.getSourceFile(), method);
  }

  if (methodHasInformationDecorator(method, decorators)) {
    checkInformationProps(method);
  }
}

function checkInformationProps(method: MethodDeclaration) {
  const apiOperationDec = method.getDecorator('ApiOperation');

  checkSummary(apiOperationDec);
  checkDescription(apiOperationDec);
}

function checkSummary(apiOperationDec: Decorator) {
  const config = getConfig();
  const shouldCheckSummaryEmptiness = config.scopes.endpoint.summary.checkEmpty;
  const shouldCheckSummaryPattern = config.scopes.endpoint.summary.pattern
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
      `${config.scopes.endpoint.summary.pattern}`,
    );
    if (!isFieldOfDecoratorMatch('summary', apiOperationDec, patternRegex)) {
      logInvalidEndpointSummary(lineInfo, sourceFile);
    }
  }
}

function checkDescription(apiOperationDec: Decorator) {
  const config = getConfig();
  const shouldCheckDescriptionEmptiness =
    config.scopes.endpoint.description.checkEmpty;
  const shouldCheckDescPattern = config.scopes.endpoint.description.pattern
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
      `${config.scopes.endpoint.description.pattern}`,
    );
    if (
      !isFieldOfDecoratorMatch('description', apiOperationDec, patternRegex)
    ) {
      logInvalidEndpointDescription(lineInfo, sourceFile);
    }
  }
}
