import {
  Decorator,
  MethodDeclaration,
  PropertyDeclaration,
  Symbol,
  SourceFile, ParameterDeclaration,
  Node,
} from 'ts-morph';

import { OPTIONS, STATE } from './globals';

export function collectError(node: Node, errorText: string) {
  const file = node.getSourceFile();
  const lineInfo = file.getLineAndColumnAtPos(node.getStart());

  if (OPTIONS.interactive) {
    const annotatedPath = `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column}`;
    console.log(`${annotatedPath} ${errorText}`)
  }

  STATE.push({
    file: file.getFilePath(),
    line: lineInfo.line,
    col: lineInfo.column,
    description: errorText,
    node,
  })
}

export function logNoApiProperty(declaration: PropertyDeclaration) {
  const file = declaration.getSourceFile();
  const lineInfo = file.getLineAndColumnAtPos(declaration.getStart());
  const propName = declaration.getName();
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    `The '${propName}' field does not have ApiProperty tag to describe information's`;
  console.log(logText);

  found.push({
    file: file.getFilePath(),
    line: lineInfo.line,
    col: lineInfo.column
  })
}

export function logEndpointEmptySummary(
  lineInfo: { line: number; column: number },
  file: SourceFile,
) {
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    'Summary of endpoint is empty';
  console.log(logText);

  found.push({
    file: file.getFilePath(),
    line: lineInfo.line,
    col: lineInfo.column
  })
}

export function logInvalidEndpointSummary(
  lineInfo: { line: number; column: number },
  file: SourceFile,
) {
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    'Summary of endpoint did not match given pattern';
  console.log(logText);

  found.push({
    file: file.getFilePath(),
    line: lineInfo.line,
    col: lineInfo.column
  })
}

export function logInvalidEndpointDescription(
  lineInfo: { line: number; column: number },
  file: SourceFile,
) {
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    'Description of endpoint did not match given pattern';
  console.log(logText);

  found.push({
    file: file.getFilePath(),
    line: lineInfo.line,
    col: lineInfo.column
  })
}

export function logEndpointEmptyDescription(
  lineInfo: { line: number; column: number },
  file: SourceFile,
) {
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    'Description of endpoint is empty';
  console.log(logText);

  found.push({
    file: file.getFilePath(),
    line: lineInfo.line,
    col: lineInfo.column
  })
}

export function logApiPropertyNullField(apiPropertyDecorator: Decorator, apiPropertyFieldName: string, field: Symbol){
  const lineInfo = apiPropertyDecorator
      .getSourceFile()
      .getLineAndColumnAtPos(apiPropertyDecorator.getStartLinePos());

  console.log(
      `file://${apiPropertyDecorator.getSourceFile().getFilePath()}:${lineInfo.line}:${
          lineInfo.column
      }`,
      `The '${field.getName()}' field does not have ${apiPropertyFieldName}`,
  );

  found.push({
    file: apiPropertyDecorator.getSourceFile().getFilePath(),
    line: lineInfo.line,
    col: lineInfo.column
  })
}

export function logApiPropertyNotMatchField(apiPropertyDecorator: Decorator, apiPropertyFieldName: string, field: Symbol){
  const lineInfo = apiPropertyDecorator
      .getSourceFile()
      .getLineAndColumnAtPos(apiPropertyDecorator.getStartLinePos());


  console.log(
      `file://${apiPropertyDecorator.getSourceFile().getFilePath()}:${lineInfo.line}:${
          lineInfo.column
      }`,
      `${apiPropertyFieldName} value of '${field.getName()}' field did not match given pattern`,
  );

  found.push({
    file: apiPropertyDecorator.getSourceFile().getFilePath(),
    line: lineInfo.line,
    col: lineInfo.column
  })
}

export function logNoApiParamDecorator(method: MethodDeclaration){
  const lineInfo = method.getSourceFile().getLineAndColumnAtPos(method.getStartLinePos());
  const filePath = method.getSourceFile().getFilePath();

  console.log(`file://${filePath}:${lineInfo.line}:${lineInfo.column}`,`'${method.getName()}' method does not have ApiParam decorator but it has parameter with @Param decorator`);

  found.push({
    file: filePath,
    line: lineInfo.line,
    col: lineInfo.column
  })
}

export function logNoMatchedApiParamDecorator(method: MethodDeclaration, apiParamOfMethod: ParameterDeclaration){
  const lineInfo = method.getSourceFile().getLineAndColumnAtPos(method.getStartLinePos());
  const filePath = method.getSourceFile().getFilePath();

  console.log(`file://${filePath}:${lineInfo.line}:${lineInfo.column}`,`'${method.getName()}' method does not have ApiParam decorator that matched with '${apiParamOfMethod.getName()}' param`);

  found.push({
    file: filePath,
    line: lineInfo.line,
    col: lineInfo.column
  })
}

export function logApiParamDecoratorNullField(apiParamDecorator: Decorator, apiParamOfMethod: ParameterDeclaration, fieldName:string){
  const lineInfo = apiParamDecorator.getSourceFile().getLineAndColumnAtPos(apiParamDecorator.getStartLinePos());
  const filePath = apiParamDecorator.getSourceFile().getFilePath();

  console.log(`file://${filePath}:${lineInfo.line}:${lineInfo.column}`,`ApiParam decorator of '${apiParamOfMethod.getName()}' parameter does not have ${fieldName}`);

  found.push({
    file: filePath,
    line: lineInfo.line,
    col: lineInfo.column
  })
}

export function logApiParamDecoratorNotMatchedField(apiParamDecorator: Decorator, apiParamOfMethod: ParameterDeclaration, fieldName: string){
  const lineInfo = apiParamDecorator.getSourceFile().getLineAndColumnAtPos(apiParamDecorator.getStartLinePos());
  const filePath = apiParamDecorator.getSourceFile().getFilePath();

  console.log(`file://${filePath}:${lineInfo.line}:${lineInfo.column}`,`${fieldName} in ApiParam decorator of '${apiParamOfMethod.getName()}' parameter did not match with given pattern`);

  found.push({
    file: filePath,
    line: lineInfo.line,
    col: lineInfo.column
  })
}
