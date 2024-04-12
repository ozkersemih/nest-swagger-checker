import {
  MethodDeclaration,
  PropertyDeclaration,
  PropertySignature,
  SourceFile,
} from 'ts-morph';

export function logNoApiOperation(file: SourceFile, method: MethodDeclaration) {
  const lineInfo = file.getLineAndColumnAtPos(method.getStart());
  const logText =
    `${file.getFilePath()}:${lineInfo.line}:${lineInfo.column}` +
    'The endpoint method has no ApiOperation tag to describe endpoint informations';
  console.log(logText);
}

export function logNoApiProperty(declaration: PropertyDeclaration) {
  const file = declaration.getSourceFile();
  const lineInfo = file.getLineAndColumnAtPos(declaration.getStart());
  const propName = declaration.getName();
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    `The '${propName}' field does not have ApiProperty tag to describe informations`;
  console.log(logText);
  return logText;
}

export function logEndpointEmptySummary(
  lineInfo: { line: number; column: number },
  file: SourceFile,
) {
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    'Summary of endpoint is empty';
  console.log(logText);
}

export function logInvalidEndpointSummary(
  lineInfo: { line: number; column: number },
  file: SourceFile,
) {
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    'Summary of endpoint did not match given pattern';
  console.log(logText);
}

export function logInvalidEndpointDescription(
  lineInfo: { line: number; column: number },
  file: SourceFile,
) {
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    'Description of endpoint did not match given pattern';
  console.log(logText);
}

export function logEndpointEmptyDescription(
  lineInfo: { line: number; column: number },
  file: SourceFile,
) {
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    'Description of endpoint is empty';
  console.log(logText);
}